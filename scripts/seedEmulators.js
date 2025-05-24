#!/usr/bin/env node

/**
 * Firebase Emulator Seeding Script
 * 
 * This script seeds Firebase emulators (Auth, Firestore) with test data for local development.
 * It creates various user accounts with different roles and populates Firestore collections
 * with sample data that mirrors the production schema.
 * 
 * Usage:
 *   node scripts/seedEmulators.js [options]
 * 
 * Options:
 *   --export         Export the seeded data for future use
 *   --export-path    Path to export the data (default: ./emulator-data)
 *   --clear          Clear all data before seeding
 *   --help           Show help information
 */

const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Initialize Firebase Admin with emulator connection
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

// Initialize without credentials as we're using emulators
admin.initializeApp({
  projectId: 'timberline-commerce'
});

const auth = getAuth();
const db = getFirestore();

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  export: args.includes('--export'),
  exportPath: args.includes('--export-path') 
    ? args[args.indexOf('--export-path') + 1] 
    : './emulator-data',
  clear: args.includes('--clear'),
  help: args.includes('--help')
};

if (options.help) {
  console.log(`
Firebase Emulator Seeding Script

Seeds Firebase emulators with test data for local development.

Usage:
  node scripts/seedEmulators.js [options]

Options:
  --export         Export the seeded data for future use
  --export-path    Path to export the data (default: ./emulator-data)
  --clear          Clear all data before seeding
  --help           Show this help information
  `);
  process.exit(0);
}

/**
 * Main function to seed the emulators
 */
async function seedEmulators() {
  console.log('🌱 Starting emulator seeding process...');
  
  try {
    // Clear data if requested
    if (options.clear) {
      console.log('🧹 Clearing existing data...');
      await clearEmulatorData();
    }
    
    // Seed users first (Auth)
    console.log('👤 Creating test users...');
    const userIds = await seedUsers();
    
    // Seed Firestore collections
    console.log('📄 Creating sample documents...');
    await seedFirestoreCollections(userIds);
    
    // Export data if requested
    if (options.export) {
      console.log(`💾 Exporting data to ${options.exportPath}...`);
      await exportEmulatorData(options.exportPath);
    }
    
    console.log('✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding emulators:', error);
    process.exit(1);
  }
}

/**
 * Clear all data from emulators
 */
async function clearEmulatorData() {
  try {
    // Clear Firestore collections
    const collections = await db.listCollections();
    for (const collection of collections) {
      const snapshot = await db.collection(collection.id).get();
      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    }
    console.log('  ✓ Firestore data cleared');
    
    // We can't easily clear Auth users directly from the Admin SDK
    // The emulator should be restarted if a full reset is needed
    console.log('  ⚠️ Auth data cannot be fully cleared via Admin SDK');
  } catch (error) {
    console.error('  ✖ Error clearing data:', error);
    throw error;
  }
}

/**
 * Seed user accounts in Auth emulator
 * @returns {Object} Map of user roles to user IDs
 */
