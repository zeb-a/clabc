FROM node:20-alpine AS build_stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM alpine:latest
RUN apk add --no-cache unzip ca-certificates


WORKDIR /pb


ADD https://github.com/pocketbase/pocketbase/releases/download/v0.35.0/pocketbase_0.35.0_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/ && rm /tmp/pb.zip

# ensure the binary is executable and move it to PATH so mounting /pb won't hide it
RUN chmod +x /pb/pocketbase && mv /pb/pocketbase /usr/local/bin/pocketbase || true

# create public and persistent data folders; these are safe mount points
RUN mkdir -p /pb/pb_public /pb/pb_data /pb/storage && chown -R root:root /pb

# copy built frontend into the public dir
COPY --from=build_stage /app/dist /pb/pb_public

EXPOSE 8080

# Use the pocketbase from PATH and an absolute publicDir
CMD ["pocketbase", "serve", "--http=0.0.0.0:8080", "--publicDir=/pb/pb_public", "--indexFallback"]