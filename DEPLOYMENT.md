# Deployment Instructions

Your project is now fully host-independent and ready for automatic deployment on any Docker-compatible hosting platform.

## Quick Start

1. **Build and Run with Docker:**
   ```bash
   docker build -t classabc .
   docker run -p 8080:8080 -v $(pwd)/pb_data:/pb/pb_data classabc
   ```

2. **Access your application:**
   - Open your browser to `http://localhost:8080` (or your deployed URL)
   - Everything works automatically - no configuration needed!

## What Makes This Deployment Automatic

### 1. **Host-Agnostic Architecture**
- Frontend uses relative paths (`/api`) instead of hardcoded URLs
- Works on any domain/IP automatically
- No need to configure domain names in code

### 2. **Docker Integration**
- Single Dockerfile builds everything
- Serves React frontend and PocketBase backend together
- Exposes port 8080 for HTTP access

### 3. **Zero Configuration Required**
- PocketBase and frontend share the same host
- No environment variables needed for production
- Just run the container and it works!

## Deploying to Cloud Platforms

### Alibaba Cloud, Tencent Cloud, 10Cent, etc.

Most cloud platforms support Docker. Here's the universal process:

1. **Push your code** (Git or upload files)
2. **Select Docker runtime**
3. **Set exposed port** to `8080`
4. **Deploy!**

That's it! The platform will:
- Build the Docker image
- Start the container
- Assign a URL/domain automatically
- Your app works instantly

### Example Platform-Specific Commands

**Docker Compose (production):**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8080:8080"
    volumes:
      - ./pb_data:/pb/pb_data
    restart: unless-stopped
```

**Kubernetes:**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: classabc
spec:
  selector:
    app: classabc
  ports:
  - port: 8080
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: classabc
spec:
  replicas: 1
  selector:
    matchLabels:
      app: classabc
  template:
    metadata:
      labels:
        app: classabc
    spec:
      containers:
      - name: classabc
        image: classabc:latest
        ports:
        - containerPort: 8080
        volumeMounts:
        - name: data
          mountPath: /pb/pb_data
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: classabc-data
```

## Data Persistence

**Important:** Your PocketBase data is stored in `/pb/pb_data` inside the container.

To persist data across deployments:
- Mount a volume to `/pb/pb_data`
- Example: `-v $(pwd)/pb_data:/pb/pb_data`

## First-Time Setup

After deployment:

1. **Visit your deployed URL**
2. **Create an admin account** - PocketBase will ask you to set up the first admin
3. **Start using your app!**

PocketBase auto-initializes with:
- Admin authentication
- Database schema from `pb_schema.json` (if provided)
- All collections ready to use

## Port Configuration

- **Default port:** `8080`
- **Internal command:** `pocketbase serve --http=0.0.0.0:8080`
- **Change port:** Modify `EXPOSE 8080` and `CMD` in Dockerfile

## Troubleshooting

**App won't start?**
- Check logs: `docker logs <container-id>`
- Ensure port 8080 is not in use
- Verify volume permissions

**Can't access API?**
- Browser console shows 404/500 errors
- Check that PocketBase is running
- Verify no firewall blocking port 8080

**Lost data after restart?**
- Remember to mount `/pb/pb_data` volume
- Data is NOT persistent inside container without volumes

## Security Notes

For production, consider:
- Use HTTPS (configure reverse proxy like nginx)
- Enable PocketBase admin authentication
- Set up CORS if accessing from different domains
- Regular backups of `/pb/pb_data`

## Support

For more information:
- PocketBase docs: https://pocketbase.io/docs/
- Docker docs: https://docs.docker.com/
