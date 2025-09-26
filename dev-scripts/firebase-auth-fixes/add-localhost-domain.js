#!/usr/bin/env node

/**
 * Add Localhost Domain to Firebase Authentication
 * 
 * This script adds "localhost" to the list of authorized domains for Firebase Authentication
 * using the Firebase Admin SDK and the Identity Platform API.
 * 
 * Usage: node add-localhost-domain.js
 */

const admin = require('firebase-admin');
const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Terminal colors for better readability
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

// Project configuration
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'timberline-commerce';

// Log with colors
function log(message, color = colors.white) {
  console.log(`${color}${message}${colors.reset}`);
}

// Print section header
function logSection(title) {
  console.log('\n' + colors.bold + colors.cyan + '='.repeat(80) + colors.reset);
  console.log(colors.bold + colors.cyan + ` ${title} ` + colors.reset);
  console.log(colors.bold + colors.cyan + '='.repeat(80) + colors.reset + '\n');
}

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
  try {
    // Get credentials from environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID || PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    if (!clientEmail || !privateKey) {
      log('Missing Firebase Admin credentials in environment variables.', colors.red);
      log('Attempting to use service account from gcloud CLI...', colors.yellow);
      
      return initializeWithGcloud();
    }
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    
    log(`Firebase Admin SDK initialized for project: ${projectId}`, colors.green);
    return true;
  } catch (error) {
    log(`Error initializing Firebase Admin SDK: ${error.message}`, colors.red);
    return false;
  }
}

// Initialize with gcloud credentials
async function initializeWithGcloud() {
  try {
    // Use gcloud CLI to get access token
    const { execSync } = require('child_process');
    const accessToken = execSync('gcloud auth print-access-token').toString().trim();
    
    admin.initializeApp({
      credential: admin.credential.refreshToken(accessToken),
      projectId: PROJECT_ID,
    });
    
    log(`Firebase Admin SDK initialized for project: ${PROJECT_ID} using gcloud credentials`, colors.green);
    return true;
  } catch (error) {
    log(`Error initializing with gcloud: ${error.message}`, colors.red);
    return false;
  }
}

// Get current authorized domains using Identity Platform API
async function getAuthorizedDomains() {
  try {
    // Get an ID token from Admin SDK to use for authentication
    const customToken = await admin.auth().createCustomToken('auth-domain-manager');
    
    // Exchange custom token for ID token (requires a separate API call)
    const idToken = await exchangeCustomTokenForIdToken(customToken);
    
    if (!idToken) {
      throw new Error('Failed to get ID token for authentication');
    }
    
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'identitytoolkit.googleapis.com',
        path: `/v1/projects/${PROJECT_ID}/defaultSupportedIdpConfigs/google.com`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const response = JSON.parse(data);
              log('Successfully retrieved current config', colors.green);
              resolve(response);
            } catch (error) {
              reject(`Error parsing response: ${error.message}`);
            }
          } else {
            log(`API Error (${res.statusCode}): ${data}`, colors.red);
            
            // If we can't access the IDP config API, try the project config API
            getAuthorizedDomainsAlternative(idToken)
              .then(resolve)
              .catch(reject);
          }
        });
      });
      
      req.on('error', (error) => {
        reject(`Request error: ${error.message}`);
      });
      
      req.end();
    });
  } catch (error) {
    log(`Error getting authorized domains: ${error.message}`, colors.red);
    throw error;
  }
}

// Alternative method to get authorized domains
async function getAuthorizedDomainsAlternative(idToken) {
  log('Trying alternative method to get authorized domains...', colors.yellow);
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'identitytoolkit.googleapis.com',
      path: `/v1/projects/${PROJECT_ID}:getConfig`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            log('Successfully retrieved project config', colors.green);
            resolve(response);
          } catch (error) {
            reject(`Error parsing response: ${error.message}`);
          }
        } else {
          reject(`API Error (${res.statusCode}): ${data}`);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(`Request error: ${error.message}`);
    });
    
    req.end();
  });
}

