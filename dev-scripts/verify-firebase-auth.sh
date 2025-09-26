export PROJECT_ID=timberline-commerce
export API_KEY=$(grep NEXT_PUBLIC_FIREBASE_API_KEY .env.local | sed 's/.*="\(.*\)".*/\1/')
echo "Testing Firebase Auth API with key: $API_KEY"
curl -s "https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=$API_KEY" -H "Content-Type: application/json" -d '{"token":"dummy", "returnSecureToken":true}'
