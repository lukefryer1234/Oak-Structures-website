#!/usr/bin/env node

/**
 * Add Localhost to Firebase Auth Authorized Domains
 * 
 * This script adds 'localhost' to the list of authorized domains for Firebase Authentication.
 * It uses the Firebase Admin SDK to authenticate and then makes a direct REST API call to
 * update the authorized domains list.
 */

// Import required modules
const admin = require('firebase-admin');
const https = require('https');
const { execSync } = require('child_process');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Firebase project ID from environment variables or use default
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'timberline-commerce';

// Terminal colors for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

/**
 * Print a message with color
 */
function log(message, color = colors.white) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Print a section header
 */
function logSection(title) {
  console.log('\n' + colors.bold + colors.cyan + '='.repeat(80) + colors.reset);
  console.log(colors.bold + colors.cyan + ` ${title} ` + colors.reset);
  console.log(colors.bold + colors.cyan + '='.repeat(80) + colors.reset + '\n');
}

/**
 * Initialize Firebase Admin SDK
 * Try multiple initialization methods in order of preference
 */
async function initializeFirebaseAdmin() {
  logSection('INITIALIZING FIREBASE ADMIN SDK');
  
  try {
    // First try: Use environment variables from .env.local
    const projectId = process.env.FIREBASE_PROJECT_ID || PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    if (clientEmail && privateKey) {
      log('Initializing with environment variables...', colors.blue);
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      
      log(`Firebase Admin SDK initialized for project: ${projectId}`, colors.green);
      return true;
    }
    
    // Second try: Use application default credentials
    log('Environment variables not found, trying application default credentials...', colors.yellow);
    
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: PROJECT_ID,
    });
    
    log(`Firebase Admin SDK initialized for project: ${PROJECT_ID} using application default credentials`, colors.green);
    return true;
  } catch (error) {
    log(`Error initializing Firebase Admin SDK: ${error.message}`, colors.red);
    
    // Third try: Get credentials from gcloud CLI
    try {
      log('Trying to get credentials from gcloud CLI...', colors.yellow);
      
      // Get access token from gcloud
      const accessToken = execSync('gcloud auth print-access-token').toString().trim();
      
      admin.initializeApp({
        credential: admin.credential.refreshToken(accessToken),
        projectId: PROJECT_ID,
      });
      
      log(`Firebase Admin SDK initialized for project: ${PROJECT_ID} using gcloud credentials`, colors.green);
      return true;
    } catch (secondError) {
      log(`Error initializing with gcloud: ${secondError.message}`, colors.red);
      return false;
    }
  }
}

/**
 * Get access token for API requests
 */
async function getAccessToken() {
  try {
    // First try: Get token from Firebase Admin SDK
    return await admin.app().options.credential.getAccessToken();
  } catch (error) {
    log(`Error getting access token from Admin SDK: ${error.message}`, colors.red);
    
    // Second try: Get token from gcloud CLI
    try {
      log('Trying to get access token from gcloud CLI...', colors.yellow);
      return execSync('gcloud auth print-access-token').toString().trim();
    } catch (secondError) {
      log(`Error getting access token from gcloud: ${secondError.message}`, colors.red);
      throw new Error('Failed to get access token');
    }
  }
}

