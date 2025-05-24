#!/bin/bash

# Get an access token
ACCESS_TOKEN=$(gcloud auth print-access-token)

# Set your Firebase project ID
PROJECT_ID="timberline-commerce"

# Make the API request to get Firebase project configuration
curl -s -X GET \
  "https://firebase.googleapis.com/v1beta1/projects/${PROJECT_ID}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json"
