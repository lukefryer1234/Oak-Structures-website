#!/bin/bash

# Get access token using gcloud
TOKEN=$(gcloud auth print-access-token)
PROJECT_ID="timberline-commerce"

# Make API call to get the current config
curl -X GET \
  "https://identitytoolkit.googleapis.com/v2/projects/$PROJECT_ID/config" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
