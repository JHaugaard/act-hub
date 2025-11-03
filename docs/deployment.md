# Deployment Guide - PocketBase VPS Architecture

## Overview

This guide covers deploying the Proposal Tracker to a VPS (Virtual Private Server) with PocketBase running in a Docker container. The architecture uses Docker for PocketBase and Nginx to serve the React frontend and reverse proxy to the backend.

**Architecture:** VPS with Docker + Nginx + PocketBase

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                         VPS                             │
│                                                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │                   Nginx (Ports 80/443)             │ │
│  │  ┌──────────────────┐  ┌──────────────────────┐    │ │
│  │  │  Static React    │  │  Reverse Proxy       │    │ │
│  │  │  Files (dist/)   │  │  /api → :8090        │    │ │
│  │  └──────────────────┘  └──────────────────────┘    │ │
│  └────────────┬───────────────────┬───────────────────┘ │
│               │                   │                     │
│  ┌────────────▼───────────────────▼───────────────────┐ │
│  │         Docker Container: PocketBase               │ │
│  │         - Port 8090: API                           │ │
│  │         - Port 8091: Admin UI                      │ │
│  │         - Volume: /var/lib/pocketbase-data         │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Persistent Data: /var/lib/pocketbase-data/        │ │
│  │  - pb.db (SQLite database)                         │ │
│  │  - pb_public/ (uploaded files)                     │ │
│  │  - migrations/                                     │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Key Points:**
- **PocketBase runs in Docker** - Isolated, easy to manage, reproducible
- **Data persists on VPS** - Survives container restarts
- **Nginx handles all public traffic** - SSL, static files, reverse proxy
- **Only ports 80/443 exposed** - PocketBase ports are internal only

---

## Prerequisites

- VPS with root access (Hostinger VPS, DigitalOcean, Linode, etc.)
  - Minimum: 2GB RAM, 1 CPU, 20GB storage
  - Recommended: 4GB RAM, 2 CPU, 40GB storage
- Domain name pointed to VPS IP
- Basic Linux/SSH knowledge
- Local development environment with Phase 1 completed

---

## Phase 2: VPS Preparation

### Step 1: Initial VPS Setup

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Update system packages
apt update && apt upgrade -y

# Create non-root user for security
adduser deployer
usermod -aG sudo deployer

# Set up SSH key authentication (recommended)
mkdir -p /home/deployer/.ssh
cp ~/.ssh/authorized_keys /home/deployer/.ssh/
chown -R deployer:deployer /home/deployer/.ssh
chmod 700 /home/deployer/.ssh
chmod 600 /home/deployer/.ssh/authorized_keys

# Switch to deployer user
su - deployer
```

### Step 2: Install Docker and Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group (no sudo needed for docker commands)
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Verify installations
docker --version
docker compose version

# Log out and back in for group changes to take effect
exit
ssh deployer@your-vps-ip
```

### Step 3: Install Nginx

```bash
# Install Nginx
sudo apt install nginx -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify Nginx is running
sudo systemctl status nginx

# Test: Visit http://your-vps-ip in browser
# You should see the Nginx welcome page
```

### Step 4: Configure Firewall

```bash
# Install UFW (Uncomplicated Firewall)
sudo apt install ufw -y

# Allow SSH (important - don't lock yourself out!)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Verify status
sudo ufw status
```

---

## Phase 3: Deploy PocketBase and Application

### Step 1: Prepare Deployment Directory

```bash
# Create application directory
sudo mkdir -p /var/www/act-hub
sudo chown deployer:deployer /var/www/act-hub

# Create PocketBase data directory
sudo mkdir -p /var/lib/pocketbase-data
sudo chown deployer:deployer /var/lib/pocketbase-data

# Navigate to app directory
cd /var/www/act-hub
```

### Step 2: Clone Repository

```bash
# Clone your repository
git clone https://github.com/YOUR_USERNAME/act-hub.git .

# Checkout the main branch
git checkout main

# Verify files are present
ls -la
```

