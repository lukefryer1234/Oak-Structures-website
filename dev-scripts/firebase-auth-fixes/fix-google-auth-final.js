#!/usr/bin/env node

/**
 * fix-google-auth-final.js
 * 
 * A comprehensive script to fix Google Sign-In issues with Firebase.
 * This script:
 * 1. Directly enables Google authentication in Firebase
 * 2. Updates API key restrictions to ensure authentication works
 * 3. Creates a minimal test HTML file
 * 4. Documents all steps clearly
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');
const admin = require('firebase-admin');

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

// Get the current working directory
const PROJECT_DIR = process.cwd();
const ENV_FILE_PATH = path.join(PROJECT_DIR, '.env.local');

// Project configuration (will be loaded from .env.local)
let PROJECT_ID = '';
let API_KEY = '';
let AUTH_DOMAIN = '';
let STORAGE_BUCKET = '';
let MESSAGING_SENDER_ID = '';
let APP_ID = '';
let MEASUREMENT_ID = '';

// Firebase Admin credentials from environment variables
let FIREBASE_PRIVATE_KEY = '';
let FIREBASE_CLIENT_EMAIL = '';

/**
 * Log a message with color
 */
function log(message, color = colors.white) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Log a section header
 */
function logSection(title) {
  console.log('\n' + colors.bold + colors.cyan + '='.repeat(80) + colors.reset);
  console.log(colors.bold + colors.cyan + ` ${title} ` + colors.reset);
  console.log(colors.bold + colors.cyan + '='.repeat(80) + colors.reset + '\n');
}

/**
 * Execute a command and handle errors
 */
function runCommand(command, options = {}) {
  try {
    const { silent = false } = options;
    
    if (!silent) {
      log(`Executing: ${command}`, colors.blue);
    }
    
    const output = execSync(command, { encoding: 'utf8' });
    
    if (!silent) {
      log(`Command completed successfully`, colors.green);
    }
    
    return { success: true, output };
  } catch (error) {
    if (!options.silent) {
      log(`Error executing command: ${error.message}`, colors.red);
    }
    return { success: false, error: error.message, stdout: error.stdout, stderr: error.stderr };
  }
}

/**
 * Get access token from gcloud
 */
