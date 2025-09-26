#!/usr/bin/env node

/**
 * fix-firebase-auth-comprehensive.js
 * 
 * A comprehensive script to fix the Firebase "auth/api-key-is-not-valid" error.
 * This script:
 * 1. Verifies and updates the API key configuration in Google Cloud
 * 2. Enables the Identity Toolkit API for the API key
 * 3. Prints instructions for manually adding localhost to Firebase authorized domains
 * 4. Includes instructions for clearing browser cache and local storage
 * 5. Creates a test HTML file to verify if the Firebase API key is working
 */

const fs = require('fs');
const path = require('path');
const { execSync, exec } = require('child_process');
const readline = require('readline');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.error('\x1b[31mERROR: .env.local file not found!\x1b[0m');
  process.exit(1);
}

// Terminal colors for better readability
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

// Project configuration
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'timberline-commerce';
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const AUTH_DOMAIN = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;

if (!API_KEY) {
  console.error(`${colors.red}ERROR: Firebase API key not found in .env.local!${colors.reset}`);
  process.exit(1);
}

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
 * Create readline interface for user interaction
 */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Ask user a question
 */
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * Step 1: Verify Google Cloud CLI is installed and user is logged in
 */
async function checkGCloudCLI() {
  logSection('CHECKING GOOGLE CLOUD CLI');
  
  const gcloudResult = runCommand('gcloud --version', { silent: true });
  
  if (!gcloudResult.success) {
    log('Google Cloud SDK (gcloud CLI) not found or not properly installed.', colors.red);
    log('Please install the Google Cloud SDK from: https://cloud.google.com/sdk/docs/install', colors.yellow);
    log('After installation, run: gcloud auth login', colors.yellow);
    process.exit(1);
  }
  
  log('Google Cloud SDK is installed ✓', colors.green);
  
  // Check if user is logged in
  const authResult = runCommand('gcloud auth print-access-token', { silent: true });
  
  if (!authResult.success) {
    log('You are not logged in to Google Cloud.', colors.red);
    log('Please run: gcloud auth login', colors.yellow);
    process.exit(1);
  }
  
  log('You are logged in to Google Cloud ✓', colors.green);
  
  // Check if Firebase project is accessible
  const projectResult = runCommand(`gcloud projects describe ${PROJECT_ID}`, { silent: true });
  
  if (!projectResult.success) {
    log(`Cannot access Firebase project: ${PROJECT_ID}`, colors.red);
    log(`Please make sure you have access to the project and it exists.`, colors.yellow);
    process.exit(1);
  }
  
  log(`Firebase project ${PROJECT_ID} is accessible ✓`, colors.green);
}

/**
 * Step 2: List all API keys for the project
 */
async function listApiKeys() {
  logSection('LISTING API KEYS');
  
  const listResult = runCommand(`gcloud services api-keys list --project=${PROJECT_ID}`);
  
  if (!listResult.success) {
    log('Failed to list API keys.', colors.red);
    return null;
  }
  
  return listResult.output;
}

/**
 * Step 3: Find the API key that matches the one in .env.local
 */
async function findApiKey(apiKeysOutput) {
  logSection('FINDING YOUR API KEY');
  
  log(`Looking for API key: ${API_KEY}`, colors.blue);
  
  const keyIds = [];
  const keyIdRegex = /projects\/\d+\/locations\/global\/keys\/([a-f0-9-]+)/g;
  let match;
  
  while ((match = keyIdRegex.exec(apiKeysOutput)) !== null) {
    keyIds.push(match[1]);
  }
  
  log(`Found ${keyIds.length} API keys in your project.`, colors.blue);
  
  // Get the key string for each key ID and find the matching one
  let matchingKeyId = null;
  
  for (const keyId of keyIds) {
    const keyPath = `projects/${PROJECT_ID}/locations/global/keys/${keyId}`;
    const keyResult = runCommand(`gcloud services api-keys get-key-string ${keyPath}`);
    
    if (keyResult.success) {
      const keyString = keyResult.output.trim().replace('keyString: ', '');
      
      if (keyString === API_KEY) {
        log(`Found matching API key: ${keyId} ✓`, colors.green);
        matchingKeyId = keyId;
        break;
      }
    }
  }
  
  if (!matchingKeyId) {
    log(`Could not find a matching API key in your project.`, colors.red);
    log(`Your API key may be invalid or not belong to this project.`, colors.yellow);
    return null;
  }
  
  return matchingKeyId;
}

