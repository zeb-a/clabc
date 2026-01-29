#!/bin/zsh

# Add workspace to PATH for PocketBase
export PATH="/workspace:$PATH"

# Set backend port and URL for PocketBase
export BACKEND_PORT=4002
export VITE_BACKEND_URL="http://127.0.0.1:$BACKEND_PORT"

# Start PocketBase in the background
echo "Starting PocketBase on port $BACKEND_PORT..."
pocketbase serve --http=0.0.0.0:$BACKEND_PORT &
POCKETBASE_PID=$!

# Give PocketBase time to start
sleep 2

# Start Vite dev server
echo "Starting Vite dev server..."
VITE_BACKEND_URL=$VITE_BACKEND_URL npm run dev

# Cleanup: kill PocketBase when dev server exits
kill $POCKETBASE_PID 2>/dev/null
