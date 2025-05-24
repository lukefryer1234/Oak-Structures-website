# Firebase Authentication Fix

## The Problem: "auth/api-key-is-not-valid" Error

The "auth/api-key-is-not-valid" error occurs when Firebase Authentication cannot validate the API key used to initialize the Firebase SDK. This can happen for several reasons:

1. The API key provided is incorrect or doesn't exist
2. The API key doesn't have the required Identity Toolkit API enabled
3. The API key has restrictions that prevent its use with Firebase Authentication
4. The authorized domains list doesn't include the domain you're using (e.g., localhost)
5. Path inconsistencies in configuration files with hardcoded paths

## Steps Taken to Fix the Issue

We took a systematic approach to resolve the issue:

### 1. Fixed Path Inconsistencies

- Identified and fixed hardcoded paths in configuration files
- Updated `check-firebase-config.js` to use the correct project directory path

### 2. Enabled Required APIs

- Set the correct quota project for Google Cloud CLI:
  ```bash
  gcloud auth application-default set-quota-project timberline-commerce
  ```
- Ensured the Identity Toolkit API is enabled:
  ```bash
  gcloud services enable identitytoolkit.googleapis.com --project=timberline-commerce
  ```
- Enabled Firebase Management API:
  ```bash
  gcloud services enable firebase.googleapis.com --project=timberline-commerce
  ```

### 3. Added localhost to Authorized Domains

- Opened Firebase Authentication settings
- Added 'localhost' to the authorized domains list

### 4. Checked API Key Restrictions

- Verified the API key in Google Cloud Console
- Ensured Identity Toolkit API is enabled for the API key
- Removed unnecessary API key restrictions for testing

### 5. Created Test Files

- Created `firebase-auth-test.html` to test basic Firebase initialization
- Created `firebase-auth-success.html` to test Google Sign-In functionality
- Created verification scripts to confirm the fix worked

## How to Verify the Fix

You can verify the fix using the following tools we created:

### Basic Firebase Initialization Test

1. Open `firebase-auth-test.html` in your browser
2. Click the "Test Firebase Initialization" button
3. If successful, you'll see a green success message

### Google Authentication Test

1. Open `firebase-auth-success.html` in your browser
2. The page will initialize Firebase and should show green checkmarks for each step
3. Click the "Sign in with Google" button
4. If successful, you'll be able to sign in and see your Google account information

### Command-Line Verification

Run the verification script:
```bash
node verify-firebase-fix.js
```

## Additional Troubleshooting

If you're still experiencing issues, try these steps:

### 1. Clear Browser Cache and Cookies

- Clear your browser cache and cookies
- Try using an incognito/private browsing window

### 2. Re-run the Fix Script

```bash
chmod +x open-firebase-console.sh
./open-firebase-console.sh
```

### 3. Check Firebase Console Settings

- Verify that Google authentication is enabled in Firebase Console
- Go to: https://console.firebase.google.com/project/timberline-commerce/authentication/providers
- Enable Google as a sign-in provider if not already enabled

### 4. Check API Key in Environment Variables

- Ensure the API key in `.env.local` matches the one in Firebase Console
- Current API key: `AIzaSyDRyZFjrrGB3mBcMf6ug3qp_M2i7XllmF4`

### 5. Enable Anonymous Authentication (for testing)

If you want to use anonymous authentication for testing:
- Go to Firebase Console > Authentication > Sign-in methods
- Enable Anonymous authentication

## Common Error Codes and Solutions

| Error Code | Description | Solution |
|------------|-------------|----------|
| `auth/api-key-not-valid` | API key is invalid | Check API key and Identity Toolkit API |
| `auth/admin-restricted-operation` | Anonymous auth not enabled | Enable Anonymous auth in Firebase Console |
| `auth/operation-not-allowed` | Sign-in method not enabled | Enable the sign-in method in Firebase Console |
| `auth/unauthorized-domain` | Domain not authorized | Add domain to authorized domains list |

## References

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Google Cloud API Keys](https://cloud.google.com/docs/authentication/api-keys)
- [Identity Toolkit API](https://cloud.google.com/identity-platform/docs/web/setup)

