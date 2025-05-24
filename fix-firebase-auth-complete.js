#!/usr/bin/env node

/**
 * fix-firebase-auth-complete.js
 * 
 * A comprehensive script to fix the Firebase "auth/api-key-is-not-valid" error.
 * This script:
 * 1. Fixes path inconsistencies in configuration files
 * 2. Ensures the Identity Toolkit API is enabled for your API key
 * 3. Adds localhost to Firebase authorized domains
 * 4. Creates a test HTML file to verify everything works
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');
const readline = require('readline');
const dotenv = require('dotenv');

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

// Create readline interface for user interaction
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get the current working directory
const PROJECT_DIR = process.cwd();
const ENV_FILE_PATH = path.join(PROJECT_DIR, '.env.local');

// Load environment variables
if (fs.existsSync(ENV_FILE_PATH)) {
  dotenv.config({ path: ENV_FILE_PATH });
} else {
  console.error(`${colors.red}ERROR: .env.local file not found!${colors.reset}`);
  process.exit(1);
}

// Project configuration from environment variables
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const AUTH_DOMAIN = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const STORAGE_BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const MESSAGING_SENDER_ID = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const APP_ID = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
const MEASUREMENT_ID = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

// Validate required configuration
if (!API_KEY) {
  console.error(`${colors.red}ERROR: Firebase API key not found in .env.local!${colors.reset}`);
  process.exit(1);
}

if (!PROJECT_ID) {
  console.error(`${colors.red}ERROR: Firebase project ID not found in .env.local!${colors.reset}`);
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
 * Step 1: Fix path inconsistencies in configuration files
 */
