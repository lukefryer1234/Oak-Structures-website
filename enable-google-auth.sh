#!/bin/bash

# Get access token using gcloud
TOKEN=$(gcloud auth print-access-token)
PROJECT_ID="timberline-commerce"

# Make API call to enable Google authentication
curl -X PATCH \
  "https://identitytoolkit.googleapis.com/v2/projects/$PROJECT_ID/config" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "signIn": {
      "email": {
        "enabled": true
      },
      "phoneNumber": {
        "enabled": false
      },
      "anonymous": {
        "enabled": true
      },
      "allowDuplicateEmails": false
    },
    "authorized": {
      "domains": ["timberline-commerce.web.app", "localhost"]
    }
  }'
