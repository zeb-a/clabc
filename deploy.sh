#!/bin/bash

# --- CONFIGURATION ---
SERVER_IP="47.239.40.131"
REMOTE_PATH="/root/clabc/"
IMAGE_NAME="klasiz-app"
CONTAINER_NAME="klasiz-live"

echo "🚀 Starting Deployment..."

# 1. Build locally
echo "📦 Building React app..."
npm run build

# 2. Package
echo "🤐 Zipping files..."
zip -r deploy.zip dist Dockerfile

# 3. Upload
echo "🚚 Uploading to server..."
scp deploy.zip root@$SERVER_IP:$REMOTE_PATH

# 4. Remote Commands
echo "🔧 Server-side update in progress..."
ssh root@$SERVER_IP << EOF
    cd $REMOTE_PATH
    unzip -o deploy.zip
    docker build --no-cache -t $IMAGE_NAME .
    docker rm -f $CONTAINER_NAME
    # Detect Caddy network and run app
    NET_NAME=\$(docker inspect caddy -f '{{range \$k,\$v := .NetworkSettings.Networks}}{{\$k}}{{end}}')
    docker run -d \
      --name $CONTAINER_NAME \
      --network \$NET_NAME \
      --restart unless-stopped \
      -v /root/pb_data:/pb/pb_data \
      $IMAGE_NAME
    docker restart caddy
    rm deploy.zip
    echo "✅ Server updated successfully!"
EOF

echo "🎉 All done! Visit https://klasiz.fun"