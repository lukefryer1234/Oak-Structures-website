#!/bin/bash

# ========================================================
# Firebase Admin SDK Setup Script
# ========================================================
# This script helps set up Firebase Admin SDK credentials
# for use with the Solid Oak Structures website.
#
# Usage:
# 1. Make this script executable:
#    chmod +x scripts/setup-firebase-admin.sh
# 2. Run the script:
#    ./scripts/setup-firebase-admin.sh
# ========================================================

# Text formatting
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project directory and .env file path
PROJECT_DIR=$(cd "$(dirname "$0")/.." && pwd)
ENV_FILE="$PROJECT_DIR/.env.local"

echo -e "${BOLD}Firebase Admin SDK Setup Script${NC}"
echo "=========================================="
echo ""

# Check if .env.local file exists
if [ ! -f "$ENV_FILE" ]; then
  echo -e "${YELLOW}No .env.local file found. Creating one...${NC}"
  touch "$ENV_FILE"
fi

# Check if Firebase Admin SDK variables are already set
if grep -q "FIREBASE_PROJECT_ID=" "$ENV_FILE" && 
   grep -q "FIREBASE_CLIENT_EMAIL=" "$ENV_FILE" && 
   grep -q "FIREBASE_PRIVATE_KEY=" "$ENV_FILE"; then
  echo -e "${GREEN}Firebase Admin SDK credentials already exist in .env.local.${NC}"
  
  # Ask if user wants to regenerate
  read -p "Do you want to regenerate these credentials? (y/n): " regenerate
  if [[ $regenerate != "y" && $regenerate != "Y" ]]; then
    echo -e "${GREEN}Keeping existing credentials. Setup complete!${NC}"
    exit 0
  fi
fi

echo -e "${BOLD}Setting up Firebase Admin SDK credentials...${NC}"
echo ""
echo -e "${YELLOW}This script will guide you through creating a service account key for Firebase Admin SDK.${NC}"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
  echo -e "${RED}Firebase CLI is not installed.${NC}"
  echo "Please install it first using: npm install -g firebase-tools"
  exit 1
fi

# Check if logged in to Firebase
firebase_login_status=$(firebase login:list 2>&1)
if ! echo "$firebase_login_status" | grep -q "Logged in"; then
  echo -e "${YELLOW}You are not logged in to Firebase CLI.${NC}"
  echo "Please login first using: firebase login"
  exit 1
fi

# Get current Firebase project
current_project=$(firebase use 2>&1 | grep "Now using project" | sed 's/Now using project //')
if [ -z "$current_project" ]; then
  echo -e "${YELLOW}No active Firebase project found.${NC}"
  
  # List projects and ask user to select one
  echo "Available projects:"
  firebase projects:list
  
  read -p "Please enter the project ID to use: " project_id
  firebase use "$project_id"
  current_project="$project_id"
fi

echo -e "${GREEN}Using Firebase project: ${BOLD}$current_project${NC}"
echo ""

echo -e "${BOLD}Instructions to create a service account key:${NC}"
echo "1. Go to the Firebase Console: https://console.firebase.google.com/"
echo "2. Select your project: $current_project"
echo "3. Click on Project Settings (gear icon)"
echo "4. Go to the 'Service accounts' tab"
echo "5. Click 'Generate new private key'"
echo "6. Save the JSON file somewhere safe"
echo ""

read -p "Have you downloaded the JSON key file? (y/n): " downloaded
if [[ $downloaded != "y" && $downloaded != "Y" ]]; then
  echo -e "${RED}Please download the service account key before continuing.${NC}"
  exit 1
fi

# Get the path to the JSON key file
read -p "Enter the full path to the downloaded JSON key file: " key_file_path

if [ ! -f "$key_file_path" ]; then
  echo -e "${RED}File not found: $key_file_path${NC}"
  exit 1
fi

echo -e "${YELLOW}Reading service account key...${NC}"

# Extract values from the JSON file
project_id=$(grep -o '"project_id": *"[^"]*"' "$key_file_path" | cut -d'"' -f4)
client_email=$(grep -o '"client_email": *"[^"]*"' "$key_file_path" | cut -d'"' -f4)

# Extract private key and format it correctly for .env
# This is complex because the private key contains newlines
private_key=$(awk -F'"private_key": "' '{print $2}' "$key_file_path" | awk -F'",?' '{print $1}' | sed 's/\\n/\\\\n/g')

if [ -z "$project_id" ] || [ -z "$client_email" ] || [ -z "$private_key" ]; then
  echo -e "${RED}Failed to extract required values from the key file.${NC}"
  exit 1
fi

echo -e "${GREEN}Successfully extracted service account details:${NC}"
echo "Project ID: $project_id"
echo "Client Email: $client_email"
echo "Private Key: [Hidden for security]"

# Update or add values to .env.local
# First, remove any existing values
sed -i.bak '/^FIREBASE_PROJECT_ID=/d' "$ENV_FILE"
sed -i.bak '/^FIREBASE_CLIENT_EMAIL=/d' "$ENV_FILE"
sed -i.bak '/^FIREBASE_PRIVATE_KEY=/d' "$ENV_FILE"

# Then add the new values
echo "" >> "$ENV_FILE"
echo "# Firebase Admin SDK credentials" >> "$ENV_FILE"
echo "FIREBASE_PROJECT_ID=\"$project_id\"" >> "$ENV_FILE"
echo "FIREBASE_CLIENT_EMAIL=\"$client_email\"" >> "$ENV_FILE"
echo "FIREBASE_PRIVATE_KEY=\"$private_key\"" >> "$ENV_FILE"

# Clean up backup file
rm "${ENV_FILE}.bak" 2>/dev/null

echo -e "${GREEN}${BOLD}Firebase Admin SDK credentials have been added to .env.local${NC}"
echo ""
echo -e "${YELLOW}IMPORTANT: Keep your .env.local file secure and never commit it to version control.${NC}"
echo "Consider adding it to your .gitignore file if it's not already there."
echo ""
echo -e "${GREEN}Setup complete!${NC}"

# Suggest next steps
echo ""
echo -e "${BOLD}Next steps:${NC}"
echo "1. Make sure your Firebase Admin SDK dependencies are installed:"
echo "   npm install firebase-admin"
echo "2. You can now use the Firebase Admin SDK in your server-side code."
echo ""
echo -e "${BLUE}For security, consider deleting the JSON key file now that its contents have been added to .env.local${NC}"

exit 0

