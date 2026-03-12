# omb-accounting Quick Start Guide

## One-Command Deployment

The initialization script automatically detects your container runtime (Docker or Podman) and configures everything for you.

```bash
# Initialize with empty database (admin user only)
./docker-init.sh empty

# OR initialize with sample data
./docker-init.sh seed
```

## Automatic Runtime Detection

The script will automatically:

1. ✅ Check if **Docker** is running → use `docker compose`
2. ✅ Check if **Podman** is running → use `podman-compose`
3. ❌ Neither found → show installation instructions

### Manual Override

If you want to specify the runtime:

```bash
# Force Docker
docker compose up

# Force Podman
podman-compose up
```

## Access the Application

**URL:** http://localhost:3000

**Default Credentials:**

- Email: `admin@omb.com`
- Password: `admin123`

⚠️ **Change password immediately after first login!**

## Common Commands

### View Logs

```bash
# Docker
docker compose logs -f

# Podman
podman-compose logs -f
```

### Stop Application

```bash
# Docker
docker compose down

# Podman
podman-compose down
```

### Restart

```bash
# Docker
docker compose restart

# Podman
podman-compose restart
```

### Reset Everything

```bash
# Docker
docker compose down -v

# Podman
podman-compose down -v
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

### Port Already in Use

Edit `docker-compose.yml` and change the port mapping:

```yaml
ports:
  - "8080:3000" # Use port 8080 instead of 3000
```

### Database Initialization Failed

```bash
# Check logs
docker compose logs omb-init
# or
podman-compose logs omb-init

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
podman-compose logs omb-accounting
```

## Next Steps

After successful deployment:

1. ✅ Login with admin credentials
2. ✅ Change admin password
3. ✅ Configure your accounting settings
4. ✅ Add customers and create invoices
5. ✅ Set up regular backups

For detailed documentation, see [docs/DOCKER.md](docs/DOCKER.md)
