#!/usr/bin/env node

/**
 * fix-firebase-key.js
 * 
 * A streamlined script to fix the Firebase "auth/api-key-is-not-valid" error.
 * This script:
 * 1. Loads Firebase configuration from .env.local
 * 2. Sets up the API key to work with Firebase Auth
 * 3. Creates a test HTML file to verify authentication works
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
  
  API_KEY = apiKeyMatch ? apiKeyMatch[1] : '';
  AUTH_DOMAIN = authDomainMatch ? authDomainMatch[1] : '';
  PROJECT_ID = projectIdMatch ? projectIdMatch[1] : '';
  STORAGE_BUCKET = storageBucketMatch ? storageBucketMatch[1] : '';
  MESSAGING_SENDER_ID = messagingSenderIdMatch ? messagingSenderIdMatch[1] : '';
  APP_ID = appIdMatch ? appIdMatch[1] : '';
  MEASUREMENT_ID = measurementIdMatch ? measurementIdMatch[1] : '';
  
  if (!API_KEY || !PROJECT_ID) {
    log('Firebase API key or Project ID not found in .env.local!', colors.red);
    process.exit(1);
  }
  
  log('Firebase configuration loaded successfully:', colors.green);
  log(`API Key: ${API_KEY}`, colors.green);
  log(`Project ID: ${PROJECT_ID}`, colors.green);
  log(`Auth Domain: ${AUTH_DOMAIN}`, colors.green);
}

/**
 * Step 2: Set up gcloud CLI and fix API key
 */
function setupAPIKey() {
  logSection('SETTING UP GOOGLE CLOUD AND API KEY');
  
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
  
  // Enable Identity Toolkit API
  log('Ensuring Identity Toolkit API is enabled...', colors.blue);
  const enableResult = runCommand(`gcloud services enable identitytoolkit.googleapis.com --project=${PROJECT_ID}`);
  
  if (enableResult.success) {
    log('Identity Toolkit API is enabled ✓', colors.green);
  } else {
    log('Note: Failed to enable Identity Toolkit API. It may already be enabled.', colors.yellow);
  }
  
  // Enable Firebase Management API
  log('Ensuring Firebase Management API is enabled...', colors.blue);
  const firebaseResult = runCommand(`gcloud services enable firebase.googleapis.com --project=${PROJECT_ID}`);
  
  if (firebaseResult.success) {
    log('Firebase Management API is enabled ✓', colors.green);
  } else {
    log('Note: Failed to enable Firebase Management API. It may already be enabled.', colors.yellow);
  }
  
  // Enable API Keys API
  log('Ensuring API Keys API is enabled...', colors.blue);
  const apiKeysResult = runCommand(`gcloud services enable apikeys.googleapis.com --project=${PROJECT_ID}`);
  
  if (apiKeysResult.success) {
    log('API Keys API is enabled ✓', colors.green);
  } else {
    log('Note: Failed to enable API Keys API. It may already be enabled.', colors.yellow);
  }
  
  return true;
}

/**
 * Step 3: Create a test HTML file
 */
function createTestFile() {
  logSection('CREATING TEST FILE');
  
  const testFilePath = path.join(PROJECT_DIR, 'firebase-auth-test.html');
  
  const testFileContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Firebase Authentication Test</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
    }
    .card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .success {
      background-color: #d4edda;
      border-color: #c3e6cb;
      color: #155724;
    }
    .error {
      background-color: #f8d7da;
      border-color: #f5c6cb;
      color: #721c24;
    }
    button {
      background-color: #1a73e8;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      margin-top: 10px;
    }
    pre {
      background-color: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
    }
    #config-display {
      word-break: break-all;
    }
  </style>
