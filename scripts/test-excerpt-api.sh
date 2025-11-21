#!/bin/bash

# ============================================================================
# Excerpt API Test Script
# ============================================================================
# Tests the excerpt request and download endpoints
#
# Usage:
#   ./scripts/test-excerpt-api.sh [base-url]
#
# Examples:
#   ./scripts/test-excerpt-api.sh                          # Uses localhost:3000
#   ./scripts/test-excerpt-api.sh https://ai-born.org      # Production
# ============================================================================

set -e

# Configuration
BASE_URL="${1:-http://localhost:3000}"
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_NAME="Test User"

echo "============================================"
echo "Excerpt API Test Suite"
echo "============================================"
echo "Base URL: $BASE_URL"
echo "Test Email: $TEST_EMAIL"
echo ""

# ============================================================================
# Test 1: Request Excerpt
# ============================================================================

echo "[Test 1] Requesting excerpt..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/excerpt/request" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"name\":\"$TEST_NAME\",\"source\":\"test_script\"}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
  echo "✓ Request successful (HTTP $HTTP_CODE)"
else
  echo "✗ Request failed (HTTP $HTTP_CODE)"
  echo "Response: $BODY"
  exit 1
fi

# Extract download URL
DOWNLOAD_URL=$(echo "$BODY" | grep -o '"downloadUrl":"[^"]*"' | cut -d'"' -f4)

if [ -z "$DOWNLOAD_URL" ]; then
  echo "✗ No download URL in response"
  echo "Response: $BODY"
  exit 1
fi

echo "✓ Download URL received"
echo "  URL: $DOWNLOAD_URL"
echo ""

# ============================================================================
# Test 2: Download PDF
# ============================================================================

echo "[Test 2] Downloading PDF..."
OUTPUT_FILE="/tmp/ai-born-excerpt-test.pdf"

HTTP_CODE=$(curl -s -w "%{http_code}" -o "$OUTPUT_FILE" "$DOWNLOAD_URL")

if [ "$HTTP_CODE" -eq 200 ]; then
  echo "✓ Download successful (HTTP $HTTP_CODE)"
else
  echo "✗ Download failed (HTTP $HTTP_CODE)"
  cat "$OUTPUT_FILE"
  rm -f "$OUTPUT_FILE"
  exit 1
fi

# Verify PDF file
if [ ! -f "$OUTPUT_FILE" ]; then
  echo "✗ PDF file not created"
  exit 1
fi

FILE_SIZE=$(stat -f%z "$OUTPUT_FILE" 2>/dev/null || stat -c%s "$OUTPUT_FILE" 2>/dev/null)
echo "✓ PDF file created"
echo "  Path: $OUTPUT_FILE"
echo "  Size: $FILE_SIZE bytes"

# Check PDF magic number
FILE_TYPE=$(file -b "$OUTPUT_FILE" | head -n1)
if [[ "$FILE_TYPE" == *"PDF"* ]]; then
  echo "✓ File is valid PDF"
else
  echo "✗ File is not a PDF"
  echo "  File type: $FILE_TYPE"
  rm -f "$OUTPUT_FILE"
  exit 1
fi

echo ""

# ============================================================================
# Test 3: Rate Limiting
# ============================================================================

echo "[Test 3] Testing rate limiting..."
echo "Making 11 requests (limit is 10/hour)..."

RATE_LIMITED=false

for i in {1..11}; do
  HTTP_CODE=$(curl -s -w "%{http_code}" -o /dev/null -X POST "$BASE_URL/api/excerpt/request" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"rate-test-$i@example.com\"}")

  if [ "$HTTP_CODE" -eq 429 ]; then
    RATE_LIMITED=true
    echo "✓ Rate limit enforced after $i requests"
    break
  fi
done

if [ "$RATE_LIMITED" = true ]; then
  echo "✓ Rate limiting working correctly"
else
  echo "⚠ Rate limit not triggered (may need configuration)"
fi

echo ""

# ============================================================================
# Test 4: Invalid Token
# ============================================================================

echo "[Test 4] Testing invalid token..."
INVALID_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.token"
HTTP_CODE=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/api/excerpt/download?token=$INVALID_TOKEN")

if [ "$HTTP_CODE" -eq 401 ]; then
  echo "✓ Invalid token rejected (HTTP $HTTP_CODE)"
else
  echo "⚠ Invalid token not properly rejected (HTTP $HTTP_CODE)"
fi

echo ""

# ============================================================================
# Test 5: Missing Token
# ============================================================================

echo "[Test 5] Testing missing token..."
HTTP_CODE=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/api/excerpt/download")

if [ "$HTTP_CODE" -eq 401 ]; then
  echo "✓ Missing token rejected (HTTP $HTTP_CODE)"
else
  echo "⚠ Missing token not properly rejected (HTTP $HTTP_CODE)"
fi

echo ""

# ============================================================================
# Test 6: Email Validation
# ============================================================================

echo "[Test 6] Testing email validation..."
HTTP_CODE=$(curl -s -w "%{http_code}" -o /dev/null -X POST "$BASE_URL/api/excerpt/request" \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email"}')

if [ "$HTTP_CODE" -eq 400 ]; then
  echo "✓ Invalid email rejected (HTTP $HTTP_CODE)"
else
  echo "⚠ Invalid email not properly rejected (HTTP $HTTP_CODE)"
fi

echo ""

# ============================================================================
# Summary
# ============================================================================

echo "============================================"
echo "Test Summary"
echo "============================================"
echo "✓ All critical tests passed"
echo ""
echo "Files:"
echo "  Test PDF: $OUTPUT_FILE"
echo ""
echo "Cleanup:"
echo "  rm $OUTPUT_FILE"
echo ""
echo "============================================"