async function seedUsers() {
  const users = [
    {
      email: 'admin@timberline.com',
      password: 'Password123!',
      displayName: 'Admin User',
      role: 'super_admin'
    },
    {
      email: 'manager@timberline.com',
      password: 'Password123!',
      displayName: 'Manager User',
      role: 'manager'
    },
    {
      email: 'customer@example.com',
      password: 'Password123!',
      displayName: 'Test Customer',
      role: 'customer'
    }
  ];

  const userIds = {};
  
  for (const user of users) {
    try {
      // Create the user in Auth emulator
      let userRecord;
      try {
        // Check if user already exists
        userRecord = await auth.getUserByEmail(user.email);
      } catch (error) {
        // Create if not exists
        userRecord = await auth.createUser({
          email: user.email,
          password: user.password,
          displayName: user.displayName,
          emailVerified: true
        });
      }
      
      // Store in our return object
      userIds[user.role] = userRecord.uid;
      
      // Add user record to Firestore with role information
      await db.collection('users').doc(userRecord.uid).set({
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLogin: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`  ✓ Created user: ${user.email} (${user.role})`);
    } catch (error) {
      console.error(`  ✖ Error creating user ${user.email}:`, error);
      throw error;
    }
  }
  
  return userIds;
}

/**
 * Seed Firestore collections with sample data
 * @param {Object} userIds Map of user roles to user IDs
 */
async function seedFirestoreCollections(userIds) {
  try {
    // Seed products collection
    await seedProducts();
    
    // Seed orders collection
    await seedOrders(userIds);
    
    // Seed contact submissions
    await seedContactSubmissions();
    
    // Seed custom order inquiries
    await seedCustomOrderInquiries();
    
    // Seed site settings
    await seedSiteSettings();
    
    // Seed gallery
    await seedGallery();
    
  } catch (error) {
    console.error('  ✖ Error seeding Firestore collections:', error);
    throw error;
  }
}

/**
 * Seed products collection
 */
async function seedProducts() {
  const products = [
    {
      name: 'Garden Shed',
      description: 'A beautiful oak garden shed, perfect for storing tools and equipment.',
      price: 1200,
      features: ['Solid oak construction', 'Weather resistant', 'Customizable size options'],
      dimensions: { width: 2.4, depth: 1.8, height: 2.1 },
      images: ['shed1.jpg', 'shed2.jpg'],
      category: 'sheds',
      inStock: true,
      featured: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      name: 'Oak Pergola',
      description: 'Create a stunning outdoor living space with our handcrafted oak pergola.',
      price: 2500,
      features: ['Handcrafted in the UK', 'Natural oak finish', 'Pressure treated for longevity'],
      dimensions: { width: 3.6, depth: 3.0, height: 2.4 },
      images: ['pergola1.jpg', 'pergola2.jpg'],
      category: 'pergolas',
      inStock: true,
      featured: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      name: 'Oak Gazebo',
      description: 'A premium oak gazebo for your garden or patio area.',
      price: 3800,
      features: ['Hexagonal design', 'Includes seating', 'Optional roof finishes'],
      dimensions: { width: 3.5, depth: 3.5, height: 3.0 },
      images: ['gazebo1.jpg', 'gazebo2.jpg'],
      category: 'gazebos',
      inStock: false,
      featured: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ];
  
  const batch = db.batch();
  
  products.forEach(product => {
    const docRef = db.collection('products').doc();
    batch.set(docRef, product);
  });
  
  await batch.commit();
  console.log(`  ✓ Created ${products.length} products`);
}

/**
 * Seed orders collection
 * @param {Object} userIds Map of user roles to user IDs
 */
async function seedOrders(userIds) {
  const orders = [
    {
      customerName: 'Test Customer',
      customerEmail: 'customer@example.com',
      userId: userIds.customer,
      status: 'completed',
      total: 1200,
      paymentMethod: 'card',
      itemCount: 1,
      items: [
        { productId: 'product_id_1', name: 'Garden Shed', price: 1200, quantity: 1 }
      ],
      shippingAddress: {
        street: '123 Main St',
        city: 'London',
        postcode: 'SW1A 1AA',
        country: 'United Kingdom'
      },
      createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    },
    {
      customerName: 'Test Customer',
      customerEmail: 'customer@example.com',
      userId: userIds.customer,
      status: 'processing',
      total: 2500,
      paymentMethod: 'card',
      itemCount: 1,
      items: [
        { productId: 'product_id_2', name: 'Oak Pergola', price: 2500, quantity: 1 }
      ],
      shippingAddress: {
        street: '123 Main St',
        city: 'London',
        postcode: 'SW1A 1AA',
        country: 'United Kingdom'
      },
      createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000))
    }
  ];
  
  const batch = db.batch();
  
  orders.forEach(order => {
    const docRef = db.collection('orders').doc();
    batch.set(docRef, order);
  });
  
  await batch.commit();
  console.log(`  ✓ Created ${orders.length} orders`);
}

/**
 * Seed contact submissions collection
 */
async function seedContactSubmissions() {
  const contactSubmissions = [
    {
      name: 'John Smith',
      email: 'john@example.com',
      subject: 'Product Inquiry',
      message: 'I would like to know more about your custom gazebo options.',
      status: 'new',
      submittedAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000))
    },
    {
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      subject: 'Quote Request',
      message: 'Can you please provide a quote for a 3x4m pergola with seating?',
      status: 'responded',
      submittedAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000))
    }
  ];
  
  const batch = db.batch();
  
  contactSubmissions.forEach(submission => {
    const docRef = db.collection('contactSubmissions').doc();
    batch.set(docRef, submission);
  });
  
  await batch.commit();
  console.log(`  ✓ Created ${contactSubmissions.length} contact submissions`);
}

/**
 * Seed custom order inquiries collection
 */
async function seedCustomOrderInquiries() {
  const customOrderInquiries = [
    {
      fullName: 'David Brown',
      email: 'david@example.com',
      phone: '07700900123',
      productType: 'Custom Gazebo',
      description: 'Looking for a large octagonal gazebo with built-in BBQ area.',
      status: 'pending',
      submittedAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    },
    {
      fullName: 'Emma Wilson',
      email: 'emma@example.com',
      phone: '07700900456',
      productType: 'Custom Shed',
      description: 'Need a shed that doubles as a small home office with power and insulation.',
      status: 'quoted',
      submittedAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 20 * 24 * 60 * 60 * 1000))
    }
  ];
  
  const batch = db.batch();
  
  customOrderInquiries.forEach(inquiry => {
    const docRef = db.collection('customOrderInquiries').doc();
    batch.set(docRef, inquiry);
  });
  
  await batch.commit();
  console.log(`  ✓ Created ${customOrderInquiries.length} custom order inquiries`);
}