/**
 * Step 4: Update API key to enable Identity Toolkit API
 */
async function updateApiKey(keyId) {
  logSection('UPDATING API KEY CONFIGURATION');
  
  const keyPath = `projects/${PROJECT_ID}/locations/global/keys/${keyId}`;
  
  log(`Checking current API key restrictions...`, colors.blue);
  const keyInfoResult = runCommand(`gcloud services api-keys describe ${keyPath} --format=json`);
  
  if (!keyInfoResult.success) {
    log(`Failed to get API key information.`, colors.red);
    return false;
  }
  
  let keyInfo;
  try {
    keyInfo = JSON.parse(keyInfoResult.output);
  } catch (error) {
    log(`Failed to parse API key information: ${error.message}`, colors.red);
    return false;
  }
  
  // Check if Identity Toolkit API is already enabled
  const restrictions = keyInfo.restrictions || {};
  const apiTargets = restrictions.apiTargets || [];
  
  const identityToolkitEnabled = apiTargets.some(target => 
    target.service === 'identitytoolkit.googleapis.com');
  
  if (identityToolkitEnabled) {
    log(`Identity Toolkit API is already enabled for this API key ✓`, colors.green);
    return true;
  }
  
  log(`Enabling Identity Toolkit API for this API key...`, colors.blue);
  const updateResult = runCommand(`gcloud services api-keys update ${keyPath} --api-target=service=identitytoolkit.googleapis.com`);
  
  if (!updateResult.success) {
    log(`Failed to update API key.`, colors.red);
    return false;
  }
  
  log(`Successfully enabled Identity Toolkit API for your API key ✓`, colors.green);
  return true;
}

/**
 * Step 5: Generate a test HTML file
 */
function generateTestFile() {
  logSection('GENERATING TEST FILE');
  
  const testFilePath = path.join(process.cwd(), 'firebase-auth-test.html');
  
  const testFileContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Firebase Authentication Test</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1 {
      color: #1a73e8;
      border-bottom: 2px solid #eee;
      padding-bottom: 10px;
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
    .info {
      background-color: #d1ecf1;
      border-color: #bee5eb;
      color: #0c5460;
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
    button:hover {
      background-color: #1557b0;
    }
    pre {
      background-color: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
    }
    .hidden {
      display: none;
    }
    #results {
      margin-top: 20px;
    }
    #config-display {
      margin-top: 20px;
      white-space: pre-wrap;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <h1>Firebase Authentication Test</h1>
  
  <div class="card info">
    <h2>Firebase Configuration</h2>
    <p>This test will verify if your Firebase API key is valid and properly configured for authentication.</p>
    <p>Current project: <strong>${PROJECT_ID}</strong></p>
    <p>API Key: <strong>${API_KEY}</strong></p>
    <p>Auth Domain: <strong>${AUTH_DOMAIN}</strong></p>
    
    <button id="test-api-key">Test API Key</button>
    <button id="test-auth-domain">Test Auth Domain</button>
  </div>
  
  <div id="results" class="hidden card"></div>
  
  <!-- Firebase SDK -->
  <script type="module">
    // Import the functions you need from the SDKs you need
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
    import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
    
    const firebaseConfig = {
      apiKey: "${API_KEY}",
      authDomain: "${AUTH_DOMAIN}",
      projectId: "${PROJECT_ID}",
      storageBucket: "${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || PROJECT_ID + '.appspot.com'}",
      messagingSenderId: "${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || ''}",
      appId: "${process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''}",
    };
    
    // Initialize Firebase
    let app, auth;
    try {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      console.log("Firebase initialized successfully");
      document.getElementById("config-display").textContent = JSON.stringify(firebaseConfig, null, 2);
    } catch (error) {
      console.error("Firebase initialization error:", error);
      showError("Firebase initialization failed: " + error.message);
    }
    
    // Test API Key
    document.getElementById("test-api-key").addEventListener("click", async () => {
      const results = document.getElementById("results");
      results.className = "card";
      results.innerHTML = "<h2>Testing API Key...</h2><p>Attempting to use the API key with Firebase Authentication...</p>";
      results.classList.remove("hidden");
      
      try {
        // Try a Firebase Auth operation that requires the API key
        // We'll use an invalid login which should give a specific auth error, not an API key error
        await signInWithEmailAndPassword(auth, "test@example.com", "invalidpassword")
          .catch(error => {
            // We expect this to fail, but with

