#!/usr/bin/env node

/**
 * Firebase Authentication Fix Script
 * 
 * This script diagnoses and fixes common issues with Firebase authentication,
 * specifically the "auth/api-key-is-not-valid" error.
 * 
 * It performs the following:
 * 1. Verifies the Firebase API key in .env.local
 * 2. Checks if localhost is in the authorized domains for Firebase Auth
 * 3. Adds localhost to authorized domains if not present
 * 4. Provides instructions for checking API key restrictions
 */

const fs = require('fs');
const path = require('path');
const { execSync, exec } = require('child_process');
const https = require('https');
const util = require('util');
const execAsync = util.promisify(exec);

// Project configuration
const PROJECT_ID = 'timberline-commerce';
const ENV_FILE_PATH = path.join(process.cwd(), '.env.local');
const EXPECTED_API_KEY = 'AIzaSyDRyZFjrrGB3mBcMf6ug3qp_M2i7XllmF4';

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

/**
 * Logs a message with color
 */
function log(message, color = colors.white) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Logs a section header
 */
function logSection(title) {
  console.log('\n' + colors.bold + colors.cyan + '='.repeat(80) + colors.reset);
  console.log(colors.bold + colors.cyan + ` ${title} ` + colors.reset);
  console.log(colors.bold + colors.cyan + '='.repeat(80) + colors.reset + '\n');
}

/**
 * Get Firebase API key from .env.local
 */
function getApiKeyFromEnv() {
  try {
    if (!fs.existsSync(ENV_FILE_PATH)) {
      log(`${ENV_FILE_PATH} doesn't exist!`, colors.red);
      return null;
    }

    const envContent = fs.readFileSync(ENV_FILE_PATH, 'utf8');
    const apiKeyMatch = envContent.match(/NEXT_PUBLIC_FIREBASE_API_KEY="([^"]+)"/);
    return apiKeyMatch ? apiKeyMatch[1] : null;
  } catch (error) {
    log(`Error reading .env.local: ${error}`, colors.red);
    return null;
  }
}

/**
 * Verifies Firebase CLI is installed and user is logged in
 */
async function checkFirebaseCLI() {
  try {
    const { stdout } = await execAsync('firebase --version');
    log(`Firebase CLI version: ${stdout.trim()}`, colors.green);
    
    // Check if user is logged in
    const loginResult = await execAsync('firebase projects:list');
    if (loginResult.stdout.includes(PROJECT_ID)) {
      log(`Logged in to Firebase and connected to project: ${PROJECT_ID}`, colors.green);
      return true;
    } else {
      log(`Firebase CLI is installed but not logged in to project: ${PROJECT_ID}`, colors.yellow);
      return false;
    }
  } catch (error) {
    log(`Firebase CLI is not installed or not properly configured: ${error.message}`, colors.red);
    log('Install Firebase CLI with: npm install -g firebase-tools', colors.yellow);
    log('Then login with: firebase login', colors.yellow);
    return false;
  }
}

/**
 * Get Access Token from gcloud
 */
async function getAccessToken() {
  try {
    const { stdout } = await execAsync('gcloud auth print-access-token');
    return stdout.trim();
  } catch (error) {
    log(`Error getting access token: ${error.message}`, colors.red);
    return null;
  }
}

/**
 * Get Firebase SDK config for web app
 */
async function getFirebaseSDKConfig() {
  try {
    const result = await execAsync(`firebase apps:sdkconfig WEB --project=${PROJECT_ID}`);
    const configOutput = result.stdout;
    
    // Parse the JSON from the output
    const jsonStart = configOutput.indexOf('{');
    const jsonEnd = configOutput.lastIndexOf('}') + 1;
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      const configJson = configOutput.substring(jsonStart, jsonEnd);
      return JSON.parse(configJson);
    } else {
      log('Could not find SDK config in Firebase CLI output', colors.red);
      return null;
    }
  } catch (error) {
    log(`Error getting Firebase SDK config: ${error.message}`, colors.red);
    return null;
  }
}