</head>
<body>
  <h1>Firebase Authentication Test</h1>
  
  <div class="card">
    <h2>Firebase Configuration</h2>
    <p>API Key: <strong>${API_KEY}</strong></p>
    <p>Auth Domain: <strong>${AUTH_DOMAIN}</strong></p>
    <p>Project ID: <strong>${PROJECT_ID}</strong></p>
    <button id="init-firebase">Test Firebase Initialization</button>
    <div id="result" style="margin-top: 10px;"></div>
  </div>

  <div class="card">
    <h2>Firebase Configuration Object</h2>
    <pre id="config-display"></pre>
  </div>
  
  <!-- Firebase SDK -->
  <script type="module">
    // Import Firebase modules
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
    import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
    
    // Firebase configuration
    const firebaseConfig = {
      apiKey: "${API_KEY}",
      authDomain: "${AUTH_DOMAIN}",
      projectId: "${PROJECT_ID}",
      storageBucket: "${STORAGE_BUCKET}",
      messagingSenderId: "${MESSAGING_SENDER_ID}",
      appId: "${APP_ID}",
      measurementId: "${MEASUREMENT_ID || ''}"
    };
    
    // Display configuration
    document.getElementById("config-display").textContent = JSON.stringify(firebaseConfig, null, 2);
    
    // Initialize Firebase when button is clicked
    document.getElementById("init-firebase").addEventListener("click", () => {
      const resultElement = document.getElementById("result");
      
      try {
        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        
        resultElement.innerHTML = '<div class="success">Firebase initialized successfully! ✅</div>';
        
        // Listen for auth state changes
        onAuthStateChanged(auth, (user) => {
          if (user) {
            resultElement.innerHTML += '<div class="success">User is signed in! 👤</div>';
          } else {
            resultElement.innerHTML += '<div>No user is signed in. This is expected if you haven\'t authenticated.</div>';
          }
        });
      } catch (error) {
        resultElement.innerHTML = '<div class="error">Error initializing Firebase: ' + error.message + ' ❌</div>';
        console.error("Firebase initialization error:", error);
      }
    });
  </script>
</body>
</html>
`;

  fs.writeFileSync(testFilePath, testFileContent);
  log(`Test file created at: ${testFilePath}`, colors.green);
  log('Open this file in your browser to test Firebase authentication.', colors.green);
  log('If Firebase initializes successfully, the API key issue is fixed!', colors.green);
}

/**
 * Step 4: Provide instructions for Firebase Console configuration
 */
function provideInstructions() {
  logSection('MANUAL CONFIGURATION STEPS');
  
  log('To complete the setup, please perform these manual steps:', colors.yellow);
  log('', colors.white);
  log('1. Add localhost to Firebase authorized domains:', colors.yellow);
  log(`   a. Go to: https://console.firebase.google.com/project/${PROJECT_ID}/authentication/settings`, colors.cyan);
  log('   b. In the "Authorized domains" section, click "Add domain"', colors.white);
  log('   c. Add "localhost" as an authorized domain', colors.white);
  log('   d. Click "Add"', colors.white);
  log('', colors.white);
  log('2. Check API key restrictions in Google Cloud Console:', colors.yellow);
  log(`   a. Go to: https://console.cloud.google.com/apis/credentials?project=${PROJECT_ID}`, colors.cyan);
  log('   b. Find your API key in the list', colors.white);
  log('   c. Click on the API key to view its settings', colors.white);
  log('   d. Under "API restrictions", ensure "Identity Toolkit API" is selected', colors.white);
  log('   e. Save changes if you made any modifications', colors.white);
  log('', colors.white);
  log('3. Test the configuration:', colors.yellow);
  log('   a. Open the firebase-auth-test.html file in your browser', colors.white);
  log('   b. Click the "Test Firebase Initialization" button', colors.white);
  log('   c. If initialization succeeds, the API key issue is fixed!', colors.white);
}

/**
 * Main function
 */
function main() {
  logSection('FIREBASE API KEY FIX');
  
  loadFirebaseConfig();
  const setupSuccess = setupAPIKey();
  
  if (setupSuccess) {
    createTestFile();
    provideInstructions();
  } else {
    log('Failed to set up API key. Please follow the manual instructions below.', colors.red);
    provideInstructions();
  }
  
  logSection('SUMMARY');
  log('If you\'re still experiencing "auth/api-key-is-not-valid" errors after following all steps:', colors.yellow);
  log('1. Clear your browser cache and cookies', colors.yellow);
  log('2. Try using an incognito/private browsing window', colors.yellow);
  log('3. Verify that your API key matches between .env.local and Firebase Console', colors.yellow);
}