// Exchange custom token for ID token
async function exchangeCustomTokenForIdToken(customToken) {
  try {
    // We need to use the Firebase Auth REST API
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    
    if (!apiKey) {
      throw new Error('Firebase API key not found in environment variables');
    }
    
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        token: customToken,
        returnSecureToken: true
      });
      
      const options = {
        hostname: 'identitytoolkit.googleapis.com',
        path: `/v1/accounts:signInWithCustomToken?key=${apiKey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };
      
      const req = https.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const response = JSON.parse(responseData);
              resolve(response.idToken);
            } catch (error) {
              reject(`Error parsing response: ${error.message}`);
            }
          } else {
            reject(`API Error (${res.statusCode}): ${responseData}`);
          }
        });
      });
      
      req.on('error', (error) => {
        reject(`Request error: ${error.message}`);
      });
      
      req.write(data);
      req.end();
    });
  } catch (error) {
    log(`Error exchanging custom token: ${error.message}`, colors.red);
    return null;
  }
}

// Update authorized domains
async function updateAuthorizedDomains(idToken, domains) {
  try {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        authorizedDomains: domains
      });
      
      const options = {
        hostname: 'identitytoolkit.googleapis.com',
        path: `/v1/projects/${PROJECT_ID}:updateConfig`,
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };
      
      const req = https.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const response = JSON.parse(responseData);
              resolve(response);
            } catch (error) {
              reject(`Error parsing response: ${error.message}`);
            }
          } else {
            reject(`API Error (${res.statusCode}): ${responseData}`);
          }
        });
      });
      
      req.on('error', (error) => {
        reject(`Request error: ${error.message}`);
      });
      
      req.write(data);
      req.end();
    });
  } catch (error) {
    log(`Error updating authorized domains: ${error.message}`, colors.red);
    throw error;
  }
}

// Use direct access to the Firebase Management API with gcloud credentials
async function updateAuthorizedDomainsWithGcloud() {
  try {
    const { execSync } = require('child_process');
    
    // Get access token from gcloud
    const accessToken = execSync('gcloud auth print-access-token').toString().trim();
    
    // Make the API request to get current configuration
    const getCurrentConfig = `curl -s -X GET "https://firebase.googleapis.com/v1beta1/projects/${PROJECT_ID}/webApps" -H "Authorization: Bearer ${accessToken}"`;
    const currentConfig = JSON.parse(execSync(getCurrentConfig).toString());
    
    log('Current web apps:', colors.blue);
    console.log(JSON.stringify(currentConfig, null, 2));
    
    // Make the API request to update authorized domains
    const updateCmd = `curl -s -X PATCH "https://identitytoolkit.googleapis.com/v2/projects/${PROJECT_ID}/config" -H "Authorization: Bearer ${accessToken}" -H "Content-Type: application/json" -d '{"authorizedDomains": ["localhost", "${PROJECT_ID}.firebaseapp.com", "${PROJECT_ID}.web.app"]}'`;
    
    try {
      const result = execSync(updateCmd).toString();
      log('Successfully updated authorized domains with gcloud!', colors.green);
      console.log(result);
      return true;
    } catch (error) {
      log(`Error updating authorized domains with gcloud: ${error.message}`, colors.red);
      
      // Try the Firebase CLI method as fallback
      return updateAuthorizedDomainsWithFirebaseCLI();
    }
  } catch (error) {
    log(`Error using gcloud to update domains: ${error.message}`, colors.red);
    return false;
  }
}

// Use Firebase CLI to deploy a special function that updates the authorized domains
async function updateAuthorizedDomainsWithFirebaseCLI() {
  try {
    log('Attempting to use Firebase CLI to update authorized domains...', colors.yellow);
    
    // Check if firebase-tools is installed
    const { execSync } = require('child_process');
    
    try {
      execSync('firebase --version');
    } catch (error) {
      log('Firebase CLI not found. Please install it with: npm install -g firebase-tools', colors.red);
      return false;
    }
    
    // Create a temporary Firebase function
    const tempDir = path.join(__dirname, 'temp-auth-function');
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    
    // Create a simple Firebase function to update authorized domains
    const functionCode = `
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.updateAuthDomains = functions.https.onRequest(async (req, res) => {
  try {
    // This function will run with the project's service account permissions
    // Use Identity Platform API to update authorized domains
    const projectId = process.env.GCLOUD_PROJECT;
    const accessToken = await admin.credential.applicationDefault().getAccessToken();
    
    const https = require('https');
    const data = JSON.stringify({
      authorizedDomains: ["localhost", "\${projectId}.firebaseapp.com", "\${projectId}.web.app"]
    });
    
    const options = {
      hostname: 'identitytoolkit.googleapis.com',
      path: \`/v2/projects/\${projectId}/config\`,
      method: 'PATCH',
      headers: {
        'Authorization': \`Bearer \${accessToken}\`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    return new Promise((resolve, reject) => {
      const request = https.request(options, (response) => {
        let responseData = '';
        
        response.on('data', (chunk) => {
          responseData += chunk;
        });
        
        response.on('end', () => {
          if (response.statusCode >= 200 && response.statusCode < 300) {
            res.status(200).json({ success: true, message: 'Successfully updated authorized domains' });
            resolve();
          } else {
            res.status(response.statusCode).json({ 
              error: 'Failed to update authorized domains',
              details: responseData
            });
            reject(new Error(\`API Error (\${response.statusCode}): \${responseData}\`));
          }
        });
      });
      
      request.on('error', (error) => {
        res.status(500).json({ error: 'Request error', details: error.message });
        reject(error);
      });
      
      request.write(data);
      request.end();
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});
`;
    
    // Write the function code
    fs.writeFileSync(path.join(tempDir, 'index.js'), functionCode);
    
    