/**
 * Check authorized domains and add localhost if needed
 */
async function checkAndUpdateAuthorizedDomains() {
  log('Checking authorized domains for Firebase Authentication...', colors.blue);
  
  try {
    const token = await getAccessToken();
    if (!token) {
      log('Failed to get access token. Unable to check authorized domains.', colors.red);
      return false;
    }
    
    // Attempt to get authorized domains
    const options = {
      hostname: 'identitytoolkit.googleapis.com',
      path: `/v1/projects/${PROJECT_ID}:oobConfigs`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    return new Promise((resolve) => {
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', async () => {
          if (res.statusCode === 200) {
            try {
              const response = JSON.parse(data);
              const domains = response.authorizedDomains || [];
              
              log('Current authorized domains:', colors.blue);
              domains.forEach(domain => {
                log(`- ${domain}`, colors.green);
              });
              
              // Check if localhost is in the authorized domains
              const hasLocalhost = domains.includes('localhost');
              
              if (!hasLocalhost) {
                log('localhost is not in the list of authorized domains. Adding it...', colors.yellow);
                
                // Use fix-google-auth.js if it exists, otherwise provide manual instructions
                try {
                  log('Attempting to add localhost to authorized domains...', colors.blue);
                  const updateResult = await runFirebaseOperation('add-authorized-domain', 'localhost');
                  if (updateResult) {
                    log('Successfully added localhost to authorized domains!', colors.green);
                  } else {
                    provideManualInstructions();
                  }
                } catch (error) {
                  log(`Error adding localhost to authorized domains: ${error.message}`, colors.red);
                  provideManualInstructions();
                }
              } else {
                log('localhost is already in the list of authorized domains.', colors.green);
              }
              
              resolve(true);
            } catch (error) {
              log(`Error parsing authorized domains: ${error.message}`, colors.red);
              provideManualInstructions();
              resolve(false);
            }
          } else {
            log(`Error fetching authorized domains: ${res.statusCode} ${res.statusMessage}`, colors.red);
            log(`Response: ${data}`, colors.red);
            provideManualInstructions();
            resolve(false);
          }
        });
      });
      
      req.on('error', (error) => {
        log(`Network error checking authorized domains: ${error.message}`, colors.red);
        provideManualInstructions();
        resolve(false);
      });
      
      req.end();
    });
  } catch (error) {
    log(`Error checking authorized domains: ${error.message}`, colors.red);
    provideManualInstructions();
    return false;
  }
}

/**
 * Run a Firebase operation using available scripts
 */
async function runFirebaseOperation(operation, param) {
  const scriptPath = path.join(process.cwd(), 'fix-google-auth.js');
  
  if (fs.existsSync(scriptPath)) {
    log(`Using existing script: ${scriptPath}`, colors.blue);
    try {
      await execAsync(`node ${scriptPath}`);
      return true;
    } catch (error) {
      log(`Error running script: ${error.message}`, colors.red);
      return false;
    }
  } else {
    return false;
  }
}

/**
 * Provide manual instructions for Firebase auth setup
 */
function provideManualInstructions() {
  logSection('MANUAL FIREBASE AUTHENTICATION SETUP');
  
  log('1. Go to Firebase Console:', colors.yellow);
  log(`   https://console.firebase.google.com/project/${PROJECT_ID}/authentication/settings`, colors.cyan);
  log('2. In the "Authorized domains" section, click "Add domain"', colors.yellow);
  log('3. Add "localhost" as an authorized domain', colors.yellow);
  log('4. Click "Add"', colors.yellow);
}

/**
 * Check if the API key has restrictions in Google Cloud Console
 */
