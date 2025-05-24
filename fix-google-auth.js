/**
 * Script to fix Google Authentication provider in Firebase
 * This script uses the Firebase Auth REST API to properly enable Google as an auth provider
 */
const https = require('https');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Firebase project configuration
const projectId = 'timberline-commerce';
const webApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBRhJGI8HmTvUIgfWeoX-h1-YIg9phMP-U';

async function getAccessToken() {
  try {
    console.log('Getting access token from gcloud...');
    const { stdout } = await execPromise('gcloud auth print-access-token');
    return stdout.trim();
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

/**
 * Get current auth config to check if Google provider is enabled
 */
async function getAuthConfig(token) {
  console.log('Checking current auth configuration...');
  
  const options = {
    hostname: 'identitytoolkit.googleapis.com',
    path: `/v1/projects/${projectId}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          console.error(`Error: Status code ${res.statusCode}`);
          console.error('Response:', data);
          reject(new Error(`Failed to get auth config: ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Request error:', error);
      reject(error);
    });
    
    req.end();
  });
}

/**
 * Enable Google as an auth provider
 */
async function enableGoogleProvider(token) {
  console.log('Enabling Google authentication provider...');
  
  const options = {
    hostname: 'identitytoolkit.googleapis.com',
    path: `/v1/projects/${projectId}:updateConfig`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };
  
  const data = JSON.stringify({
    signIn: {
      allowDuplicateEmails: false,
      providers: ['google.com', 'password', 'anonymous']
    }
  });
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('Google authentication provider enabled successfully!');
          resolve(JSON.parse(responseData));
        } else {
          console.error(`Error: Status code ${res.statusCode}`);
          console.error('Response:', responseData);
          reject(new Error(`Failed to enable Google provider: ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Request error:', error);
      reject(error);
    });
    
    req.write(data);
    req.end();
  });
}

/**
 * Configure OAuth client ID in Firebase project
 */
async function configureOAuthSettings(token) {
  console.log('Configuring OAuth settings...');
  
  // Get the current hostname for authorized domains
  const hostname = 'timberline-commerce.web.app';
  
  const options = {
    hostname: 'identitytoolkit.googleapis.com',
    path: `/v1/projects/${projectId}:updateConfig`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };
  
  const data = JSON.stringify({
    authorizedDomains: [hostname, 'localhost']
  });
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('OAuth settings configured successfully!');
          resolve(JSON.parse(responseData));
        } else {
          console.error(`Error: Status code ${res.statusCode}`);
          console.error('Response:', responseData);
          reject(new Error(`Failed to configure OAuth settings: ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Request error:', error);
      reject(error);
    });
    
    req.write(data);
    req.end();
  });
}

/**
 * Display instructions for manual configuration through Firebase Console
 */
function displayManualInstructions() {
  console.log('\n');
  console.log('=================================================================');
  console.log('MANUAL CONFIGURATION STEPS (if the script was not successful):');
  console.log('=================================================================');
  console.log('1. Go to Firebase Console: https://console.firebase.google.com/project/timberline-commerce/authentication/providers');
  console.log('2. Click on "Google" in the "Sign-in providers" section');
  console.log('3. Toggle the "Enable" switch to ON');
  console.log('4. Configure the OAuth consent screen in Google Cloud Console if prompted');
  console.log('5. Save the changes');
  console.log('=================================================================');
  console.log('\n');
}

/**
 * Check if web API key is valid
 */
async function checkWebApiKey() {
  console.log('Verifying Firebase Web API Key...');
  
  const options = {
    hostname: 'identitytoolkit.googleapis.com',
    path: `/v1/projects/${projectId}:lookup?key=${webApiKey}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  const data = JSON.stringify({
    // Empty request to just check if API key is valid
  });
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        // Even a 400 error with invalid request is fine - we're just checking if the API key is accepted
        if (res.statusCode !== 401 && res.statusCode !== 403) {
          console.log('Firebase Web API Key appears to be valid!');
          resolve(true);
        } else {
          console.error('Firebase Web API Key is invalid or restricted!');
          console.error('Response:', responseData);
          reject(new Error('Invalid API Key'));
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Request error:', error);
      reject(error);
    });
    
    req.write(data);
    req.end();
  });
}

/**
 * Main function
 */
async function main() {
  try {
    // First check if the web API key is valid
    await checkWebApiKey();
    
    // Get access token
    const token = await getAccessToken();
    
    // Get current auth config
    const config = await getAuthConfig(token);
    console.log('Current auth config retrieved.');
    
    // Enable Google provider
    await enableGoogleProvider(token);
    
    // Configure OAuth settings
    await configureOAuthSettings(token);
    
    console.log('\n✅ Google authentication has been successfully configured!');
    console.log('You can now use Google Sign-In in your Firebase application.');
  } catch (error) {
    console.error('\n❌ Failed to configure Google authentication:', error.message);
    console.error('Please try the manual configuration steps.');
    displayManualInstructions();
  }
}

// Run the script
main();

