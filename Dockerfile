FROM alpine:latest
RUN apk add --no-cache unzip ca-certificates
WORKDIR /pb

# 1. Download PocketBase
ADD https://github.com/pocketbase/pocketbase/releases/download/v0.23.0/pocketbase_0.23.0_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/ && rm /tmp/pb.zip

# 2. Make it executable and move to PATH
RUN chmod +x /pb/pocketbase && mv /pb/pocketbase /usr/local/bin/pocketbase

# 3. Create necessary folders
RUN mkdir -p /pb/pb_public /pb/pb_data /pb/storage

# 4. Copy your PRE-BUILT files from your Mac
COPY dist /pb/pb_public

EXPOSE 8080

# Start PocketBase
CMD ["pocketbase", "serve", "--http=0.0.0.0:8080", "--publicDir=/pb/pb_public", "--indexFallback"]