/**
 * Make an HTTPS request
 */
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsedData = responseData ? JSON.parse(responseData) : {};
            resolve(parsedData);
          } catch (error) {
            resolve(responseData);
          }
        } else {
          log(`Request failed with status code: ${res.statusCode}`, colors.red);
          log(`Response: ${responseData}`, colors.red);
          reject(new Error(`Request failed with status code: ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

/**
 * Get current authorized domains
 */
async function getAuthorizedDomains(accessToken) {
  logSection('GETTING CURRENT AUTHORIZED DOMAINS');
  
  try {
    // First attempt: Try Identity Platform API v2
    log('Attempting to get authorized domains using Identity Platform API v2...', colors.blue);
    
    const options = {
      hostname: 'identitytoolkit.googleapis.com',
      path: `/v2/projects/${PROJECT_ID}/config`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };
    
    const config = await makeRequest(options);
    log('Successfully retrieved configuration', colors.green);
    
    return config.authorizedDomains || [];
  } catch (error) {
    log(`Error with first method: ${error.message}`, colors.red);
    
    try {
      // Second attempt: Try Identity Platform API v1
      log('Attempting to get authorized domains using Identity Platform API v1...', colors.blue);
      
      const options = {
        hostname: 'identitytoolkit.googleapis.com',
        path: `/v1/projects/${PROJECT_ID}:getConfig`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      };
      
      const config = await makeRequest(options);
      log('Successfully retrieved configuration', colors.green);
      
      return config.authorizedDomains || [];
    } catch (secondError) {
      log(`Error with second method: ${secondError.message}`, colors.red);
      
      // Third attempt: Use Firebase Management API
      try {
        log('Attempting to get authorized domains using Firebase Management API...', colors.blue);
        
        const options = {
          hostname: 'firebase.googleapis.com',
          path: `/v1beta1/projects/${PROJECT_ID}`,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        };
        
        const config = await makeRequest(options);
        log('Successfully retrieved configuration', colors.green);
        
        return config.authDomains || [];
      } catch (thirdError) {
        log(`Error with third method: ${thirdError.message}`, colors.red);
        log('Using default domains as fallback...', colors.yellow);
        
        // Return default domains as fallback
        return [`${PROJECT_ID}.firebaseapp.com`];
      }
    }
  }
}

/**
 * Update authorized domains
 */
async function updateAuthorizedDomains(accessToken, domains) {
  logSection('UPDATING AUTHORIZED DOMAINS');
  
  log('Current domains:', colors.blue);
  domains.forEach(domain => log(`- ${domain}`, colors.white));
  
  if (domains.includes('localhost')) {
    log('localhost is already in the authorized domains list!', colors.green);
    return true;
  }
  
  // Add localhost to the domains
  domains.push('localhost');
  
  log('New domains list (with localhost added):', colors.blue);
  domains.forEach(domain => log(`- ${domain}`, colors.white));
  
  // First try: Identity Platform API v2
  try {
    log('Attempting to update authorized domains using Identity Platform API v2...', colors.blue);
    
    const data = JSON.stringify({
      authorizedDomains: domains
    });
    
    const options = {
      hostname: 'identitytoolkit.googleapis.com',
      path: `/v2/projects/${PROJECT_ID}/config`,
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };
    
    await makeRequest(options, data);
    log('Successfully updated authorized domains!', colors.green);
    return true;
  } catch (error) {
    log(`Error with first update method: ${error.message}`, colors.red);
    
    // Second try: Identity Platform API v1
    try {
      log('Attempting to update authorized domains using Identity Platform API v1...', colors.blue);
      
      const data = JSON.stringify({
        authorizedDomains: domains
      });
      
      const options = {
        hostname: 'identitytoolkit.googleapis.com',
        path: `/v1/projects/${PROJECT_ID}:updateConfig`,
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      };
      
      await makeRequest(options, data);
      log('Successfully updated authorized domains!', colors.green);
      return true;
    } catch (secondError) {
      log(`Error with second update method: ${secondError.message}`, colors.red);
      
      // Try fallback method with curl
      try {
        log('Attempting to update using curl command...', colors.yellow);
        
        const curlCommand = `curl -s -X PATCH "https://identitytoolkit.googleapis.com/v2/projects/${PROJECT_ID}/config" -H "Authorization: Bearer ${accessToken}" -H "Content-Type: application/json" -d '{"authorizedDomains": ${JSON.stringify(domains)}}'`;
        
        const result = execSync(curlCommand).toString();
        log('Successfully updated authorized domains using curl!', colors.green);
        return true;
      } catch (thirdError) {
        log(`Error with curl update method: ${thirdError.message}`, colors.red);
        
        // Provide manual instructions as last resort
        logSection('MANUAL INSTRUCTIONS');
        log('Unable to automatically update authorized domains. Please follow these steps:', colors.yellow);
        log('1. Go to Firebase Console:', colors.yellow);
        log(`   https://console.firebase.google.com/project/${PROJECT_ID}/authentication/settings`, colors.cyan);
        log('2. In the "Authorized domains" section, click "Add domain"', colors.yellow);
        log('3. Add "localhost" as an authorized domain', colors.yellow);
        log('4. Click "Add"', colors.yellow);
        
        return false;
      }
    }
  }
}

/**
 * Main function
 */
async function main() {
  logSection('ADDING LOCALHOST TO FIREBASE AUTH DOMAINS');
  
  try {
    // Step 1: Initialize Firebase Admin SDK
    const initialized = await initializeFirebaseAdmin();
    
    if (!initialized) {
      throw new Error('Failed to initialize Firebase Admin SDK');
    }
    
    // Step 2: Get access token
    const accessToken = await getAccessToken();
    
    // Step 3: Get current authorized domains
    const currentDomains = await getAuthorizedDomains(accessToken);
    
    // Step 4: Update authorized domains
    const success = await updateAuthorizedDomains(accessToken, currentDomains);
    
    if (success) {
      logSection('SUCCESS');
      log('Successfully added localhost to Firebase Auth authorized domains!', colors.green);
      log('You should now be able to use Google Sign-In on localhost.', colors.green);
    } else {
      logSection('PARTIAL COMPLETION');
      log('Could not automatically update authorized domains.', colors.yellow);
      log('Please check the manual instructions above.', colors.yellow);
    }
  } catch (error) {
    logSection('ERROR');
    log(`Failed to add localhost to authorized domains: ${error.message}`, colors.red);
    log('Please try following the manual instructions in the Firebase Console:', colors.yellow);
    log(`https://console.firebase.google.com/project/${PROJECT_ID}/authentication/settings`, colors.cyan);
  }
}

// Run the script
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

