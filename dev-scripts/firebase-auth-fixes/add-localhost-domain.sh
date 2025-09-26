#!/bin/bash

# add-localhost-domain.sh
# 
# This script adds 'localhost' to the list of authorized domains for Firebase Authentication
# using only the Google Cloud CLI and curl commands.
#
# It attempts multiple different API endpoints to handle different Firebase API versions.

# ANSI color codes for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Project ID - read from .env.local or use default
PROJECT_ID="timberline-commerce"
if [ -f .env.local ]; then
  PROJECT_ID_FROM_ENV=$(grep NEXT_PUBLIC_FIREBASE_PROJECT_ID .env.local | cut -d'"' -f2)
  if [ ! -z "$PROJECT_ID_FROM_ENV" ]; then
    PROJECT_ID=$PROJECT_ID_FROM_ENV
  fi
fi

echo -e "\n${BOLD}${CYAN}=============================================================================${NC}"
echo -e "${BOLD}${CYAN} ADDING LOCALHOST TO FIREBASE AUTH DOMAINS FOR PROJECT: $PROJECT_ID ${NC}"
echo -e "${BOLD}${CYAN}=============================================================================${NC}\n"

# Step 1: Get access token from gcloud
echo -e "${BLUE}Getting access token from gcloud...${NC}"
ACCESS_TOKEN=$(gcloud auth print-access-token)

if [ -z "$ACCESS_TOKEN" ]; then
  echo -e "${RED}Failed to get access token. Make sure you're logged in with gcloud CLI.${NC}"
  echo -e "${YELLOW}Run 'gcloud auth login' and try again.${NC}"
  exit 1
fi

echo -e "${GREEN}Successfully obtained access token.${NC}\n"

# Step 2: Get current configuration using multiple potential API endpoints
get_config_success=false

# First attempt: Identity Platform API v2
echo -e "${BLUE}Attempting to get configuration using Identity Platform API v2...${NC}"
CONFIG_RESPONSE=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "https://identitytoolkit.googleapis.com/v2/projects/$PROJECT_ID/config")

# Check if the request was successful
if [[ "$CONFIG_RESPONSE" != *"error"* && "$CONFIG_RESPONSE" != *"Not Found"* ]]; then
  echo -e "${GREEN}Successfully retrieved configuration using API v2.${NC}"
  get_config_success=true
  
  # Extract authorized domains using grep and sed
  AUTHORIZED_DOMAINS=$(echo $CONFIG_RESPONSE | grep -o '"authorizedDomains":\[[^]]*\]' | sed 's/"authorizedDomains":\[//g' | sed 's/\]//g' | sed 's/"//g' | sed 's/,/ /g')
  
  if [ -z "$AUTHORIZED_DOMAINS" ]; then
    echo -e "${YELLOW}No authorized domains found in the response. Using default domains.${NC}"
    AUTHORIZED_DOMAINS="$PROJECT_ID.firebaseapp.com $PROJECT_ID.web.app"
  fi
else
  echo -e "${YELLOW}Failed to get configuration using API v2. Trying alternative method...${NC}"
  
  # Second attempt: Identity Platform API v1
  echo -e "${BLUE}Attempting to get configuration using Identity Platform API v1...${NC}"
  CONFIG_RESPONSE=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
    "https://identitytoolkit.googleapis.com/v1/projects/$PROJECT_ID:getConfig")
  
  if [[ "$CONFIG_RESPONSE" != *"error"* && "$CONFIG_RESPONSE" != *"Not Found"* ]]; then
    echo -e "${GREEN}Successfully retrieved configuration using API v1.${NC}"
    get_config_success=true
    
    # Extract authorized domains
    AUTHORIZED_DOMAINS=$(echo $CONFIG_RESPONSE | grep -o '"authorizedDomains":\[[^]]*\]' | sed 's/"authorizedDomains":\[//g' | sed 's/\]//g' | sed 's/"//g' | sed 's/,/ /g')
    
    if [ -z "$AUTHORIZED_DOMAINS" ]; then
      echo -e "${YELLOW}No authorized domains found in the response. Using default domains.${NC}"
      AUTHORIZED_DOMAINS="$PROJECT_ID.firebaseapp.com $PROJECT_ID.web.app"
    fi
  else
    echo -e "${YELLOW}Failed to get configuration using API v1. Trying another alternative...${NC}"
    
    # Third attempt: Use Firebase Management API
    echo -e "${BLUE}Attempting to get configuration using Firebase Management API...${NC}"
    CONFIG_RESPONSE=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
      "https://firebase.googleapis.com/v1beta1/projects/$PROJECT_ID")
    
    if [[ "$CONFIG_RESPONSE" != *"error"* && "$CONFIG_RESPONSE" != *"Not Found"* ]]; then
      echo -e "${GREEN}Successfully retrieved configuration using Firebase Management API.${NC}"
      get_config_success=true
      
      # Extract auth domains if available
      AUTH_DOMAINS=$(echo $CONFIG_RESPONSE | grep -o '"authDomain":\[[^]]*\]' | sed 's/"authDomain":\[//g' | sed 's/\]//g' | sed 's/"//g' | sed 's/,/ /g')
      
      if [ -z "$AUTH_DOMAINS" ]; then
        echo -e "${YELLOW}No auth domains found in the response. Using default domains.${NC}"
        AUTHORIZED_DOMAINS="$PROJECT_ID.firebaseapp.com $PROJECT_ID.web.app"
      else
        AUTHORIZED_DOMAINS=$AUTH_DOMAINS
      fi
    else
      echo -e "${YELLOW}Failed to get configuration using Firebase Management API.${NC}"
      echo -e "${YELLOW}Using default domains as fallback.${NC}"
      AUTHORIZED_DOMAINS="$PROJECT_ID.firebaseapp.com $PROJECT_ID.web.app"
    fi
  fi
