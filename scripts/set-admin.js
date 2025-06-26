const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

// Initialize the app.
// If you've run `gcloud auth application-default login`, the SDK will automatically
// Load the service account key
const serviceAccount = require('../firebase-admin-key.json');

// Initialize the app with a service account, granting admin privileges
initializeApp({
  credential: cert(serviceAccount)
});

const email = 'luke_fryer@yahoo.com';

getAuth()
  .getUserByEmail(email)
  .then((user) => {
    // Confirm user record has been found
    console.log(`Successfully fetched user data: ${user.toJSON()}`);
    // Set custom user claims
    return getAuth().setCustomUserClaims(user.uid, { admin: true });
  })
  .then(() => {
    console.log('Successfully set admin claim');
    process.exit(0);
  })
  .catch((error) => {
    console.log('Error setting custom claims:', error);
    process.exit(1);
  });