/**
 * Seed site settings collection
 */
async function seedSiteSettings() {
  // Public settings
  await db.collection('siteSettings').doc('publicSettings').set({
    companyName: 'Solid Oak Structures',
    tagline: 'Beautiful, bespoke oak buildings for your garden',
    featuredProductIds: ['product_id_1', 'product_id_2'],
    logoUrl: '/images/logo.png',
    heroImageUrl: '/images/hero.jpg',
    socialLinks: {
      facebook: 'https://facebook.com/solidoakstructures',
      instagram: 'https://instagram.com/solidoakstructures',
      twitter: 'https://twitter.com/solidoakstruct'
    },
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  // Company information
  await db.collection('siteSettings').doc('companyInformation').set({
    companyName: 'Solid Oak Structures',
    address: {
      street: '123 Oak Lane',
      city: 'Woodville',
      county: 'Hampshire',
      postcode: 'HA1 2WD',
      country: 'United Kingdom'
    },
    contactEmail: 'info@solidoakstructures.com',
    contactPhone: '+44 1234 567890',
    registrationNumber: 'REG12345678',
    vatNumber: 'GB123456789',
    businessHours: {
      monday: { open: '09:00', close: '17:00' },
      tuesday: { open: '09:00', close: '17:00' },
      wednesday: { open: '09:00', close: '17:00' },
      thursday: { open: '09:00', close: '17:00' },
      friday: { open: '09:00', close: '17:00' },
      saturday: { open: '10:00', close: '14:00' },
      sunday: { open: 'closed', close: 'closed' }
    },
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  console.log('  ✓ Created site settings');
}

/**
 * Seed gallery collection
 */
async function seedGallery() {
  const galleryItems = [
    {
      title: 'Custom Garden Office',
      description: 'A bespoke garden office built for a client in Surrey',
      imageUrl: '/images/gallery/office1.jpg',
      category: 'garden-offices',
      featured: true,
      createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 120 * 24 * 60 * 60 * 1000))
    },
    {
      title: 'Oak Gazebo with Seating',
      description: 'Luxury gazebo with integrated seating and dining area',
      imageUrl: '/images/gallery/gazebo3.jpg',
      category: 'gazebos',
      featured: true,
      createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000))
    },
    {
      title: 'Garden Storage Solution',
      description: 'Compact but spacious garden storage shed',
      imageUrl: '/images/gallery/shed3.jpg',
      category: 'sheds',
      featured: false,
      createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000))
    }
  ];
  
  const batch = db.batch();
  
  galleryItems.forEach(item => {
    const docRef = db.collection('gallery').doc();
    batch.set(docRef, item);
  });
  
  await batch.commit();
  console.log(`  ✓ Created ${galleryItems.length} gallery items`);
}

/**
 * Export emulator data using Firebase CLI
 * @param {string} exportPath Path to export the data
 */
async function exportEmulatorData(exportPath) {
  try {
    // Ensure the export directory exists
    if (!fs.existsSync(exportPath)) {
      fs.mkdirSync(exportPath, { recursive: true });
    }
    
    // Use Firebase CLI to export data
    // This requires firebase-tools to be installed
    const cmd = `firebase emulators:export ${exportPath} --force`;
    
    console.log(`  ⏳ Running: ${cmd}`);
    
    // Execute the export command
    const result = execSync(cmd, { encoding: 'utf8', stdio: 'inherit' });
    
    // Create a README file in the export directory
    const readmeContent = `# Firebase Emulator Export

This directory contains exported data from Firebase emulators for development purposes.

## Contents
- Auth users (admin, manager, customer)
- Firestore collections (products, orders, etc.)

## Usage
To start emulators with this data:

\`\`\`
firebase emulators:start --import=${exportPath}
\`\`\`

Exported on: ${new Date().toISOString()}
`;
    
    fs.writeFileSync(path.join(exportPath, 'README.md'), readmeContent);
    
    console.log(`  ✓ Data exported to ${exportPath}`);
    console.log(`  ✓ Created README.md in export directory`);
    
  } catch (error) {
    console.error('  ✖ Error exporting data:', error);
    throw error;
  }
}

// Execute the main function if this file is run directly
if (require.main === module) {
  seedEmulators()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Script failed with error:', error);
      process.exit(1);
    });
}

// Export functions for use in other scripts
module.exports = {
  seedEmulators,
  seedUsers,
  seedFirestoreCollections,
  clearEmulatorData,
  exportEmulatorData
};