### Step 3: Create Production Docker Compose File

Create `docker-compose.prod.yml`:

```bash
nano docker-compose.prod.yml
```

```yaml
services:
  pocketbase:
    build:
      context: .
      dockerfile: Dockerfile.pocketbase
    container_name: act_hub_pocketbase_prod
    ports:
      - "127.0.0.1:8090:8090"  # API - only accessible from localhost
      - "127.0.0.1:8091:8091"  # Admin UI - only accessible from localhost
    volumes:
      # Persist data to VPS directory
      - /var/lib/pocketbase-data:/pb_data
    environment:
      - POCKETBASE_SUPERUSER_EMAIL=admin@yourdomain.com
      - POCKETBASE_SUPERUSER_PASSWORD=${POCKETBASE_ADMIN_PASSWORD}
    command: ["/usr/local/bin/pocketbase", "serve", "--http=0.0.0.0:8090", "--migrationsDir=/pb_data/migrations"]
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8090/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

**Key Differences from Local:**
- Ports bound to `127.0.0.1` (not accessible from outside)
- Production admin credentials from environment variables
- Data volume points to `/var/lib/pocketbase-data`
- More robust healthcheck settings

### Step 4: Create Environment File

```bash
# Create production .env file
nano .env.production
```

```bash
# PocketBase Admin Credentials
POCKETBASE_ADMIN_PASSWORD=your-secure-password-here

# Application Environment Variables (for build)
VITE_DATA_SOURCE="pocketbase"
VITE_POCKETBASE_URL="https://yourdomain.com/api"
```

**Security Notes:**
- Use a strong password for `POCKETBASE_ADMIN_PASSWORD`
- Never commit this file to git (already in `.gitignore`)
- Keep this file secure (`chmod 600 .env.production`)

```bash
chmod 600 .env.production
```

### Step 5: Start PocketBase Container

```bash
# Load environment variables
export $(cat .env.production | xargs)

# Build and start PocketBase
docker compose -f docker-compose.prod.yml up -d

# Verify container is running
docker ps

# Check logs
docker compose -f docker-compose.prod.yml logs -f pocketbase

# Test PocketBase locally
curl http://localhost:8090/api/health
# Should return: {"code":200,"message":"..."}
```

### Step 6: Create PocketBase Schema

```bash
# Update PocketBase URL in script for local access
export VITE_POCKETBASE_URL="http://localhost:8090"

# Run schema creation script
node scripts/setup-pocketbase-schema.js

# You should see:
# ✅ PIs collection created
# ✅ Sponsors collection created
# ✅ Files collection created
# ✅ File Attachments collection created
```

### Step 7: Import Production Data

**Option A: Import from CSV (Recommended)**

If you have CSV exports from your production Supabase:

```bash
# Ensure CSV files are in data-for-importing/ directory
ls -la data-for-importing/

# Run CSV import
node scripts/import-csv-to-pocketbase.js

# Output shows import progress
# ✅ Imported X PIs
# ✅ Imported X Sponsors
# ✅ Imported X Files
```

**Option B: Transfer from Local Development**

If your local PocketBase has the data you want:

```bash
# On your local machine:
# Copy the SQLite database file to VPS
scp /Volumes/dev/develop/act-hub/pocketbase-data/pb.db \
    deployer@your-vps-ip:/tmp/pb.db

# On VPS:
# Stop PocketBase container
docker compose -f docker-compose.prod.yml down

# Replace database
sudo cp /tmp/pb.db /var/lib/pocketbase-data/pb.db
sudo chown deployer:deployer /var/lib/pocketbase-data/pb.db

# Restart PocketBase
docker compose -f docker-compose.prod.yml up -d

# Clean up
rm /tmp/pb.db
```

### Step 8: Build React Application

```bash
# Install Node.js if not present
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version

# Install dependencies
npm install

# Build production version
npm run build

