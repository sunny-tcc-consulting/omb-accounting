# omb-accounting Docker Deployment Guide

This guide covers deploying omb-accounting using Docker.

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- 2GB RAM minimum
- 1GB disk space

## Quick Start

### 1. Clone and Configure

```bash
cd omb-accounting

# Copy environment template
cp .env.docker.example .env.docker

# Generate secure JWT secret
JWT_SECRET=$(openssl rand -base64 32)
sed -i "s/your-super-secret-jwt-key-change-in-production/$JWT_SECRET/" .env.docker
```

### 2. Initialize and Start

```bash
# Make script executable
chmod +x docker-init.sh

# Initialize with empty database (admin user only)
./docker-init.sh empty

# OR initialize with sample data
./docker-init.sh seed
```

### 3. Access Application

Open http://localhost:3000

**Default Admin Credentials:**

- Email: `admin@omb.com`
- Password: `admin123`

⚠️ **Change password immediately after first login!**

## Manual Deployment

### Build Image

```bash
docker build -t omb-accounting:latest .
```

### Run Container

```bash
# Create volumes
docker volume create omb-data
docker volume create omb-logs

# Run container
docker run -d \
  --name omb-accounting \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e JWT_SECRET="your-secure-secret" \
  -v omb-data:/app/data \
  -v omb-logs:/app/logs \
  --restart unless-stopped \
  omb-accounting:latest
```

### Initialize Database

```bash
# Empty initialization
docker exec omb-accounting node -e "require('./src/lib/database/migrations').runMigrations()"

# With seed data
docker exec omb-accounting node -e "require('./src/lib/database/migrations').runMigrations()"
docker exec omb-accounting node -e "require('./src/lib/database/seed').seedDatabase()"
```

## Docker Compose

### Start Services

```bash
# Start application
docker compose up -d

# View logs
docker compose logs -f

# Stop application
docker compose down
```

### Initialize Database

```bash
# Empty initialization
docker compose --profile init up omb-init

# With seed data
INIT_MODE=seed docker compose --profile init up omb-init
```

## Environment Variables

| Variable        | Description          | Default                       |
| --------------- | -------------------- | ----------------------------- |
| `NODE_ENV`      | Environment          | `production`                  |
| `PORT`          | Application port     | `3000`                        |
| `DATABASE_PATH` | SQLite database path | `/app/data/omb-accounting.db` |
| `JWT_SECRET`    | JWT signing secret   | _(required)_                  |
| `INIT_MODE`     | Initialization mode  | `empty`                       |
| `LOG_LEVEL`     | Logging level        | `info`                        |

## Data Persistence

Data is stored in Docker volumes:

- **omb-data**: SQLite database and migrations
- **omb-logs**: Application logs

### Backup Database

```bash
docker run --rm \
  -v omb-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/omb-data-backup.tar.gz /data
```

### Restore Database

```bash
docker run --rm \
  -v omb-data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/omb-data-backup.tar.gz -C /
```

## Health Check

```bash
# Check health endpoint
curl http://localhost:3000/api/health

# Check container health
docker inspect --format='{{.State.Health.Status}}' omb-accounting
```

## Troubleshooting

### View Logs

```bash
# All logs
docker compose logs

# Follow logs
docker compose logs -f

# Last 100 lines
docker compose logs --tail=100
```

### Reset Everything

```bash
# Stop and remove all containers and volumes
docker compose down -v

# Reinitialize
./docker-init.sh empty
```

### Database Issues

```bash
# Check database file
docker exec omb-accounting ls -la /app/data/

# Check database integrity
docker exec omb-accounting sqlite3 /app/data/omb-accounting.db "PRAGMA integrity_check;"
```

### Permission Issues

```bash
# Fix volume permissions
docker compose down
sudo chown -R 1001:1001 /var/lib/docker/volumes/omb-data/_data
docker compose up -d
```

## Production Deployment

### Security Recommendations

1. **Change default credentials** immediately
2. **Use strong JWT_SECRET** (minimum 32 characters)
3. **Enable HTTPS** with reverse proxy (nginx/traefik)
4. **Restrict network access** with firewall rules
5. **Regular backups** of database volume
6. **Monitor logs** for security issues
7. **Keep image updated** with security patches

### Example: Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name accounting.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name accounting.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Docker Swarm

```bash
# Deploy to Swarm
docker stack deploy -c docker-compose.yml omb

# Scale service
docker service scale omb_omb-accounting=3
```

### Kubernetes

See `k8s/` directory for Kubernetes manifests.

## Performance Tuning

### Memory Limits

```yaml
services:
  omb-accounting:
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

### CPU Limits

```yaml
services:
  omb-accounting:
    deploy:
      resources:
        limits:
          cpus: "1.0"
        reservations:
          cpus: "0.5"
```

## Support

For issues and questions:

- GitHub Issues: https://github.com/sunny-tcc-consulting/omb-accounting/issues
- Documentation: https://github.com/sunny-tcc-consulting/omb-accounting/blob/main/README.md