fi

# Step 3: Check if localhost is already in authorized domains
if [[ "$AUTHORIZED_DOMAINS" == *"localhost"* ]]; then
  echo -e "\n${GREEN}localhost is already in the authorized domains list:${NC}"
  echo -e "${CYAN}$AUTHORIZED_DOMAINS${NC}"
  echo -e "\n${GREEN}No action needed. Your Firebase Authentication should work on localhost.${NC}"
  exit 0
fi

# Step 4: Add localhost to authorized domains
echo -e "\n${BLUE}Current authorized domains:${NC}"
for domain in $AUTHORIZED_DOMAINS; do
  echo -e "  - ${CYAN}$domain${NC}"
done

echo -e "\n${YELLOW}Adding localhost to authorized domains...${NC}"
UPDATED_DOMAINS="\"localhost\", \"$PROJECT_ID.firebaseapp.com\", \"$PROJECT_ID.web.app\""

# Format domains for JSON
JSON_DOMAINS="[${UPDATED_DOMAINS}]"
echo -e "${BLUE}New domains list: ${CYAN}$JSON_DOMAINS${NC}\n"

# Step 5: Update the configuration with new domains
update_success=false

# First attempt: Identity Platform API v2
echo -e "${BLUE}Attempting to update configuration using Identity Platform API v2...${NC}"
UPDATE_RESPONSE=$(curl -s -X PATCH \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"authorizedDomains\": $JSON_DOMAINS}" \
  "https://identitytoolkit.googleapis.com/v2/projects/$PROJECT_ID/config")

# Check if the update was successful
if [[ "$UPDATE_RESPONSE" != *"error"* && "$UPDATE_RESPONSE" != *"Not Found"* ]]; then
  echo -e "${GREEN}Successfully updated authorized domains using API v2!${NC}"
  update_success=true
else
  echo -e "${YELLOW}Failed to update configuration using API v2. Trying alternative method...${NC}"
  
  # Second attempt: Identity Platform API v1
  echo -e "${BLUE}Attempting to update configuration using Identity Platform API v1...${NC}"
  UPDATE_RESPONSE=$(curl -s -X PATCH \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"authorizedDomains\": $JSON_DOMAINS}" \
    "https://identitytoolkit.googleapis.com/v1/projects/$PROJECT_ID:updateConfig")
  
  if [[ "$UPDATE_RESPONSE" != *"error"* && "$UPDATE_RESPONSE" != *"Not Found"* ]]; then
    echo -e "${GREEN}Successfully updated authorized domains using API v1!${NC}"
    update_success=true
  else
    echo -e "${YELLOW}Failed to update configuration using API v1. Trying another alternative...${NC}"
    
    # Third attempt: Custom endpoint
    echo -e "${BLUE}Attempting to update configuration using alternative endpoint...${NC}"
    UPDATE_RESPONSE=$(curl -s -X PATCH \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"authorizedDomains\": $JSON_DOMAINS}" \
      "https://identitytoolkit.googleapis.com/admin/v2/projects/$PROJECT_ID/config")
    
    if [[ "$UPDATE_RESPONSE" != *"error"* && "$UPDATE_RESPONSE" != *"Not Found"* ]]; then
      echo -e "${GREEN}Successfully updated authorized domains using alternative endpoint!${NC}"
      update_success=true
    else
      echo -e "${RED}Failed to update authorized domains using all API methods.${NC}"
    fi
  fi
fi

# Final status message
if [ "$update_success" = true ]; then
  echo -e "\n${BOLD}${GREEN}=============================================================================${NC}"
  echo -e "${BOLD}${GREEN} SUCCESS: LOCALHOST ADDED TO FIREBASE AUTH DOMAINS ${NC}"
  echo -e "${BOLD}${GREEN}=============================================================================${NC}"
  echo -e "\n${GREEN}You should now be able to use Google Sign-In on localhost.${NC}"
  echo -e "${GREEN}If you're still experiencing issues, try clearing your browser cache and cookies.${NC}"
else
  echo -e "\n${BOLD}${RED}=============================================================================${NC}"
  echo -e "${BOLD}${RED} MANUAL ACTION REQUIRED ${NC}"
  echo -e "${BOLD}${RED}=============================================================================${NC}"
  echo -e "\n${YELLOW}Unable to automatically update authorized domains. Please follow these steps:${NC}"
  echo -e "${YELLOW}1. Go to Firebase Console:${NC}"
  echo -e "${CYAN}   https://console.firebase.google.com/project/$PROJECT_ID/authentication/settings${NC}"
  echo -e "${YELLOW}2. In the \"Authorized domains\" section, click \"Add domain\"${NC}"
  echo -e "${YELLOW}3. Add \"localhost\" as an authorized domain${NC}"
  echo -e "${YELLOW}4. Click \"Add\"${NC}"
fi

exit 0