# Verify dist/ directory was created
ls -la dist/
```

### Step 9: Configure Nginx for Production

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/act-hub
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect to HTTPS (will be configured by Certbot)
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Root directory for React app
    root /var/www/act-hub/dist;
    index index.html;

    # Serve static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Reverse proxy to PocketBase API
    location /api/ {
        proxy_pass http://127.0.0.1:8090/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Increase timeouts for large file uploads
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
        send_timeout 600;
    }

    # Optional: Reverse proxy to PocketBase Admin UI (secure this!)
    location /_/ {
        # Restrict access by IP (optional but recommended)
        # allow YOUR_HOME_IP;
        # deny all;

        proxy_pass http://127.0.0.1:8091/_;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/json application/javascript;

    # Client max body size (for file uploads)
    client_max_body_size 50M;
}
```

**Important Configuration Notes:**
- Replace `yourdomain.com` with your actual domain
- The `/api/` location proxies to PocketBase on port 8090
- The `/_/` location exposes PocketBase Admin UI (optional, consider IP restrictions)
- SSL certificate lines are commented - Certbot will add them

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/act-hub /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

### Step 10: Enable HTTPS with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate (interactive)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (recommended)

# Certbot will automatically:
# - Obtain certificate
# - Update Nginx config
# - Set up auto-renewal

# Test auto-renewal
sudo certbot renew --dry-run
```

### Step 11: Verify Deployment

```bash
# Check all services are running
docker ps
sudo systemctl status nginx

# Test PocketBase API locally
curl http://localhost:8090/api/health

# Test PocketBase API via Nginx
curl https://yourdomain.com/api/health

# Visit application
# https://yourdomain.com
```

**Test Checklist:**
- [ ] Homepage loads (https://yourdomain.com)
- [ ] Can view proposals list
- [ ] Can view proposal details
- [ ] Can create new proposal
- [ ] Can update proposal status
- [ ] Can upload file attachments
- [ ] Can view PIs and Sponsors
- [ ] DB Distiller works
- [ ] Admin UI accessible (https://yourdomain.com/_/)

---

## Phase 4: Ongoing Management

### Deployment Script

Create a deployment script for easy updates:

```bash
# Create deployment script
nano /var/www/act-hub/deploy.sh
```

```bash
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Navigate to app directory
cd /var/www/act-hub

# Pull latest changes
echo "📥 Pulling latest code..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build application
echo "🔨 Building application..."
export $(cat .env.production | xargs)
npm run build

# Reload Nginx
echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx

echo "✅ Deployment complete!"
echo "Visit: https://yourdomain.com"
```

```bash
# Make executable
chmod +x /var/www/act-hub/deploy.sh

# Deploy updates in future
./deploy.sh
```

### Database Backups

Set up automated daily backups:

```bash
# Create backup directory
sudo mkdir -p /var/backups/pocketbase
sudo chown deployer:deployer /var/backups/pocketbase

# Create backup script
nano /var/www/act-hub/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/pocketbase"
DATA_DIR="/var/lib/pocketbase-data"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/pb_backup_$TIMESTAMP.tar.gz"

# Stop PocketBase temporarily (optional - for consistent backup)
# docker compose -f /var/www/act-hub/docker-compose.prod.yml stop pocketbase

# Create compressed backup
tar -czf "$BACKUP_FILE" -C "$DATA_DIR" .

# Restart PocketBase (if stopped)
# docker compose -f /var/www/act-hub/docker-compose.prod.yml start pocketbase

# Keep only last 14 days of backups
find "$BACKUP_DIR" -name "pb_backup_*.tar.gz" -mtime +14 -delete

echo "✅ Backup created: $BACKUP_FILE"
```

```bash
# Make executable
chmod +x /var/www/act-hub/backup.sh

# Test backup
./backup.sh

