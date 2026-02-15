#!/usr/bin/env python3
"""Initialize PocketBase collections for class123"""
import requests
import json
import time

BASE_URL = "http://localhost:4002/api"
ADMIN_EMAIL = "admin@classabc.app"
ADMIN_PASSWORD = "password123"

def make_request(method, path, data=None, token=None):
    """Make an API request"""
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    if method == "GET":
        res = requests.get(url, headers=headers)
    elif method == "POST":
        res = requests.post(url, json=data, headers=headers)
    elif method == "PATCH":
        res = requests.patch(url, json=data, headers=headers)
    else:
        raise ValueError(f"Unknown method: {method}")
    
    return res

def setup():
    """Setup PocketBase"""
    
    # Check health
    print("Checking PocketBase...")
    res = make_request("GET", "/health")
    if res.status_code != 200:
        print(f"ERROR: PocketBase not healthy: {res.text}")
        return False
    print("✓ PocketBase is healthy")
    
    # Get all collections
    print("\nFetching collections...")
    res = make_request("GET", "/collections")
    if res.status_code == 401:
        print("  Collections are auth-protected")
        collections = {}
    else:
        collections = {c["name"]: c for c in res.json().get("items", [])}
        print(f"✓ Found {len(collections)} collections: {list(collections.keys())}")
    
    # Create users collection if it doesn't exist
    if "users" not in collections:
        print("\nCreating users collection...")
        res = make_request("POST", "/collections", {
            "name": "users",
            "type": "auth",
            "createRule": "!@externalAuthToken && !@collection.users.id && (@request.auth.id = null || (@request.auth.id ?= @collection.users.id))",
            "updateRule": "@request.auth.id = id",
            "deleteRule": "@request.auth.id = id",
            "options": {
                "allowEmailAuth": True,
                "allowOAuth2Auth": False,
                "allowUsernameAuth": False,
                "minPasswordLength": 8,
                "requireEmail": True
            },
            "fields": [
                {
                    "name": "email",
                    "type": "email",
                    "required": True,
                    "unique": True
                },
                {
                    "name": "emailVisibility",
                    "type": "bool",
                    "hidden": True,
                    "default": False
                },
                {
                    "name": "password",
                    "type": "password",
                    "hidden": True
                },
                {
                    "name": "tokenKey",
                    "type": "text",
                    "hidden": True
                },
                {
                    "name": "verified",
                    "type": "bool",
                    "default": False
                },
                {
                    "name": "name",
                    "type": "text"
                }
            ]
        })
        if res.status_code == 200:
            print("✓ Users collection created")
        else:
            print(f"✗ Failed to create users collection: {res.status_code} - {res.text}")
    else:
        print("\n✓ Users collection already exists")
    
    # Create behaviors collection if it doesn't exist
    if "behaviors" not in collections:
        print("\nCreating behaviors collection...")
        res = make_request("POST", "/collections", {
            "name": "behaviors",
            "type": "base",
            "createRule": None,
            "updateRule": None,
            "deleteRule": None,
            "listRule": None,
            "viewRule": None,
            "fields": [
                {
                    "name": "label",
                    "type": "text",
                    "required": True
                },
                {
                    "name": "pts",
                    "type": "number",
                    "required": True
                },
                {
                    "name": "type",
                    "type": "select",
                    "required": True,
                    "options": {
                        "maxSelect": 1,
                        "values": ["wow", "nono"]
                    }
                },
                {
                    "name": "icon",
                    "type": "text"
                }
            ]
        })
        if res.status_code == 200:
            print("✓ Behaviors collection created")
        else:
            print(f"✗ Failed to create behaviors collection: {res.status_code} - {res.text}")
    else:
        print("\n✓ Behaviors collection already exists")
    
    # Create classes collection if it doesn't exist
    if "classes" not in collections:
        print("\nCreating classes collection...")
        res = make_request("POST", "/collections", {
            "name": "classes",
            "type": "base",
            "createRule": None,
            "updateRule": None,
            "deleteRule": None,
            "listRule": None,
            "viewRule": None,
            "fields": [
                {
                    "name": "name",
                    "type": "text",
                    "required": True
                },
                {
                    "name": "teacher",
                    "type": "text",
                    "required": True
                },
                {
                    "name": "students",
                    "type": "json"
                },
                {
                    "name": "tasks",
                    "type": "json"
                }
            ]
        })
        if res.status_code == 200:
            print("✓ Classes collection created")
        else:
            print(f"✗ Failed to create classes collection: {res.status_code} - {res.text}")
    else:
        print("\n✓ Classes collection already exists")

    # Create lesson_plans collection if it doesn't exist
    if "lesson_plans" not in collections:
        print("\nCreating lesson_plans collection...")
        res = make_request("POST", "/collections", {
            "name": "lesson_plans",
            "type": "base",
            "createRule": None,
            "updateRule": None,
            "deleteRule": None,
            "listRule": None,
            "viewRule": None,
            "fields": [
                {"name": "teacher", "type": "text", "required": True},
                {"name": "class_id", "type": "text", "required": True},
                {"name": "period", "type": "text", "required": True},
                {"name": "title", "type": "text"},
                {"name": "date", "type": "text"},
                {"name": "data", "type": "json"}
            ]
        })
        if res.status_code == 200:
            print("✓ lesson_plans collection created")
        else:
            print(f"✗ Failed to create lesson_plans: {res.status_code} - {res.text}")
    else:
        print("\n✓ lesson_plans collection already exists")
    
    print("\n✓ Setup complete!")

if __name__ == "__main__":
    setup()
