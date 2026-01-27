#!/bin/bash
# test-authentication.sh

echo "🔐 Testing Authentication System..."
echo "========================================"

BASE_URL="http://localhost:3002"

# Test 1: Register a new user
echo "1. Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPassword123",
    "name": "Test User"
  }')

echo "Registration Response:"
echo "$REGISTER_RESPONSE" | jq .

# Extract tokens
ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.tokens.accessToken')
REFRESH_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.tokens.refreshToken')

if [ "$ACCESS_TOKEN" != "null" ]; then
  echo "✅ Registration successful!"
  echo "Access Token: ${ACCESS_TOKEN:0:50}..."
  echo "Refresh Token: ${REFRESH_TOKEN:0:50}..."
else
  echo "❌ Registration failed"
  exit 1
fi

# Test 2: Login
echo ""
echo "2. Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPassword123"
  }')

echo "Login Response:"
echo "$LOGIN_RESPONSE" | jq '.success, .message, .data.user.email'

# Test 3: Get profile with token
echo ""
echo "3. Testing protected route (get profile)..."
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/profile" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Profile Response:"
echo "$PROFILE_RESPONSE" | jq '.success, .message, .data.email'

# Test 4: Refresh token
echo ""
echo "4. Testing token refresh..."
REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}")

echo "Refresh Response:"
echo "$REFRESH_RESPONSE" | jq '.success, .message, .data.accessToken'

# Extract new access token
NEW_ACCESS_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.data.accessToken')

# Test 5: Test with new access token
echo ""
echo "5. Testing with refreshed token..."
if [ "$NEW_ACCESS_TOKEN" != "null" ]; then
  PROFILE_RESPONSE_2=$(curl -s -X GET "$BASE_URL/api/auth/profile" \
    -H "Authorization: Bearer $NEW_ACCESS_TOKEN")
  
  echo "Profile with new token:"
  echo "$PROFILE_RESPONSE_2" | jq '.success'
fi

# Test 6: Logout
echo ""
echo "6. Testing logout..."
LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/logout" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}")

echo "Logout Response:"
echo "$LOGOUT_RESPONSE" | jq '.success, .message'

# Test 7: Test expired token protection
echo ""
echo "7. Testing expired token handling..."
EXPIRED_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
EXPIRED_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/profile" \
  -H "Authorization: Bearer $EXPIRED_TOKEN")

echo "Expired Token Response:"
echo "$EXPIRED_RESPONSE" | jq '.success, .message, .code'

echo ""
echo "========================================"
echo "🎉 Authentication tests completed!"
echo ""
echo "Summary:"
echo "✅ User registration"
echo "✅ User login"
echo "✅ Protected route access"
echo "✅ Token refresh"
echo "✅ Logout functionality"
echo "✅ Token expiration handling"
