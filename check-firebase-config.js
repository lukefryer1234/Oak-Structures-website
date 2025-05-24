const https = require('https');
const { execSync } = require('child_process');
const path = require('path');

// Get current API key from .env.local
const envContent = require('fs').readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
const apiKeyMatch = envContent.match(/NEXT_PUBLIC_FIREBASE_API_KEY="([^"]+)"/);
const currentApiKey = apiKeyMatch ? apiKeyMatch[1] : null;

console.log(`Current API key in .env.local: ${currentApiKey}`);

// Get access token
const accessToken = execSync('gcloud auth print-access-token').toString().trim();

// Make API request to get Firebase project configuration
const options = {
  hostname: 'firebase.googleapis.com',
  path: '/v1beta1/projects/timberline-commerce/webApps',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('Firebase Web App Configuration:');
      console.log(JSON.stringify(response, null, 2));
    } catch (e) {
      console.error('Error parsing response:', e);
      console.error('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Error fetching Firebase config:', error);
});

req.end();
