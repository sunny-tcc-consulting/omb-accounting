# omb-accounting Quick Start Guide

## One-Command Deployment

The initialization script automatically detects your container runtime (Docker or Podman) and configures everything for you.

```bash
# Initialize with empty database (admin user only)
./docker-init.sh empty

# OR initialize with sample data
./docker-init.sh seed

# Without compose (pure docker/podman commands)
./docker-init.sh empty --no-compose
```

## Automatic Runtime Detection

The script will automatically:

1. ✅ Check if **Docker** is running → use `docker compose`
2. ✅ Check if **Podman** is running → use `podman-compose`
3. ⚠️ Compose not available → use pure `docker` or `podman` commands
4. ❌ Neither found → show installation instructions

### Manual Override

If you want to specify the runtime:

```bash
# Force Docker with compose
docker compose up

# Force Podman with compose
podman-compose up

# Force pure Docker (no compose)
./docker-init.sh empty --no-compose

# Force pure Podman (no compose)
./docker-init.sh seed --no-compose
```

## Access the Application

**URL:** http://localhost:3000

**Default Credentials:**

- Email: `admin@omb.com`
- Password: `admin123`

⚠️ **Change password immediately after first login!**

## Common Commands

### With Compose (Recommended)

```bash
# View logs
docker compose logs -f
# or
podman-compose logs -f

# Stop application
docker compose down
# or
podman-compose down

# Restart
docker compose restart
# or
podman-compose restart

# Reset everything
docker compose down -v
# or
podman-compose down -v
```

### Pure Container Commands (No Compose)

```bash
# View logs
docker logs -f omb-accounting
# or
podman logs -f omb-accounting

# Stop application
docker stop omb-accounting
docker rm omb-accounting
# or
podman stop omb-accounting
podman rm omb-accounting

# Restart
docker restart omb-accounting
# or
podman restart omb-accounting

# Reset everything
docker stop omb-accounting
docker rm omb-accounting
docker volume rm omb-data omb-logs
# or
podman stop omb-accounting
podman rm omb-accounting
podman volume rm omb-data omb-logs
```

## Installation

### Docker (Recommended for most users)

**Ubuntu/Debian:**

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

**Fedora/RHEL:**

```bash
sudo dnf install docker docker-compose
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER
```

**macOS:**

```bash
brew install --cask docker
```

### Podman (Rootless alternative)

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install podman podman-compose
```

**Fedora/RHEL:**

```bash
sudo dnf install podman podman-compose
```

**macOS:**

```bash
brew install podman podman-compose
podman machine init
podman machine start
```

## Troubleshooting

### Permission Denied

**Docker:**

```bash
sudo usermod -aG docker $USER
newgrp docker
```

**Podman:**

```bash
# Podman runs rootless by default, no special permissions needed
```

### Compose Not Available

If `docker compose` or `podman-compose` is not available, use the `--no-compose` flag:

```bash
./docker-init.sh empty --no-compose
```

This will use pure container commands instead of compose.

### Port Already in Use

Edit `docker-compose.yml` and change the port mapping:

```yaml
ports:
  - "8080:3000" # Use port 8080 instead of 3000
```

Or with pure commands:

```bash
docker run -d -p 8080:3000 ...
```

### Database Initialization Failed

```bash
# Check logs
docker compose logs omb-init
# or
docker logs omb-accounting

# Reinitialize
./docker-init.sh empty
```

### Health Check Failing

```bash
# Check if application is running
curl http://localhost:3000/api/health

# View application logs
docker compose logs omb-accounting
# or
docker logs -f omb-accounting
```

## Next Steps

After successful deployment:

1. ✅ Login with admin credentials
2. ✅ Change admin password
3. ✅ Configure your accounting settings
4. ✅ Add customers and create invoices
5. ✅ Set up regular backups

For detailed documentation, see [docs/DOCKER.md](docs/DOCKER.md)
