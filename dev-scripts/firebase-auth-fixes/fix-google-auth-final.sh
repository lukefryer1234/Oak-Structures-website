#!/bin/bash

# fix-google-auth-final.sh
# A guided script to fix Firebase Google Authentication issues

# Project settings
PROJECT_ID="timberline-commerce"

# ANSI color codes for better readability
RESET="\033[0m"
RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
BLUE="\033[0;34m"
CYAN="\033[0;36m"
BOLD="\033[1m"

# Print the header
echo -e "${BLUE}${BOLD}=========================================================================${RESET}"
echo -e "${BLUE}${BOLD}             FIREBASE GOOGLE AUTHENTICATION FIX                         ${RESET}"
echo -e "${BLUE}${BOLD}=========================================================================${RESET}"
echo ""

# Introduction
echo -e "${BOLD}This script will guide you through fixing the Firebase Google Authentication issue.${RESET}"
echo -e "The error '${RED}auth/api-key-is-not-valid${RESET}' occurs when Firebase cannot validate your API key."
echo -e "We'll fix this by ensuring all the necessary settings are correctly configured."
echo ""
echo -e "${BOLD}Prerequisites:${RESET}"
echo "  - A Firebase project with Google Authentication"
echo "  - Access to the Firebase Console"
echo "  - Access to the Google Cloud Console"
echo ""

# Step 1: Enable Google Authentication
echo -e "${YELLOW}${BOLD}STEP 1: Enable Google Authentication${RESET}"
echo "We'll open the Firebase Authentication providers page where you need to:"
echo "  1. Click on 'Google' in the list of providers"
echo "  2. Toggle the 'Enable' switch to ON"
echo "  3. Save the changes"
echo ""
read -p "Press Enter to open the Firebase Authentication providers page... "
open "https://console.firebase.google.com/project/${PROJECT_ID}/authentication/providers"
echo -e "${GREEN}Firebase Authentication providers page opened in your browser.${RESET}"
echo ""
read -p "After enabling Google Authentication, press Enter to continue... "

# Step 2: Add localhost to authorized domains
echo -e "${YELLOW}${BOLD}STEP 2: Add localhost to Authorized Domains${RESET}"
echo "Now we'll add localhost to the authorized domains list:"
echo "  1. Find the 'Authorized domains' section"
echo "  2. Click 'Add domain'"
echo "  3. Enter 'localhost'"
echo "  4. Click 'Add'"
echo ""
read -p "Press Enter to open the Firebase Authentication settings page... "
open "https://console.firebase.google.com/project/${PROJECT_ID}/authentication/settings"
echo -e "${GREEN}Firebase Authentication settings page opened in your browser.${RESET}"
echo ""
read -p "After adding localhost to authorized domains, press Enter to continue... "

# Step 3: Check API key restrictions
echo -e "${YELLOW}${BOLD}STEP 3: Check API Key Restrictions${RESET}"
echo "Next, we'll check the API key restrictions:"
echo "  1. Find your API key in the list"
echo "  2. Check if it has any restrictions that might be blocking Firebase Authentication"
echo "  3. If using API restrictions, ensure 'Identity Toolkit API' is enabled"
echo "  4. Temporarily consider removing restrictions for testing"
echo ""
read -p "Press Enter to open the Google Cloud API credentials page... "
open "https://console.cloud.google.com/apis/credentials?project=${PROJECT_ID}"
echo -e "${GREEN}Google Cloud API credentials page opened in your browser.${RESET}"
echo ""
read -p "After checking API key restrictions, press Enter to continue... "

# Step 4: Enable required APIs
echo -e "${YELLOW}${BOLD}STEP 4: Enable Required APIs${RESET}"
echo "Let's make sure all required APIs are enabled:"
echo "  1. Identity Toolkit API"
echo "  2. Firebase API"
echo ""
echo -e "${CYAN}Executing: gcloud services enable identitytoolkit.googleapis.com --project=${PROJECT_ID}${RESET}"
gcloud services enable identitytoolkit.googleapis.com --project=${PROJECT_ID} &>/dev/null || echo -e "${RED}Failed to enable Identity Toolkit API. You may need to do this manually.${RESET}"
echo -e "${CYAN}Executing: gcloud services enable firebase.googleapis.com --project=${PROJECT_ID}${RESET}"
gcloud services enable firebase.googleapis.com --project=${PROJECT_ID} &>/dev/null || echo -e "${RED}Failed to enable Firebase API. You may need to do this manually.${RESET}"
echo -e "${CYAN}Executing: gcloud auth application-default set-quota-project ${PROJECT_ID}${RESET}"
gcloud auth application-default set-quota-project ${PROJECT_ID} &>/dev/null || echo -e "${RED}Failed to set quota project. You may need to do this manually.${RESET}"
echo ""

# Step 5: Test Google Authentication
echo -e "${YELLOW}${BOLD}STEP 5: Test Google Authentication${RESET}"
echo "Finally, let's test if Google Authentication works:"
echo "  1. The test page will open in your browser"
echo "  2. Click 'Sign in with Google' to test authentication"
echo "  3. Follow any error messages if authentication fails"
echo ""
read -p "Press Enter to open the Google Auth test page... "
open "google-auth-simple-test.html"
echo -e "${GREEN}Google Auth test page opened in your browser.${RESET}"
echo ""

# Completion
echo -e "${BLUE}${BOLD}=========================================================================${RESET}"
echo -e "${BLUE}${BOLD}                            SUMMARY                                     ${RESET}"
echo -e "${BLUE}${BOLD}=========================================================================${RESET}"
echo ""
echo -e "You have completed all the steps to fix the Firebase Google Authentication issue."
echo -e "If you can successfully sign in with Google on the test page, the issue is resolved!"
echo ""
echo -e "If you're still experiencing issues, please try:"
echo "  1. Clearing your browser cache and cookies"
echo "  2. Using an incognito/private browsing window"
echo "  3. Checking the browser console for more detailed error messages"
echo "  4. Verifying that all steps were completed correctly"
echo ""
echo -e "Refer to the documentation in ${BOLD}FIREBASE-AUTH-FIX.md${RESET} for more troubleshooting tips."
echo ""