# Set up daily cron job
crontab -e
```

Add this line to crontab:
```cron
# Daily backup at 2:00 AM
0 2 * * * /var/www/act-hub/backup.sh >> /var/log/pocketbase-backup.log 2>&1
```

### Restore from Backup

```bash
# Stop PocketBase
docker compose -f docker-compose.prod.yml down

# Backup current data (just in case)
sudo mv /var/lib/pocketbase-data /var/lib/pocketbase-data.old

# Create new data directory
sudo mkdir -p /var/lib/pocketbase-data

# Extract backup
sudo tar -xzf /var/backups/pocketbase/pb_backup_TIMESTAMP.tar.gz -C /var/lib/pocketbase-data

# Fix permissions
sudo chown -R deployer:deployer /var/lib/pocketbase-data

# Restart PocketBase
docker compose -f docker-compose.prod.yml up -d

# Verify
docker compose -f docker-compose.prod.yml logs -f pocketbase
```

### Monitor Logs

```bash
# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# PocketBase logs
docker compose -f docker-compose.prod.yml logs -f pocketbase

# System resource usage
htop  # or: top
```

### Update PocketBase

```bash
# Pull latest image/rebuild
cd /var/www/act-hub
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d

# Verify
docker compose -f docker-compose.prod.yml logs -f pocketbase
```

---

## Security Hardening

### 1. Secure PocketBase Admin UI

**Option A: IP Restriction (Recommended)**

Edit `/etc/nginx/sites-available/act-hub`:

```nginx
location /_/ {
    # Only allow access from specific IPs
    allow 1.2.3.4;        # Your home IP
    allow 5.6.7.8;        # Your office IP
    deny all;

    proxy_pass http://127.0.0.1:8091/_;
    # ... rest of proxy config
}
```

**Option B: Remove Public Access**

Comment out or remove the `location /_/` block entirely. Access admin UI via SSH tunnel:

```bash
# On your local machine:
ssh -L 8091:localhost:8091 deployer@your-vps-ip

# Then visit in browser: http://localhost:8091/_/
```

### 2. Enable Fail2Ban

```bash
# Install Fail2Ban
sudo apt install fail2ban -y

# Configure for Nginx
sudo nano /etc/fail2ban/jail.local
```

```ini
[nginx-http-auth]
enabled = true

[nginx-noscript]
enabled = true

[nginx-badbots]
enabled = true

[nginx-noproxy]
enabled = true
```

```bash
# Restart Fail2Ban
sudo systemctl restart fail2ban

# Check status
sudo fail2ban-client status
```

### 3. Regular Updates

```bash
# Set up automatic security updates
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades

# Manual updates
sudo apt update && sudo apt upgrade -y
```

### 4. Secure SSH

Edit SSH config:

```bash
sudo nano /etc/ssh/sshd_config
```

```ini
# Disable root login
PermitRootLogin no

# Use SSH keys only (disable password auth)
PasswordAuthentication no

# Change default port (optional)
Port 2222
```

```bash
# Restart SSH
sudo systemctl restart sshd

# Update firewall if port changed
sudo ufw allow 2222/tcp
sudo ufw delete allow 22/tcp
```

---

## Troubleshooting

### Issue: PocketBase Container Not Starting

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs pocketbase

# Check if port is already in use
sudo netstat -tulpn | grep 8090

# Rebuild container
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

### Issue: Cannot Access Application

```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test Nginx config
sudo nginx -t

# Verify DNS is pointing to VPS
nslookup yourdomain.com

# Check firewall
sudo ufw status
```

### Issue: API Requests Failing

```bash
# Test PocketBase locally
curl http://localhost:8090/api/health

# Test via Nginx
curl https://yourdomain.com/api/health

# Check proxy configuration in Nginx
sudo nginx -t
sudo systemctl reload nginx
```

### Issue: File Uploads Failing

```bash
# Check Nginx client_max_body_size setting
sudo grep -r "client_max_body_size" /etc/nginx/

# Increase if needed (in server block)
client_max_body_size 50M;

