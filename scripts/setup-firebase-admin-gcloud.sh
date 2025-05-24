#!/bin/bash

# ========================================================
# Firebase Admin SDK Setup Script using Google Cloud CLI
# ========================================================
# This script automates the setup of Firebase Admin SDK credentials
# using Google Cloud CLI. It creates a service account, generates
# a key, and formats it for use in your .env.local file.
#
# Usage:
# 1. Make this script executable:
#    chmod +x scripts/setup-firebase-admin-gcloud.sh
# 2. Run the script:
#    ./scripts/setup-firebase-admin-gcloud.sh
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
TEMP_KEY_FILE="/tmp/firebase-admin-key-$$.json" # Using $$ (PID) to make filename unique

# Function to clean up temp files on exit
cleanup() {
  if [ -f "$TEMP_KEY_FILE" ]; then
    echo -e "${YELLOW}Cleaning up temporary key file...${NC}"
    rm -f "$TEMP_KEY_FILE"
  fi
}

# Set up trap to call cleanup on script exit
trap cleanup EXIT

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

echo -e "${BOLD}Setting up Firebase Admin SDK credentials using Google Cloud CLI...${NC}"
echo ""

# Check if Google Cloud CLI is installed
if ! command -v gcloud &> /dev/null; then
  echo -e "${RED}Google Cloud CLI is not installed.${NC}"
  echo "Please install it from: https://cloud.google.com/sdk/docs/install"
  exit 1
fi

# Check if user is authenticated with gcloud
auth_status=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null)
if [ -z "$auth_status" ]; then
  echo -e "${YELLOW}You are not logged in to Google Cloud CLI.${NC}"
  echo "Please login first using: gcloud auth login"
  exit 1
fi

echo -e "${GREEN}Authenticated with Google Cloud as: ${BOLD}$auth_status${NC}"

# Get the current GCP project
current_project=$(gcloud config get-value project 2>/dev/null)
if [ -z "$current_project" ]; then
  echo -e "${YELLOW}No active Google Cloud project found.${NC}"
  
  # List projects and ask user to select one
  echo "Available projects:"
  gcloud projects list
  
  read -p "Please enter the project ID to use: " project_id
  gcloud config set project "$project_id"
  current_project="$project_id"
fi

echo -e "${GREEN}Using Google Cloud project: ${BOLD}$current_project${NC}"
echo ""

# Set service account name
SERVICE_ACCOUNT_NAME="firebase-admin-sdk"
SERVICE_ACCOUNT_EMAIL="$SERVICE_ACCOUNT_NAME@$current_project.iam.gserviceaccount.com"

# Check if the service account already exists
sa_exists=$(gcloud iam service-accounts list --filter="email:$SERVICE_ACCOUNT_EMAIL" --format="value(email)" 2>/dev/null)

if [ -z "$sa_exists" ]; then
  echo -e "${YELLOW}Creating Firebase Admin service account...${NC}"
  
  # Create the service account
  gcloud iam service-accounts create "$SERVICE_ACCOUNT_NAME" \
    --display-name="Firebase Admin SDK Service Account" \
    --description="Service account for Firebase Admin SDK operations"
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to create service account.${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}Service account created: ${BOLD}$SERVICE_ACCOUNT_EMAIL${NC}"
  
  # Grant necessary roles to the service account
  echo -e "${YELLOW}Granting necessary roles to service account...${NC}"
  
  # Firebase Admin SDK roles
  gcloud projects add-iam-policy-binding "$current_project" \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/firebase.admin"
  
  gcloud projects add-iam-policy-binding "$current_project" \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/firestore.admin"
  
  echo -e "${GREEN}Roles assigned successfully.${NC}"
else
  echo -e "${GREEN}Using existing service account: ${BOLD}$SERVICE_ACCOUNT_EMAIL${NC}"
fi

# Generate and download a new key for the service account
echo -e "${YELLOW}Generating new service account key...${NC}"
gcloud iam service-accounts keys create "$TEMP_KEY_FILE" \
  --iam-account="$SERVICE_ACCOUNT_EMAIL"

if [ $? -ne 0 ] || [ ! -f "$TEMP_KEY_FILE" ]; then
  echo -e "${RED}Failed to generate service account key.${NC}"
  exit 1
fi

echo -e "${GREEN}Service account key generated successfully.${NC}"

# Extract values from the JSON key file
echo -e "${YELLOW}Processing service account key...${NC}"

# Extract values from the JSON file
project_id=$(grep -o '"project_id": *"[^"]*"' "$TEMP_KEY_FILE" | cut -d'"' -f4)
client_email=$(grep -o '"client_email": *"[^"]*"' "$TEMP_KEY_FILE" | cut -d'"' -f4)

# Extract private key and format it correctly for .env
# This is complex because the private key contains newlines
private_key=$(awk -F'"private_key": "' '{print $2}' "$TEMP_KEY_FILE" | awk -F'",?' '{print $1}' | sed 's/\\n/\\\\n/g')

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
echo "The temporary key file will be automatically deleted when this script exits."
echo ""
echo -e "${GREEN}Setup complete!${NC}"

# Suggest next steps
echo ""
echo -e "${BOLD}Next steps:${NC}"
echo "1. Make sure your Firebase Admin SDK dependencies are installed:"
echo "   npm install firebase-admin"
echo "2. You can now use the Firebase Admin SDK in your server-side code."
echo ""
echo -e "${BLUE}For enhanced security, consider setting a key rotation schedule:${NC}"
echo "https://cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys"

exit 0

