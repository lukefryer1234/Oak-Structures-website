import requests
import json
import time

# Use a unique email for each test run to avoid conflicts
timestamp = int(time.time())
test_email = f"testuser_{timestamp}@example.com"

url = "http://localhost:9004/api/auth/register"
payload = {
    "email": test_email,
    "password": "strongPassword123",
    "displayName": "Test User"
}
headers = {
    "Content-Type": "application/json"
}

print(f"Attempting to register user: {test_email}")

try:
    response = requests.post(url, data=json.dumps(payload), headers=headers, timeout=15)

    print(f"Status Code: {response.status_code}")
    try:
        print("Response JSON:", response.json())
    except json.JSONDecodeError:
        print("Response Text:", response.text)

except requests.exceptions.RequestException as e:
    print(f"An error occurred: {e}")