# Reload Nginx
sudo systemctl reload nginx
```

### Issue: SSL Certificate Problems

```bash
# Check certificate status
sudo certbot certificates

# Renew manually
sudo certbot renew

# Check auto-renewal timer
sudo systemctl status certbot.timer
```

---

## Cost Estimate

### VPS Hosting Options

| Provider | Plan | Price/Month | Specs |
|----------|------|-------------|-------|
| Hostinger VPS | KVM 2 | $8-12 | 2GB RAM, 2 CPU, 50GB SSD |
| DigitalOcean | Basic Droplet | $12 | 2GB RAM, 1 CPU, 50GB SSD |
| Linode | Nanode | $5-10 | 1-2GB RAM, 1 CPU, 25-50GB SSD |
| Vultr | Cloud Compute | $6-12 | 1-2GB RAM, 1 CPU, 32-55GB SSD |

**Recommended:** 2GB RAM minimum for comfortable operation

### Additional Costs

- **Domain name:** $10-15/year (.com)
- **SSL certificate:** Free (Let's Encrypt)
- **Backups (optional):** $1-5/month (depends on provider)

**Total:** ~$8-15/month + domain

---

## Migration Checklist

### Pre-Deployment
- [ ] VPS provisioned and accessible via SSH
- [ ] Domain DNS A record pointing to VPS IP
- [ ] Local development Phase 1 completed and tested
- [ ] Production data exported (CSV or database file)
- [ ] Secure passwords generated for production

### Deployment
- [ ] Docker and Docker Compose installed
- [ ] Nginx installed and configured
- [ ] Firewall configured (UFW)
- [ ] PocketBase container running
- [ ] Database schema created
- [ ] Production data imported
- [ ] React app built and deployed
- [ ] Nginx configured with reverse proxy
- [ ] SSL certificate obtained and installed

### Post-Deployment
- [ ] Application accessible via HTTPS
- [ ] All features tested in production
- [ ] Backup script configured and tested
- [ ] Monitoring set up
- [ ] Security hardening completed
- [ ] Documentation updated with production URLs

---

## Quick Reference Commands

```bash
# Start PocketBase
docker compose -f docker-compose.prod.yml up -d

# Stop PocketBase
docker compose -f docker-compose.prod.yml down

# View PocketBase logs
docker compose -f docker-compose.prod.yml logs -f pocketbase

# Restart PocketBase
docker compose -f docker-compose.prod.yml restart pocketbase

# Deploy application updates
./deploy.sh

# Backup database
./backup.sh

# Reload Nginx
sudo systemctl reload nginx

# Check Nginx status
sudo systemctl status nginx

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Renew SSL certificate
sudo certbot renew

# Check disk space
df -h

# Check memory usage
free -m

# Check running containers
docker ps
```

---

## Next Steps After Deployment

1. **Monitor for 24-48 hours** - Watch logs, check performance
2. **Set up external backups** - Consider cloud storage (S3, Backblaze B2)
3. **Configure uptime monitoring** - UptimeRobot, Pingdom, or StatusCake
4. **Document production procedures** - For your team
5. **Plan maintenance windows** - For updates and backups
6. **Set up alerts** - Disk space, memory, CPU usage

---

## Support Resources

- **PocketBase Documentation:** https://pocketbase.io/docs
- **Docker Documentation:** https://docs.docker.com
- **Nginx Documentation:** https://nginx.org/en/docs
- **Let's Encrypt:** https://letsencrypt.org/docs
- **DigitalOcean Tutorials:** https://www.digitalocean.com/community/tutorials

---

## You've Got This! 🚀

This deployment guide takes you from a fresh VPS to a fully functional production application. Take it step by step, test thoroughly, and don't hesitate to reference the troubleshooting section.

**Deployment Timeline:**
- Phase 2 (VPS prep): ~1-2 hours
- Phase 3 (Deployment): ~2-3 hours
- Phase 4 (Hardening): ~1 hour

**Total:** ~4-6 hours for complete setup
