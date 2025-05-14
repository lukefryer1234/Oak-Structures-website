#!/bin/bash

# Get access token using gcloud
TOKEN=$(gcloud auth print-identity-token)
PROJECT_ID="timberline-commerce"

# Attempt to enable the Google provider using the Firebase Admin REST API
curl -X POST \
  "https://firebase.googleapis.com/v1beta1/projects/${PROJECT_ID}:updateConfig" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "authConfig": {
      "providers": {
        "google.com": {
          "enabled": true
        }
      }
    }
  }'
