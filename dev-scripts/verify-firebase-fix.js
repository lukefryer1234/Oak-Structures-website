#!/usr/bin/env node

/**
 * verify-firebase-fix.js
 * 
 * A simple script to verify that the Firebase API key is working correctly.
 * This will load the Firebase configuration from .env.local, initialize Firebase,
 * and attempt a simple operation to confirm the API key is valid.
 */

const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getAuth, connectAuthEmulator, signInAnonymously } = require('firebase/auth');

// Terminal colors for better readability
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m'
};

// Get the current working directory
const PROJECT_DIR = process.cwd();
const ENV_FILE_PATH = path.join(PROJECT_DIR, '.env.local');

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
 * Load Firebase configuration from .env.local
 */
function loadFirebaseConfig() {
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
  
  const firebaseConfig = {
    apiKey: apiKeyMatch ? apiKeyMatch[1] : '',
    authDomain: authDomainMatch ? authDomainMatch[1] : '',
    projectId: projectIdMatch ? projectIdMatch[1] : '',
    storageBucket: storageBucketMatch ? storageBucketMatch[1] : '',
    messagingSenderId: messagingSenderIdMatch ? messagingSenderIdMatch[1] : '',
    appId: appIdMatch ? appIdMatch[1] : '',
    measurementId: measurementIdMatch ? measurementIdMatch[1] : ''
  };
  
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    log('Firebase API key or Project ID not found in .env.local!', colors.red);
    process.exit(1);
  }
  
  return firebaseConfig;
}

/**
 * Verify Firebase API key by initializing Firebase and making a simple auth call
 */
async function verifyApiKey(firebaseConfig) {
  try {
    log('Initializing Firebase with configuration:', colors.blue);
    log(JSON.stringify(firebaseConfig, null, 2), colors.white);
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    log('Firebase initialized successfully ✓', colors.green);
    
    // Get auth instance
    const auth = getAuth(app);
    log('Firebase Auth instance created successfully ✓', colors.green);
    
    // Try a simple auth operation (anonymous sign-in)
    log('Testing API key with anonymous authentication...', colors.blue);
    const userCredential = await signInAnonymously(auth);
    
    log(`Authentication successful! User ID: ${userCredential.user.uid} ✓`, colors.green);
    log('API key is valid and working correctly ✓', colors.bgGreen + colors.bold);
    
    return true;
  } catch (error) {
    log('Error during Firebase operation:', colors.red);
    log(`Error code: ${error.code}`, colors.red);
    log(`Error message: ${error.message}`, colors.red);
    
    if (error.code === 'auth/api-key-not-valid') {
      log('API KEY VALIDATION FAILED! The API key is still not valid.', colors.bgRed + colors.bold);
      log('\nPossible reasons:', colors.yellow);
      log('1. The API key in .env.local is incorrect', colors.white);
      log('2. The API key doesn\'t have Identity Toolkit API enabled', colors.white);
      log('3. There are API key restrictions preventing its use', colors.white);
    } else if (error.code === 'auth/operation-not-allowed') {
      log('Anonymous authentication is not enabled for this project.', colors.yellow);
      log('This doesn\'t necessarily mean your API key is invalid.', colors.yellow);
      log('Try enabling Anonymous Authentication in the Firebase Console.', colors.white);
    }
    
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  logSection('FIREBASE API KEY VERIFICATION');
  
  try {
    const firebaseConfig = loadFirebaseConfig();
    const isApiKeyValid = await verifyApiKey(firebaseConfig);
    
    if (isApiKeyValid) {
      logSection('VERIFICATION SUCCESSFUL');
      log('The "auth/api-key-is-not-valid" error has been fixed!', colors.green);
    } else {
      logSection('VERIFICATION FAILED');
      log('The API key validation still has issues.', colors.red);
      log('Please review the steps in the open-firebase-console.sh script.', colors.yellow);
    }
  } catch (error) {
    log(`Unexpected error: ${error.message}`, colors.red);
    log(error.stack, colors.red);
  }
}

// Run the script
main();

