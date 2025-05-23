const admin = require('firebase-admin');
const functions = require('firebase-functions');
const { onRequest } = require('firebase-functions/v2/https');
const next = require('next');
const { sendWelcomeEmail, sendOrderConfirmation, sendContactFormNotification } = require('./utils/email');
const { processProductImage, generateThumbnail, optimizeStorageImages } = require('./utils/image');

// Initialize Firebase Admin
admin.initializeApp();

// Error handling wrapper
const errorHandler = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (error) {
    console.error('Function error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
    });
  }
};

// 1. SSR Function (Main website)
exports.ssrtimberlinecommerce = onRequest({
  memory: '1024MB',
  region: 'us-central1',
  minInstances: 1,
  maxInstances: 10,
  timeoutSeconds: 300
}, async (req, res) => {
  const dev = process.env.NODE_ENV !== 'production';
  const app = next({ dev, conf: { distDir: '.next' } });
  const handle = app.getRequestHandler();
  console.log('SSR Function initialized with 1GB memory');
  await app.prepare();
  return handle(req, res);
});

// 2. Contact Form Processing
exports.processContactForm = onRequest({
  memory: '256MB',
  region: 'us-central1'
}, errorHandler(async (req, res) => {
  const formData = req.body;
  
  // Store in Firestore
  await admin.firestore().collection('contacts').add({
    ...formData,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Send email notification
  await sendContactFormNotification(formData);

  res.json({ success: true });
}));

// 3. Order Processing
exports.processOrder = onRequest({
  memory: '512MB',
  region: 'us-central1'
}, errorHandler(async (req, res) => {
  const orderData = req.body;
  const uid = req.auth.uid;

  // Validate user
  const user = await admin.auth().getUser(uid);
  
  // Create order in Firestore
  const orderRef = await admin.firestore().collection('orders').add({
    ...orderData,
    userId: uid,
    status: 'pending',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Send confirmation email
  await sendOrderConfirmation({
    id: orderRef.id,
    details: orderData
  }, user);

  res.json({ 
    success: true,
    orderId: orderRef.id
  });
}));

// 4. Auth Triggers
exports.onUserCreated = functions.auth.user().onCreate(async (user) => {
  try {
    // Create user profile in Firestore
    await admin.firestore().collection('users').doc(user.uid).set({
      email: user.email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      role: 'customer'
    });

    // Send welcome email
    await sendWelcomeEmail(user);
  } catch (error) {
    console.error('Error in onUserCreated:', error);
  }
});

// 5. Order Status Updates
exports.onOrderStatusUpdate = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    try {
      const newData = change.after.data();
      const previousData = change.before.data();

      if (newData.status !== previousData.status) {
        const user = await admin.auth().getUser(newData.userId);
        
        // Send status update email
        await sendOrderStatusEmail(newData, user);
      }
    } catch (error) {
      console.error('Error in onOrderStatusUpdate:', error);
    }
});

// 6. Admin Settings
exports.updateSettings = onRequest({
  memory: '256MB',
  region: 'us-central1'
}, errorHandler(async (req, res) => {
  // Verify admin role
  const uid = req.auth.uid;
  const user = await admin.firestore().collection('users').doc(uid).get();
  
  if (!user.exists || user.data().role !== 'admin') {
    res.status(403).json({ error: 'Unauthorized' });
    return;
  }

  const settings = req.body;
  await admin.firestore().collection('settings').doc('global').set(settings, { merge: true });
  
  res.json({ success: true });
}));

// 7. Background Tasks
exports.dailyCleanup = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  try {
    // Cleanup old temporary data
    const cutoff = admin.firestore.Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    
    await admin.firestore().collection('temp_data')
      .where('createdAt', '<', cutoff)
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => doc.ref.delete());
      });
  } catch (error) {
    console.error('Error in dailyCleanup:', error);
  }
});

// Product Image Processing Function
exports.processProductImages = onRequest({
  memory: '2GB', // Increased memory for image processing
  region: 'us-central1',
  timeoutSeconds: 540 // 9 minutes timeout for large images
}, errorHandler(async (req, res) => {
  // Verify admin/authorized user
  const uid = req.auth?.uid;
  if (!uid) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const user = await admin.firestore().collection('users').doc(uid).get();
  if (!user.exists || !['admin', 'editor'].includes(user.data().role)) {
    res.status(403).json({ error: 'Insufficient permissions' });
    return;
  }

  const { file, productId } = req.body;

  if (!file || !productId) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    // Process the image and get URLs for all sizes
    const processedImages = await processProductImage(file, productId);

    // Generate a thumbnail
    const thumbnailUrl = await generateThumbnail(file.name);

    // Update the product document with all image URLs
    await admin.firestore()
      .collection('products')
      .doc(productId)
      .update({
        imageUrls: processedImages,
        thumbnailUrl,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

    res.json({
      success: true,
      images: processedImages,
      thumbnail: thumbnailUrl
    });

  } catch (error) {
    console.error('Error processing product images:', error);
    res.status(500).json({
      error: 'Failed to process images',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred during image processing'
    });
  }
}));

// Background image optimization task
exports.optimizeImages = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    try {
      await optimizeStorageImages();
      console.log('Successfully optimized storage images');
    } catch (error) {
      console.error('Error in image optimization task:', error);
    }
});

