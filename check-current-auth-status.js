#!/usr/bin/env node

const https = require('https');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔍 Checking Firebase Authentication Status...\n');

// Load environment variables
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const apiKeyMatch = envContent.match(/NEXT_PUBLIC_FIREBASE_API_KEY="([^"]+)"/);
const projectIdMatch = envContent.match(/NEXT_PUBLIC_FIREBASE_PROJECT_ID="([^"]+)"/);
const authDomainMatch = envContent.match(/NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="([^"]+)"/);

const apiKey = apiKeyMatch ? apiKeyMatch[1] : null;
const projectId = projectIdMatch ? projectIdMatch[1] : null;
const authDomain = authDomainMatch ? authDomainMatch[1] : null;

console.log(`📋 Project Configuration:`);
console.log(`   Project ID: ${projectId}`);
console.log(`   API Key: ${apiKey}`);
console.log(`   Auth Domain: ${authDomain}\n`);

if (!apiKey || !projectId) {
  console.error('❌ Missing Firebase configuration in .env.local');
  process.exit(1);
}

async function checkAuthConfiguration() {
  try {
    // Get access token
    const accessToken = execSync('gcloud auth print-access-token', { encoding: 'utf8' }).trim();
    
    // Check Identity Toolkit configuration
    const options = {
      hostname: 'identitytoolkit.googleapis.com',
      path: `/v1/projects/${projectId}/config`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const config = JSON.parse(data);
              resolve(config);
            } catch (e) {
              reject(new Error(`Failed to parse response: ${e.message}`));
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });
      
      req.on('error', reject);
      req.end();
    });
    
  } catch (error) {
    throw new Error(`Failed to get access token: ${error.message}`);
  }
}

async function main() {
  try {
    console.log('🔐 Checking Firebase Auth Configuration...');
    const authConfig = await checkAuthConfiguration();
    
    console.log('\n📊 Authentication Status:');
    console.log(`   Authorized Domains: ${JSON.stringify(authConfig.authorizedDomains || [])}`);
    
    if (authConfig.signIn) {
      console.log(`   Email Sign-in: ${authConfig.signIn.email?.enabled ? '✅ Enabled' : '❌ Disabled'}`);
      console.log(`   Anonymous Sign-in: ${authConfig.signIn.anonymous?.enabled ? '✅ Enabled' : '❌ Disabled'}`);
      
      // Check Google provider
      const providers = authConfig.signIn.providers || [];
      const googleProvider = providers.find(p => p.providerId === 'google.com');
      
      if (googleProvider) {
        console.log(`   Google Sign-in: ${googleProvider.enabled ? '✅ Enabled' : '❌ Disabled'}`);
        if (googleProvider.clientId) {
          console.log(`   Google Client ID: ${googleProvider.clientId}`);
        }
      } else {
        console.log('   Google Sign-in: ❌ Not Configured');
      }
    }
    
    // Check for common issues
    console.log('\n🚨 Potential Issues:');
    
    const authorizedDomains = authConfig.authorizedDomains || [];
    if (!authorizedDomains.includes('localhost')) {
      console.log('   ❌ localhost not in authorized domains (needed for local development)');
    }
    
    if (!authorizedDomains.some(domain => domain.includes('firebaseapp.com'))) {
      console.log('   ❌ Firebase hosting domain not in authorized domains');
    }
    
    const googleProvider = (authConfig.signIn?.providers || []).find(p => p.providerId === 'google.com');
    if (!googleProvider || !googleProvider.enabled) {
      console.log('   ❌ Google Sign-in provider not enabled');
    }
    
    console.log('\n✅ Configuration check complete!');
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    
    if (error.message.includes('access token')) {
      console.log('\n💡 Try running: gcloud auth login');
      console.log('💡 Then run: gcloud config set project timberline-commerce');
    }
  }
}

main();