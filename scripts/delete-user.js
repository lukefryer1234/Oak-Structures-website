const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

// Load the service account key
const serviceAccount = require('../firebase-admin-key.json');

// Initialize the app with a service account, granting admin privileges
initializeApp({
  credential: cert(serviceAccount)
});

const email = 'luke_fryer@yahoo.com';

getAuth()
  .getUserByEmail(email)
  .then((userRecord) => {
    return getAuth().deleteUser(userRecord.uid);
  })
  .then(() => {
    console.log('Successfully deleted user');
    process.exit(0);
  })
  .catch((error) => {
    console.log('Error deleting user:', error);
    process.exit(1);
  });
