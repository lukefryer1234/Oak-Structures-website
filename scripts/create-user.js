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
const password = 'NAVIsavi321!!';

getAuth()
  .createUser({
    email: email,
    password: password,
  })
  .then((userRecord) => {
    console.log('Successfully created new user:', userRecord.uid);
    process.exit(0);
  })
  .catch((error) => {
    console.log('Error creating new user:', error);
    process.exit(1);
  });