function checkApiKeyRestrictions() {
  logSection('API KEY RESTRICTIONS');
  
  log('Your API key might have restrictions that prevent it from being used for authentication.', colors.yellow);
  log('To check and modify API key restrictions:', colors.yellow);
  log('1. Go to Google Cloud Console:', colors.cyan);
  log(`   https://console.cloud.google.com/apis/credentials?project=${PROJECT_ID}`, colors.cyan);
  log('2. Find your API key in the list (likely named "Browser key (auto created by Firebase)")', colors.yellow);
  log('3. Click on the API key to view its settings', colors.yellow);
  log('4. Check the "Application restrictions" section:', colors.yellow);
  log('   - If set to "HTTP referrers", make sure your development URL is included', colors.yellow);
  log('   - Consider setting to "None" temporarily for testing', colors.yellow);
  log('5. Check the "API restrictions" section:', colors.yellow);
  log('   - If set to "Restrict key", ensure "Identity Toolkit API" is selected', colors.yellow);
  log('   - Consider setting to "Don\'t restrict key" temporarily for testing', colors.yellow);
  log('6. Click "Save" if you make any changes', colors.yellow);
}

/**
 * Main function
 */
async function main() {
  logSection('FIREBASE AUTHENTICATION DIAGNOSTICS');
  
  // Step 1: Check Firebase CLI
  log('Step 1: Checking Firebase CLI...', colors.blue);
  const cliOk = await checkFirebaseCLI();
  if (!cliOk) {
    log('Please install and configure Firebase CLI before continuing.', colors.red);
    return;
  }
  
  // Step 2: Verify API key in .env.local
  log('\nStep 2: Verifying API key in .env.local...', colors.blue);
  const apiKey = getApiKeyFromEnv();
  
  if (!apiKey) {
    log('API key not found in .env.local', colors.red);
    log(`Please set NEXT_PUBLIC_FIREBASE_API_KEY="${EXPECTED_API_KEY}" in .env.local`, colors.yellow);
  } else if (apiKey !== EXPECTED_API_KEY) {
    log(`API key in .env.local (${apiKey}) doesn't match expected key (${EXPECTED_API_KEY})`, colors.red);
    log(`Please update NEXT_PUBLIC_FIREBASE_API_KEY="${EXPECTED_API_KEY}" in .env.local`, colors.yellow);
  } else {
    log(`API key is correctly set to "${apiKey}" in .env.local`, colors.green);
  }
  
  // Step 3: Get Firebase SDK config
  log('\nStep 3: Verifying Firebase configuration...', colors.blue);
  const sdkConfig = await getFirebaseSDKConfig();
  
  if (sdkConfig) {
    log('Firebase SDK configuration retrieved successfully:', colors.green);
    log(JSON.stringify(sdkConfig, null, 2), colors.cyan);
    
    // Verify config matches .env.local
    if (sdkConfig.apiKey !== apiKey) {
      log(`Warning: API key in SDK config (${sdkConfig.apiKey}) doesn't match .env.local (${apiKey})`, colors.red);
    } else {
      log('API key in SDK config matches .env.local', colors.green);
    }
  } else {
    log('Could not retrieve Firebase SDK configuration', colors.red);
  }
  
  // Step 4: Check and update authorized domains
  log('\nStep 4: Checking authorized domains...', colors.blue);
  await checkAndUpdateAuthorizedDomains();
  
  // Step 5: Check API key restrictions
  log('\nStep 5: Checking API key restrictions...', colors.blue);
  checkApiKeyRestrictions();
  
  logSection('SUMMARY');
  log('If you\'re still experiencing "auth/api-key-is-not-valid" errors:', colors.yellow);
  log('1. Double-check that your API key is correct in .env.local', colors.yellow);
  log('2. Ensure "localhost" is added to authorized domains in Firebase Console', colors.yellow);
  log('3. Check for API key restrictions in Google Cloud Console', colors.yellow);
  log('4. Clear browser cache and cookies, then try again', colors.yellow);
  log('5. Try using a different browser to rule out extension conflicts', colors.yellow);
  log('\nFor more help, visit: https://firebase.google.com/docs/auth/web/google-signin', colors.cyan);
}

// Run the script
main().catch(error => {
  log(`Uncaught error: ${error.message}`, colors.red);
  log(error.stack, colors.red);
});

