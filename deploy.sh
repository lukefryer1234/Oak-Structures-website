#!/bin/bash

# ========================================================
# Solid Oak Structures Website Deployment Script
# ========================================================
# This script automates the process of building and deploying
# the Solid Oak Structures website to Firebase.
#
# Usage:
# 1. Make this script executable:
#    chmod +x deploy.sh
# 2. Run the script:
#    ./deploy.sh
#
# Options:
# - To deploy to a specific project:
#    ./deploy.sh <project-id>
# - To run Firebase Admin SDK setup before deployment:
#    ./deploy.sh --setup
# - To combine both:
#    ./deploy.sh --setup <project-id>
# ========================================================

# Text formatting
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Project directory
PROJECT_DIR=$(pwd)
HOSTING_DIR="$PROJECT_DIR/hosting"
ENV_FILE="$PROJECT_DIR/.env.local"
SETUP_SCRIPT="$PROJECT_DIR/scripts/setup-firebase-admin-gcloud.sh"

# Parse command line arguments
RUN_SETUP=false
PROJECT=""

for arg in "$@"; do
  if [[ "$arg" == "--setup" ]]; then
    RUN_SETUP=true
  elif [[ "$arg" != --* ]]; then
    PROJECT="$arg"
  fi
done

# Set default project if not provided
if [[ -z "$PROJECT" ]]; then
  PROJECT="timberline-commerce"
fi

# Function to display status messages
function log_message() {
  echo -e "${BOLD}${2:-$GREEN}$1${NC}"
}

# Function to check if the previous command was successful
function check_status() {
  if [ $? -eq 0 ]; then
    log_message "✅ $1 completed successfully!" "$GREEN"
  else
    log_message "❌ $1 failed!" "$RED"
    exit 1
  fi
}

# Function to check if Firebase Admin SDK credentials are configured
function check_firebase_admin_setup() {
  if [ ! -f "$ENV_FILE" ]; then
    return 1
  fi
  
  if grep -q "FIREBASE_PROJECT_ID=" "$ENV_FILE" && 
     grep -q "FIREBASE_CLIENT_EMAIL=" "$ENV_FILE" && 
     grep -q "FIREBASE_PRIVATE_KEY=" "$ENV_FILE"; then
    return 0
  else
    return 1
  fi
}

# Function to run Firebase Admin SDK setup script
function run_firebase_admin_setup() {
  if [ ! -f "$SETUP_SCRIPT" ]; then
    log_message "Firebase Admin SDK setup script not found at $SETUP_SCRIPT" "$RED"
    log_message "Continuing with deployment without Firebase Admin setup..." "$YELLOW"
    return 1
  fi
  
  log_message "Running Firebase Admin SDK setup script..." "$YELLOW"
  bash "$SETUP_SCRIPT"
  check_status "Firebase Admin SDK setup"
}

# Start deployment process
log_message "🚀 Starting deployment for Solid Oak Structures website to project: $PROJECT" "$YELLOW"
echo ""

# Check if Firebase Admin SDK setup is needed
if [ "$RUN_SETUP" = true ]; then
  log_message "Running Firebase Admin SDK setup (--setup flag detected)..." "$YELLOW"
  run_firebase_admin_setup
else
  if ! check_firebase_admin_setup; then
    log_message "Firebase Admin SDK credentials not found in .env.local" "$YELLOW"
    read -p "Would you like to set up Firebase Admin SDK credentials now? (y/n): " setup_now
    if [[ $setup_now == "y" || $setup_now == "Y" ]]; then
      run_firebase_admin_setup
    else
      log_message "Continuing without Firebase Admin SDK setup..." "$YELLOW"
      log_message "Some server-side functionality may not work correctly." "$YELLOW"
    fi
  else
    log_message "Firebase Admin SDK credentials already configured ✓" "$GREEN"
  fi
fi

echo ""

# Install dependencies for the project if node_modules is missing
if [ ! -d "$PROJECT_DIR/node_modules" ]; then
  log_message "📦 Installing project dependencies..." "$YELLOW"
  npm install
  check_status "Dependencies installation"
fi

# Check if hosting directory exists
if [ ! -d "$HOSTING_DIR" ]; then
  log_message "❌ Hosting directory not found at $HOSTING_DIR!" "$RED"
  exit 1
fi

# Install dependencies in hosting directory if needed
log_message "📦 Installing hosting dependencies..." "$YELLOW"
cd "$HOSTING_DIR"
npm install
check_status "Hosting dependencies installation"

# Build the Next.js app
log_message "🏗️ Building Next.js application..." "$YELLOW"
npm run build
check_status "Next.js build"

# Return to project directory
cd "$PROJECT_DIR"

# Deploy Firebase rules and hosting
log_message "🔥 Deploying to Firebase..." "$YELLOW"

# Use firebase use to switch to the specified project
firebase use "$PROJECT"
check_status "Firebase project selection"

# Deploy Firestore and Storage rules first
log_message "📝 Deploying Firestore rules and indexes..." "$YELLOW"
firebase deploy --only firestore:rules,firestore:indexes
check_status "Firestore rules and indexes deployment"

log_message "📝 Deploying Storage rules..." "$YELLOW"
firebase deploy --only storage
check_status "Storage rules deployment"

# Deploy hosting
log_message "🌐 Deploying web application..." "$YELLOW"
firebase deploy --only hosting
check_status "Web application deployment"

# All done!
echo ""
log_message "✨ Deployment completed successfully! ✨" "$GREEN"
echo ""
log_message "Your site is now live at: https://$PROJECT.web.app" "$YELLOW"
echo ""

exit 0

