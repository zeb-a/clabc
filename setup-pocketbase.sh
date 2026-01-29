#!/bin/bash

# Setup PocketBase collections for class123

POCKETBASE_URL="http://localhost:4002"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="password123"

echo "Setting up PocketBase collections..."

# Function to make authenticated requests
auth_request() {
  local method=$1
  local endpoint=$2
  local data=$3
  local token=$4
  
  if [ -z "$token" ]; then
    curl -s -X "$method" "$POCKETBASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data"
  else
    curl -s -X "$method" "$POCKETBASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      -H "Authorization: $token" \
      -d "$data"
  fi
}

# Step 1: Login as admin
echo "Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$POCKETBASE_URL/api/admins/auth-with-password" \
  -H "Content-Type: application/json" \
  -d "{\"identity\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

ADMIN_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ]; then
  echo "Failed to authenticate as admin"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "Admin token: $ADMIN_TOKEN"

# Step 2: Create behaviors collection
echo "Creating behaviors collection..."
BEHAVIORS_SCHEMA=$(cat <<'EOF'
{
  "name": "behaviors",
  "type": "base",
  "system": false,
  "createRule": null,
  "updateRule": null,
  "deleteRule": null,
  "listRule": null,
  "viewRule": null,
  "fields": [
    {
      "system": false,
      "id": "text1",
      "name": "label",
      "type": "text",
      "required": true,
      "presentable": false,
      "unique": false,
      "options": {
        "min": 1,
        "max": 255,
        "pattern": ""
      }
    },
    {
      "system": false,
      "id": "number1",
      "name": "pts",
      "type": "number",
      "required": true,
      "presentable": false,
      "unique": false,
      "options": {
        "min": null,
        "max": null,
        "noDecimal": false
      }
    },
    {
      "system": false,
      "id": "select1",
      "name": "type",
      "type": "select",
      "required": true,
      "presentable": false,
      "unique": false,
      "options": {
        "maxSelect": 1,
        "values": ["wow", "nono"]
      }
    },
    {
      "system": false,
      "id": "text2",
      "name": "icon",
      "type": "text",
      "required": false,
      "presentable": false,
      "unique": false,
      "options": {
        "min": 1,
        "max": 255,
        "pattern": ""
      }
    }
  ]
}
EOF
)

curl -s -X POST "$POCKETBASE_URL/api/admin/collections" \
  -H "Content-Type: application/json" \
  -H "Authorization: $ADMIN_TOKEN" \
  -d "$BEHAVIORS_SCHEMA" > /dev/null 2>&1

echo "Behaviors collection created (or already exists)"

# Step 3: Create classes collection
echo "Creating classes collection..."
CLASSES_SCHEMA=$(cat <<'EOF'
{
  "name": "classes",
  "type": "base",
  "system": false,
  "createRule": null,
  "updateRule": null,
  "deleteRule": null,
  "listRule": null,
  "viewRule": null,
  "fields": [
    {
      "system": false,
      "id": "text1",
      "name": "name",
      "type": "text",
      "required": true,
      "presentable": false,
      "unique": false,
      "options": {
        "min": 1,
        "max": 255,
        "pattern": ""
      }
    },
    {
      "system": false,
      "id": "text2",
      "name": "teacher",
      "type": "text",
      "required": true,
      "presentable": false,
      "unique": false,
      "options": {
        "min": 1,
        "max": 255,
        "pattern": ""
      }
    },
    {
      "system": false,
      "id": "json1",
      "name": "students",
      "type": "json",
      "required": false,
      "presentable": false,
      "unique": false,
      "options": {}
    },
    {
      "system": false,
      "id": "json2",
      "name": "tasks",
      "type": "json",
      "required": false,
      "presentable": false,
      "unique": false,
      "options": {}
    }
  ]
}
EOF
)

curl -s -X POST "$POCKETBASE_URL/api/admin/collections" \
  -H "Content-Type: application/json" \
  -H "Authorization: $ADMIN_TOKEN" \
  -d "$CLASSES_SCHEMA" > /dev/null 2>&1

echo "Classes collection created (or already exists)"

echo "Setup complete!"
