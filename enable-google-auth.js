// Enable Google authentication for Firebase project using the Identity Platform REST API
const https = require('https');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function getAccessToken() {
  try {
    // Get access token using gcloud
    const { stdout } = await execPromise('gcloud auth print-access-token');
    return stdout.trim();
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

async function enableGoogleAuth() {
  try {
    const projectId = 'timberline-commerce';
    const token = await getAccessToken();
    
    const data = JSON.stringify({
      provider: {
        providerId: 'google.com',
        enabled: true
      }
    });
    
    const options = {
      hostname: 'identitytoolkit.googleapis.com',
      path: `/admin/v2/projects/${projectId}/config`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': data.length
      }
    };
    
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('Google authentication enabled successfully');
            console.log('Response:', responseData);
            resolve(JSON.parse(responseData));
          } else {
            console.error(`Error: Status code ${res.statusCode}`);
            console.error('Response:', responseData);
            reject(new Error(`HTTP Error: ${res.statusCode}`));
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
  } catch (error) {
    console.error('Error enabling Google authentication:', error);
    throw error;
  }
}

// Run the function
enableGoogleAuth();