async function getAccessToken() {
  try {
    const result = runCommand('gcloud auth print-access-token', { silent: true });
    if (result.success) {
      return result.output.trim();
    }
    return null;
  } catch (error) {
    log(`Error getting access token: ${error.message}`, colors.red);
    return null;
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
            const jsonResponse = JSON.parse(responseData);
            resolve(jsonResponse);
          } catch (error) {
            resolve(responseData);
          }
        } else {
          log(`HTTP Error ${res.statusCode}: ${responseData}`, colors.red);
          reject(new Error(`Status code ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * Step 1: Load Firebase configuration from .env.local
 */
function loadFirebaseConfig() {
  logSection('LOADING FIREBASE CONFIGURATION');
  
  if (!fs.existsSync(ENV_FILE_PATH)) {
    log(`${ENV_FILE_PATH} does not exist!`, colors.red);
    process.exit(1);
  }
  
  const envContent = fs.readFileSync(ENV_FILE_PATH, 'utf8');
  
  // Extract Firebase configuration from .env.local
  const apiKeyMatch = envContent.match(/NEXT_PUBLIC_FIREBASE_API_KEY="([^"]+)"/);
  const authDomainMatch = envContent.match(/NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="([^"]+)"/);
  const projectIdMatch = envContent.match(/NEXT_PUBLIC_FIREBASE_PROJECT_ID="([^"]+)"/);
  const storageBucketMatch = envContent.match(/NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="([^"]+)"/);
  const messagingSenderIdMatch = envContent.match(/NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="([^"]+)"/);
  const appIdMatch = envContent.match(/NEXT_PUBLIC_FIREBASE_APP_ID="([^"]+)"/);
  const measurementIdMatch = envContent.match(/NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="([^"]+)"/);
  
  // Extract Firebase Admin SDK credentials
  const privateKeyMatch = envContent.match(/FIREBASE_PRIVATE_KEY="([^"]+)"/);
  const clientEmailMatch = envContent.match(/FIREBASE_CLIENT_EMAIL="([^"]+)"/);
  const firebaseProjectIdMatch = envContent.match(/FIREBASE_PROJECT_ID="([^"]+)"/);
  
  API_KEY = apiKeyMatch ? apiKeyMatch[1] : '';
  AUTH_DOMAIN = authDomainMatch ? authDomainMatch[1] : '';
  PROJECT_ID = projectIdMatch ? projectIdMatch[1] : '';
  STORAGE_BUCKET = storageBucketMatch ? storageBucketMatch[1] : '';
  MESSAGING_SENDER_ID = messagingSenderIdMatch ? messagingSenderIdMatch[1] : '';
  APP_ID = appIdMatch ? appIdMatch[1] : '';
  MEASUREMENT_ID = measurementIdMatch ? measurementIdMatch[1] : '';
  
  FIREBASE_PRIVATE_KEY = privateKeyMatch ? privateKeyMatch[1].replace(/\\n/g, '\n') : '';
  FIREBASE_CLIENT_EMAIL = clientEmailMatch ? clientEmailMatch[1] : '';
  
  // If we don't have a project ID from NEXT_PUBLIC vars, try the FIREBASE_ var
  if (!PROJECT_ID && firebaseProjectIdMatch) {
    PROJECT_ID = firebaseProjectIdMatch[1];
  }
  
  if (!API_KEY || !PROJECT_ID) {
    log('Firebase API key or Project ID not found in .env.local!', colors.red);
    process.exit(1);
  }
  
  log('Firebase configuration loaded successfully:', colors.green);
  log(`API Key: ${API_KEY}`, colors.green);
  log(`Project ID: ${PROJECT_ID}`, colors.green);
  log(`Auth Domain: ${AUTH_DOMAIN}`, colors.green);
  
  if (FIREBASE_PRIVATE_KEY && FIREBASE_CLIENT_EMAIL) {
    log('Firebase Admin SDK credentials found ✓', colors.green);
  } else {
    log('Firebase Admin SDK credentials not found in .env.local.', colors.yellow);
    log('Will try to use Application Default Credentials instead.', colors.yellow);
  }
}

/**
 * Step 2: Set up Google Cloud CLI and ensure APIs are enabled
 */
function setupGoogleCloud() {
  logSection('SETTING UP GOOGLE CLOUD');
  
  // Check if Google Cloud SDK is installed
  const gcloudResult = runCommand('gcloud --version', { silent: true });
  
  if (!gcloudResult.success) {
    log('Google Cloud SDK (gcloud CLI) not found or not properly installed.', colors.red);
    log('Please install the Google Cloud SDK from: https://cloud.google.com/sdk/docs/install', colors.yellow);
    log('After installation, run: gcloud auth login', colors.yellow);
    return false;
  }
  
  log('Google Cloud SDK is installed ✓', colors.green);
  
  // Set project quota to fix potential API access issues
  const quotaResult = runCommand(`gcloud auth application-default set-quota-project ${PROJECT_ID}`, { silent: true });
  if (quotaResult.success) {
    log(`Set ${PROJECT_ID} as quota project for Application Default Credentials ✓`, colors.green);
  }
  
  // Ensure Identity Toolkit API is enabled
  log('Ensuring Identity Toolkit API is enabled...', colors.blue);
  runCommand(`gcloud services enable identitytoolkit.googleapis.com --project=${PROJECT_ID}`);
  
  // Ensure Firebase API is enabled
  log('Ensuring Firebase API is enabled...', colors.blue);
  runCommand(`gcloud services enable firebase.googleapis.com --project=${PROJECT_ID}`);
  
  // Ensure Firebase Auth API is enabled
  log('Ensuring Firebase Auth API is enabled...', colors.blue);
  runCommand(`gcloud services enable firebaseauth.googleapis.com --project=${PROJECT_ID}`);
  
  return true;
}

/**
 * Step 3: Initialize Firebase Admin SDK
 */
async function initializeFirebaseAdmin() {
  logSection('INITIALIZING FIREBASE ADMIN SDK');
  
  try {
    let credential;
    
    if (FIREBASE_PRIVATE_KEY && FIREBASE_CLIENT_EMAIL) {
      // Use service account credentials from .env.local
      credential = admin.credential.cert({
        projectId: PROJECT_ID,
        privateKey: FIREBASE_PRIVATE_KEY,
        clientEmail: FIREBASE_CLIENT_EMAIL
      });
      log('Using service account credentials from .env.local', colors.green);
    } else {
      // Try to use Application Default Credentials
      credential = admin.credential.applicationDefault();
      log('Using Application Default Credentials', colors.green);
    }
    
    admin.initializeApp({
      credential: credential,
      projectId: PROJECT_ID
    });
    
    log('Firebase Admin SDK initialized successfully ✓', colors.green);
    return true;
  } catch (error) {
    log(`Error initializing Firebase Admin SDK: ${error.message}`, colors.red);
    log(`You may need to set up service account credentials in .env.local or authenticate with gcloud:`, colors.yellow);
    log(`gcloud auth application-default login`, colors.yellow);
    return false;
  }
}

/**
 * Step 4: Enable Google Authentication in Firebase
 */
async function enableGoogleAuth() {
  logSection('ENABLING GOOGLE AUTHENTICATION');
  
  try {
    // Get current auth providers
    const auth = admin.auth();
    
    // Use Google Cloud CLI to enable Google auth provider
    log('Enabling Google auth provider using Google Cloud CLI...', colors.blue);
    
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      log('Failed to get access token. Please run: gcloud auth login', colors.red);
      return false;
    }
    
    // Check if Google provider is already enabled
    const checkOptions = {
      hostname: 'identitytoolkit.googleapis.com',
      path: `/admin/v2/projects/${PROJECT_ID}/config`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };
    
    try {
      const configResponse = await makeRequest(checkOptions);
      
      if (configResponse && configResponse.signIn && configResponse.signIn.email) {
        const providers = configResponse.signIn.email.passwordEnabled ? ['password'] : [];
        const googleEnabled = configResponse.signIn.email.googleEnabled;
        
        if (googleEnabled) {
          log('Google authentication is already enabled ✓', colors.green);
          return true;
        }
      }
    } catch (error) {
      log(`Error checking auth providers: ${error.message}`, colors.red);
      // Continue anyway to try enabling Google auth
    }
    
    // Enable Google auth provider
    const updateOptions = {
      hostname: 'identitytoolkit.googleapis.com',
      path: `/admin/v2/projects/${PROJECT_ID}/config`,
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };
    
    const updateData = {
      signIn: {
        email: {
          googleEnabled: true
        }
      }
    };
    
    try {
      await makeRequest(updateOptions, updateData);
      log('Google authentication enabled successfully ✓', colors.green);
      return true;
    } catch (error) {
      log(`Error enabling Google authentication: ${error.message}`, colors.red);
      
      // Fallback: Provide manual instructions
      log('Please enable Google authentication manually:', colors.yellow);
      log('1. Go to Firebase Console:', colors.yellow);
      log(`   https://console.firebase.google.com/project/${PROJECT_ID}/authentication/providers`, colors.cyan);
      log('2. Click on "Google" in the list of providers', colors.yellow);
      log('3. Toggle the "Enable" switch to on', colors.yellow);
      log('4. Click "Save"', colors.yellow);
      
      return false;
    }
  } catch (error) {
    log(`Error in enableGoogleAuth: ${error.message}`, colors.red);
    return false;
  }
}

/**
 * Step 5: Add localhost to authorized domains
 */
async function addLocalhostDomain() {
  logSection('ADDING LOCALHOST TO AUTHORIZED DOMAINS');
  
  try {
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      log('Failed to get access token. Please run: gcloud auth login', colors.red);
      return false;
    }
    
    // Get current authorized domains
    const getOptions = {
      hostname: 'identitytoolkit.googleapis.com',
      path: `/v1/projects/${PROJECT_ID}/defaultSupportedIdpConfigs/google.com`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };
    
    try {
      await makeRequest(getOptions);
    } catch (error) {
      // If config doesn't exist, create it
      log('Creating Google IdP configuration...', colors.blue);
      
      const createOptions = {
        hostname: 'identitytoolkit.googleapis.com',
        path: `/v1/projects/${PROJECT_ID}/defaultSupportedI