async function fixPathInconsistencies() {
  logSection('FIXING PATH INCONSISTENCIES');
  
  // Check for inconsistencies in check-firebase-config.js
  const configCheckPath = path.join(PROJECT_DIR, 'check-firebase-config.js');
  
  if (fs.existsSync(configCheckPath)) {
    let content = fs.readFileSync(configCheckPath, 'utf8');
    
    // Find hardcoded paths and replace them with the correct project directory
    const hardcodedPaths = [
      '/Users/lukefryer/Oak-Structures-website/',
      '/Users/lukefryer/Oak-Structures-website'
    ];
    
    let modified = false;
    for (const hardcodedPath of hardcodedPaths) {
      if (content.includes(hardcodedPath)) {
        content = content.replace(new RegExp(hardcodedPath, 'g'), PROJECT_DIR + '/');
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(configCheckPath, content);
      log(`Fixed path inconsistencies in ${configCheckPath}`, colors.green);
    } else {
      log(`No path inconsistencies found in ${configCheckPath}`, colors.green);
    }
  }
  
  // Check other common files that might have hardcoded paths
  const filesToCheck = [
    'fix-firebase-auth.js',
    'add-localhost-auth-domain.js',
    'enable-google-auth.js'
  ];
  
  for (const file of filesToCheck) {
    const filePath = path.join(PROJECT_DIR, file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Find hardcoded paths and replace them with the correct project directory
      const hardcodedPaths = [
        '/Users/lukefryer/Oak-Structures-website/',
        '/Users/lukefryer/Oak-Structures-website'
      ];
      
      let modified = false;
      for (const hardcodedPath of hardcodedPaths) {
        if (content.includes(hardcodedPath)) {
          content = content.replace(new RegExp(hardcodedPath, 'g'), PROJECT_DIR + '/');
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(filePath, content);
        log(`Fixed path inconsistencies in ${filePath}`, colors.green);
      }
    }
  }
}

/**
 * Step 2: Check Google Cloud CLI and authentication
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
  
  // Set quota project to fix potential API access issues
  const quotaResult = runCommand(`gcloud auth application-default set-quota-project ${PROJECT_ID}`, { silent: true });
  if (quotaResult.success) {
    log(`Set ${PROJECT_ID} as quota project for Application Default Credentials ✓`, colors.green);
  }
}

/**
 * Step 3: Enable required APIs
 */
async function enableRequiredAPIs() {
  logSection('ENABLING REQUIRED APIS');
  
  // Check if Identity Toolkit API is enabled
  const identityToolkitResult = runCommand(`gcloud services list --enabled --filter="name:identitytoolkit.googleapis.com" --project=${PROJECT_ID}`, { silent: true });
  
  if (!identityToolkitResult.success || !identityToolkitResult.output.includes('identitytoolkit.googleapis.com')) {
    log('Identity Toolkit API is not enabled. Enabling it now...', colors.yellow);
    
    const enableResult = runCommand(`gcloud services enable identitytoolkit.googleapis.com --project=${PROJECT_ID}`);
    
    if (enableResult.success) {
      log('Successfully enabled Identity Toolkit API ✓', colors.green);
    } else {
      log('Failed to enable Identity Toolkit API. Trying to continue anyway...', colors.red);
    }
  } else {
    log('Identity Toolkit API is already enabled ✓', colors.green);
  }
  
  // Check if Firebase Management API is enabled
  const firebaseApiResult = runCommand(`gcloud services list --enabled --filter="name:firebase.googleapis.com" --project=${PROJECT_ID}`, { silent: true });
  
  if (!firebaseApiResult.success || !firebaseApiResult.output.includes('firebase.googleapis.com')) {
    log('Firebase Management API is not enabled. Enabling it now...', colors.yellow);
    
    const enableResult = runCommand(`gcloud services enable firebase.googleapis.com --project=${PROJECT_ID}`);
    
    if (enableResult.success) {
      log('Successfully enabled Firebase Management API ✓', colors.green);
    } else {
      log('Failed to enable Firebase Management API. Trying to continue anyway...', colors.red);
    }
  } else {
    log('Firebase Management API is already enabled ✓', colors.green);
  }
}

/**
 * Step 4: Update API key to enable Identity Toolkit API
 */
async function updateApiKey() {
  logSection('UPDATING API KEY CONFIGURATION');
  
  // List API keys
  const listResult = runCommand(`gcloud services api-keys list --project=${PROJECT_ID}`);
  
  if (!listResult.success) {
    log('Failed to list API keys.', colors.red);
    log('You may need to enable the API Keys API:', colors.yellow);
    log(`gcloud services enable apikeys.googleapis.com --project=${PROJECT_ID}`, colors.yellow);
    return false;
  }
  
  const apiKeysOutput = listResult.output;
  
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
    return false;
  }
  
  // Update API key to enable Identity Toolkit API
  const keyPath = `projects/${PROJECT_ID}/locations/global/keys/${matchingKeyId}`;
  
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
  
  // Check if Identity

#!/usr/bin/env node

/**
 * fix-firebase-auth-complete.js
 * 
 * A comprehensive script to fix the Firebase "auth/api-key-is-not-valid" error.
 * This script:
 * 1. Fixes path inconsistencies in existing configuration files
 * 2. Verifies API key in .env.local and Firebase project
 * 3. Enables the Identity Toolkit API for the API key
 * 4. Adds localhost to Firebase authorized domains
 * 5. Creates a test HTML file to verify Firebase authentication
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');
const readline = require('readline');

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

// Create readline interface for user interaction
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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
 * Step 1: Fix path inconsistencies in configuration files
 */
async function fixPathInconsistencies() {
  logSection('FIXING PATH INCONSISTENCIES');
  
  // Check for inconsistencies in check-firebase-config.js
  const configCheckPath = path.join(PROJECT_DIR, 'check-firebase-config.js');
  
  if (fs.existsSync(configCheckPath)) {
    let content = fs.readFileSync(configCheckPath, 'utf8');
    
    // Find hardcoded paths and replace them with the correct project directory
    const hardcodedPaths = [
      '/Users/lukefryer/Oak-Structures-website/',
      '/Users/lukefryer/Oak-Structures-website'
    ];
    
    let modified = false;
    for (const hardcodedPath of hardcodedPaths) {
      if (content.includes(hardcodedPath)) {
        content = content.replace(new RegExp(hardcodedPath, 'g'), PROJECT_DIR + '/');
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(configCheckPath, content);
      log(`Fixed path inconsistencies in ${configCheckPath}`, colors.green);
    } else {
      log(`No path inconsistencies found in ${configCheckPath}`, colors.green);
    }
  }
  
  // Check other common files that might have hardcoded paths
  const filesToCheck = [
    'fix-firebase-auth.js',
    'add-localhost-auth-domain.js',
    'enable-google-auth.js'
  ];
  
  for (const file of filesToCheck) {
    const filePath = path.join(PROJECT_DIR, file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Find hardcoded paths and replace them with the correct project directory
      const hardcodedPaths = [
        '/Users/lukefryer/Oak-Structures-website/',
        '/Users/lukefryer/Oak-Structures-website'
      ];
      
      let modified = false;
      for (const hardcodedPath of hardcodedPaths) {
        if (content.includes(hardcodedPath)) {
          content = content.replace(new RegExp(hardcodedPath, 'g'), PROJECT_DIR + '/');
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(filePath, content);
        log(`Fixed path inconsistencies in ${filePath}`, colors.green);
      }
    }
  }
}

/**
 * Step 2: Load Firebase configuration from .env.local
 */
async function loadFirebaseConfig() {
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
 * Step 3: Check Google Cloud CLI and authentication
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
 * Step 4: Update API key to enable Identity Toolkit API
 */
async function updateApiKey() {
  logSection('UPDATING API KEY CONFIGURATION');
  
  // List API keys
  const listResult = runCommand(`gcloud services api-keys list --project=${PROJECT_ID}`);
  
  if (!listResult.success) {
    log('Failed to list API keys.', colors.red);
    return false;
  }
  
  const apiKeysOutput = listResult.output;
  
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
    return false;
  }
  
  // Update API key to enable Identity Toolkit API
  const keyPath = `projects/${PROJECT_ID}/locations/global/keys/${matchingKeyId}`;
  
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
  } else {
    log(`Enabling Identity Toolkit API for this API key...`, colors.blue);
    const updateResult = runCommand(`gcloud services api-keys update ${keyPath} --api-target=service=identitytoolkit.googleapis.com`);
    
    if (!updateResult.success) {
      log(`Failed to update API key.`, colors.re

