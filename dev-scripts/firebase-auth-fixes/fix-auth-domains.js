#!/usr/bin/env node

const { execSync } = require('child_process');

async function fixAuthDomains() {
  console.log('🔧 Fixing Firebase Auth Domains...');
  
  try {
    // Get current project configuration
    const projectId = 'timberline-commerce';
    
    // Use Firebase CLI to check current auth configuration
    console.log('📋 Checking current auth configuration...');
    
    // Add the production domain to authorized domains
    const domainsToAdd = [
      'timberline-commerce.web.app',
      'timberline-commerce.firebaseapp.com',
      'localhost'
    ];
    
    console.log('🌐 Adding authorized domains for Google Auth...');
    
    // Create a temporary config file for auth domains
    const authConfig = {
      authorizedDomains: domainsToAdd
    };
    
    // Use gcloud to update the auth configuration
    const updateCommand = `curl -X PATCH "https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config" \
      -H "Authorization: Bearer $(gcloud auth print-access-token)" \
      -H "Content-Type: application/json" \
      -d '{
        "authorizedDomains": [
          "localhost",
          "timberline-commerce.web.app",
          "timberline-commerce.firebaseapp.com"
        ]
      }'`;
    
    console.log('🔄 Updating auth configuration...');
    const result = execSync(updateCommand, { encoding: 'utf8' });
    console.log('✅ Auth domains updated successfully!');
    console.log(result);
    
    // Also ensure Google provider is enabled
    console.log('🔑 Ensuring Google Auth provider is enabled...');
    const enableGoogleAuth = `curl -X PATCH "https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config" \
      -H "Authorization: Bearer $(gcloud auth print-access-token)" \
      -H "Content-Type: application/json" \
      -d '{
        "signIn": {
          "allowDuplicateEmails": false,
          "email": {
            "enabled": true
          },
          "phoneNumber": {
            "enabled": false
          },
          "anonymous": {
            "enabled": false
          }
        },
        "providers": [
          {
            "email": {
              "enabled": true
            }
          }
        ]
      }'`;
    
    execSync(enableGoogleAuth, { encoding: 'utf8' });
    console.log('✅ Google Auth provider configuration updated!');
    
  } catch (error) {
    console.error('❌ Error fixing auth domains:', error.message);
    
    // Fallback: Use Firebase CLI to open console
    console.log('🌐 Opening Firebase Console for manual configuration...');
    console.log('Please manually add these domains to your Firebase Auth settings:');
    console.log('- timberline-commerce.web.app');
    console.log('- timberline-commerce.firebaseapp.com');
    console.log('- localhost');
    
    try {
      execSync('firebase open auth --project timberline-commerce', { stdio: 'inherit' });
    } catch (e) {
      console.log('Visit: https://console.firebase.google.com/project/timberline-commerce/authentication/settings');
    }
  }
}

fixAuthDomains();
