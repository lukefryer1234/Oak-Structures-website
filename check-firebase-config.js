#!/usr/bin/env node

const https = require('https');
const { execSync } = require('child_process');
const path = require('path');

// Get current API key from .env.local
const envContent = require('fs').readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
const apiKeyMatch = envContent.match(/NEXT_PUBLIC_FIREBASE_API_KEY="([^"]+)"/);
const projectIdMatch = envContent.match(/NEXT_PUBLIC_FIREBASE_PROJECT_ID="([^"]+)"/);
const currentApiKey = apiKeyMatch ? apiKeyMatch[1] : null;
const projectId = projectIdMatch ? projectIdMatch[1] : null;

console.log(`Current API key in .env.local: ${currentApiKey}`);
console.log(`Project ID: ${projectId}`);

try {
  // Get access token
  const accessToken = execSync('gcloud auth print-access-token').toString().trim();
  console.log('Successfully obtained access token');

  // Check Firebase Auth configuration
  const authOptions = {
    hostname: 'identitytoolkit.googleapis.com',
    path: `/v1/projects/${projectId}/config`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  };

  const authReq = https.request(authOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('\n=== Firebase Auth Configuration ===');
        console.log('Authorized domains:', response.authorizedDomains || []);
        console.log('Sign-in providers:', response.signIn?.allowDuplicateEmails || 'Not configured');
        
        if (response.signIn?.email) {
          console.log('Email sign-in enabled:', response.signIn.email.enabled);
        }
        
        if (response.signIn?.anonymous) {
          console.log('Anonymous sign-in enabled:', response.signIn.anonymous.enabled);
        }
        
        // Check for Google provider
        const providers = response.signIn?.providers || [];
        const googleProvider = providers.find(p => p.providerId === 'google.com');
        if (googleProvider) {
          console.log('Google sign-in enabled:', googleProvider.enabled);
          console.log('Google client ID:', googleProvider.clientId);
        } else {
          console.log('Google sign-in: NOT CONFIGURED');
        }
        
      } catch (e) {
        console.error('Error parsing auth config response:', e);
        console.error('Raw response:', data);
      }
    });
  });

  authReq.on('error', (error) => {
    console.error('Error fetching Firebase auth config:', error);
  });

  authReq.end();

} catch (error) {
  console.error('Error getting access token:', error.message);
  console.log('Make sure you are logged in with: gcloud auth login');
}