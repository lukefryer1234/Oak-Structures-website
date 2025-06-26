const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

// Load the service account key
const serviceAccount = require('../firebase-admin-key.json');

// Initialize the app with a service account, granting admin privileges
initializeApp({
  credential: cert(serviceAccount)
});

const email = 'luke_fryer@yahoo.com';
const newPassword = 'NAVIsavi321!!';

getAuth()
  .getUserByEmail(email)
  .then((userRecord) => {
    return getAuth().updateUser(userRecord.uid, {
      password: newPassword,
    });
  })
  .then((userRecord) => {
    console.log('Successfully updated user password');
    process.exit(0);
  })
  .catch((error) => {
    console.log('Error updating user password:', error);
    process.exit(1);
  });
