#!/bin/bash

# open-firebase-console.sh
# Script to open Firebase and Google Cloud Console pages for fixing authentication issues

# Set the project ID
PROJECT_ID="timberline-commerce"

# ANSI color codes for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}=========================================================================${NC}"
echo -e "${BLUE} FIREBASE AUTHENTICATION FIX - BROWSER CONSOLE ACCESS ${NC}"
echo -e "${BLUE}=========================================================================${NC}"
echo ""

# Step 1: Open Firebase Authentication settings
echo -e "${YELLOW}Step 1: Opening Firebase Authentication settings${NC}"
echo -e "Please add 'localhost' to the authorized domains list"
echo ""
open "https://console.firebase.google.com/project/${PROJECT_ID}/authentication/settings"
echo -e "${GREEN}✓ Firebase Authentication settings opened in browser${NC}"
echo ""

# Wait for user to confirm
read -p "Press Enter after adding localhost to authorized domains... "

# Step 2: Open Google Cloud Console API credentials
echo -e "${YELLOW}Step 2: Opening Google Cloud Console API credentials${NC}"
echo -e "Please check API key restrictions and ensure Identity Toolkit API is enabled"
echo ""
open "https://console.cloud.google.com/apis/credentials?project=${PROJECT_ID}"
echo -e "${GREEN}✓ Google Cloud Console API credentials opened in browser${NC}"
echo ""

# Wait for user to confirm
read -p "Press Enter after checking API key restrictions... "

# Step 3: Open the Firebase test HTML file
echo -e "${YELLOW}Step 3: Opening Firebase authentication test file${NC}"
echo -e "Click the 'Test Firebase Initialization' button to verify the fix"
echo ""

# Check if the test file exists
if [ -f "firebase-auth-test.html" ]; then
    open "firebase-auth-test.html"
    echo -e "${GREEN}✓ Firebase test file opened in browser${NC}"
else
    echo -e "${RED}× Firebase test file not found!${NC}"
    echo "Running fix-firebase-key.js to create the test file..."
    node fix-firebase-key.js
    
    if [ -f "firebase-auth-test.html" ]; then
        open "firebase-auth-test.html"
        echo -e "${GREEN}✓ Firebase test file created and opened in browser${NC}"
    else
        echo -e "${RED}× Failed to create Firebase test file${NC}"
    fi
fi

echo ""
echo -e "${BLUE}=========================================================================${NC}"
echo -e "${BLUE} FIREBASE AUTHENTICATION FIX - COMPLETE ${NC}"
echo -e "${BLUE}=========================================================================${NC}"
echo ""
echo -e "${YELLOW}If you've completed all the steps, the 'auth/api-key-is-not-valid' error should be fixed.${NC}"
echo -e "${YELLOW}Additional troubleshooting steps if the error persists:${NC}"
echo "1. Clear your browser cache and cookies"
echo "2. Try using an incognito/private browsing window"
echo "3. Verify that your API key matches between .env.local and Firebase Console"
echo ""

