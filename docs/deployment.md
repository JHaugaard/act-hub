# Deployment Guide - Self-Hosted Proposal Tracker

## Overview

This guide covers deploying the Proposal Tracker to your own infrastructure with self-hosted Supabase.

---

## Prerequisites

- VPS or hosting account (Hostinger, DigitalOcean, etc.)
- Domain name (optional but recommended)
- Basic Linux/SSH knowledge
- Node.js 18+ installed on server

---

## Part 1: Self-Hosted Supabase Setup

### Option A: Docker (Recommended)

1. **Install Docker and Docker Compose** on your VPS

2. **Clone Supabase**
   ```bash
   git clone https://github.com/supabase/supabase
   cd supabase/docker
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Start Supabase**
   ```bash
   docker-compose up -d
   ```

5. **Access Supabase Studio**
   - URL: `http://your-server-ip:3000`
   - Create project and database

### Option B: Manual Installation

Follow Supabase self-hosting docs:
https://supabase.com/docs/guides/self-hosting

---

## Part 2: Database Migration

### 1. Export Schema from Lovable Supabase

Your existing Supabase migrations are in `supabase/migrations/`:
- Run these migrations on your self-hosted instance
- This creates all tables, RLS policies, and functions

```bash
# On your local machine
cd supabase
supabase db push --db-url "postgresql://[your-self-hosted-db-url]"
```

### 2. (Optional) Migrate Data from Lovable

If you want to keep existing production data:

```bash
# Export from Lovable
pg_dump [lovable-db-url] > lovable-export.sql

# Import to self-hosted
psql [self-hosted-db-url] < lovable-export.sql
```

---

## Part 3: Application Deployment

### Option A: Hostinger Shared Hosting

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Upload `dist/` folder** via FTP/cPanel

3. **Configure Environment**
   - Create `.env.production` on server
   - Set `VITE_USE_MOCK_DATA="false"`
   - Add self-hosted Supabase credentials

4. **Configure Domain**
   - Point domain to `dist/index.html`
   - Enable HTTPS

### Option B: VPS Deployment (Nginx + PM2)

1. **Install Requirements**
   ```bash
   # On VPS
   sudo apt update
   sudo apt install nginx nodejs npm
   sudo npm install -g pm2
   ```

2. **Clone Repository**
   ```bash
   cd /var/www
   git clone https://github.com/JHaugaard/act-hub.git
   cd act-hub
   git checkout main  # or production branch
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Configure Environment**
   ```bash
   nano .env
   ```

   ```bash
   # Production .env
   VITE_USE_MOCK_DATA="false"
   VITE_SUPABASE_URL="http://your-server-ip:8000"  # Your self-hosted Supabase URL
   VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
   ```

5. **Build Application**
   ```bash
   npm run build
   ```

6. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/act-hub
   ```

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       root /var/www/act-hub/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Enable gzip
       gzip on;
       gzip_types text/plain text/css application/json application/javascript;
   }
   ```

7. **Enable Site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/act-hub /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

8. **Enable HTTPS** (Let's Encrypt)
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## Part 4: Environment Configuration

### Production `.env` File

```bash
# Data Source
VITE_USE_MOCK_DATA="false"

# Self-Hosted Supabase Configuration
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_URL="https://your-supabase-domain.com"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
```

### Security Notes

- **Never commit `.env` to git** (already in `.gitignore`)
- Use strong database passwords
- Enable RLS policies in Supabase
- Configure CORS properly
- Use HTTPS in production

---

## Part 5: Continuous Deployment

### Simple Git-Based Deployment

1. **Create deployment script** on VPS:
   ```bash
   nano /var/www/deploy.sh
   ```

   ```bash
   #!/bin/bash
   cd /var/www/act-hub
   git pull origin main
   npm install
   npm run build
   sudo systemctl restart nginx
   echo "Deployment complete!"
   ```

2. **Make executable**
   ```bash
   chmod +x /var/www/deploy.sh
   ```

3. **Deploy updates**
   ```bash
   /var/www/deploy.sh
   ```

### GitHub Actions (Advanced)

Create `.github/workflows/deploy.yml` for automated deployments

---

## Part 6: Monitoring & Maintenance

### Application Logs

```bash
# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Database Backups

```bash
# Backup Supabase database
pg_dump [your-db-url] > backup-$(date +%Y%m%d).sql

# Automate with cron
crontab -e
```

```cron
# Daily backup at 2 AM
0 2 * * * pg_dump [your-db-url] > /backups/db-$(date +\%Y\%m\%d).sql
```

### Application Updates

```bash
# On VPS
cd /var/www/act-hub
git pull origin main
npm install
npm run build
sudo systemctl restart nginx
```

---

## Part 7: Migration Checklist

### Pre-Deployment

- [ ] Self-hosted Supabase running and accessible
- [ ] Database schema migrated
- [ ] Test connection to Supabase from VPS
- [ ] Domain DNS configured (if using)
- [ ] SSL certificate obtained

### Deployment

- [ ] Application built successfully
- [ ] Environment variables configured
- [ ] Nginx configured and running
- [ ] HTTPS enabled
- [ ] Test all features in production

### Post-Deployment

- [ ] Verify all CRUD operations work
- [ ] Test file uploads
- [ ] Check DB Distiller functionality
- [ ] Verify search and filtering
- [ ] Set up database backups
- [ ] Configure monitoring

---

## Troubleshooting

### Issue: Cannot connect to Supabase
**Check:**
- Supabase Docker containers running: `docker ps`
- Firewall allows port 8000: `sudo ufw allow 8000`
- URL in `.env` is correct

### Issue: Build fails
**Solution:**
```bash
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

### Issue: 404 errors on refresh
**Solution:** Ensure Nginx `try_files` directive is set correctly (see Nginx config above)

### Issue: File uploads fail
**Check:**
- Supabase Storage bucket created
- Bucket is public (or has correct policies)
- Storage URL is correct in `.env`

---

## Cost Estimate

### VPS Hosting
- **DigitalOcean Droplet:** $6-12/month (2GB RAM)
- **Hostinger VPS:** $4-10/month
- **Linode:** $5-10/month

### Domain
- ~$10-15/year (.com)

### SSL Certificate
- **Free** (Let's Encrypt)

**Total:** ~$5-15/month

---

## Resources

- **Supabase Self-Hosting:** https://supabase.com/docs/guides/self-hosting
- **Docker Documentation:** https://docs.docker.com
- **Nginx Documentation:** https://nginx.org/en/docs
- **Let's Encrypt:** https://letsencrypt.org

---

## Support

For deployment assistance:
1. Review this guide thoroughly
2. Check [Development Guide](development.md)
3. Consult technical documentation
4. Open GitHub issue if needed
