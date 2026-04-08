# ☁️ Cloudflare Tunnel Setup

## What is Cloudflare Tunnel?

Cloudflare Tunnel (formerly Argo Tunnel) creates a secure connection between your server and Cloudflare's network without opening ports. It's free and provides HTTPS automatically!

**Benefits:**
- ✅ Free HTTPS/SSL
- ✅ No port forwarding needed
- ✅ DDoS protection
- ✅ Custom domain support
- ✅ More secure than exposing ports

---

## 📋 Prerequisites

1. Cloudflare account (free)
2. Domain name (optional, can use Cloudflare's free subdomain)
3. Application running (locally or on EC2)

---

## 🚀 Quick Setup

### Step 1: Install Cloudflared

**On macOS (Local):**
```bash
brew install cloudflare/cloudflare/cloudflared
```

**On Ubuntu/EC2:**
```bash
# Download
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb

# Install
sudo dpkg -i cloudflared-linux-amd64.deb

# Verify
cloudflared --version
```

---

### Step 2: Authenticate

```bash
cloudflared tunnel login
```

This opens a browser window. Login to Cloudflare and select your domain (or create a free one).

---

### Step 3: Create Tunnel

```bash
# Create tunnel
cloudflared tunnel create nova-pass-generator

# Note the Tunnel ID shown in output
```

This creates a tunnel and saves credentials to:
- macOS: `~/.cloudflared/`
- Linux: `~/.cloudflared/`

---

### Step 4: Configure Tunnel

Create config file:

```bash
# Create config directory
mkdir -p ~/.cloudflared

# Create config file
cat > ~/.cloudflared/config.yml << 'EOF'
tunnel: nova-pass-generator
credentials-file: /home/ubuntu/.cloudflared/TUNNEL_ID.json

ingress:
  # Route your domain to the application
  - hostname: nova.yourdomain.com
    service: http://localhost:80
  
  # Catch-all rule (required)
  - service: http_status:404
EOF
```

**Replace:**
- `TUNNEL_ID.json` with your actual tunnel ID
- `nova.yourdomain.com` with your domain
- `/home/ubuntu/` with your home directory path

**For macOS:**
```yaml
credentials-file: /Users/yourusername/.cloudflared/TUNNEL_ID.json
```

---

### Step 5: Create DNS Record

```bash
# Route your domain through the tunnel
cloudflared tunnel route dns nova-pass-generator nova.yourdomain.com
```

Or manually in Cloudflare Dashboard:
1. Go to DNS settings
2. Add CNAME record:
   - Name: `nova` (or `@` for root domain)
   - Target: `TUNNEL_ID.cfargotunnel.com`
   - Proxy: Enabled (orange cloud)

---

### Step 6: Start Tunnel

**Test run:**
```bash
cloudflared tunnel run nova-pass-generator
```

**Run in background:**
```bash
cloudflared tunnel run nova-pass-generator &
```

**Or install as service (recommended):**
```bash
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

---

## 🎯 Complete Setup Examples

### Example 1: Local Development (macOS)

```bash
# 1. Start your application
cd /path/to/nova-pass-generator
./start.sh

# 2. Install cloudflared
brew install cloudflare/cloudflare/cloudflared

# 3. Login
cloudflared tunnel login

# 4. Create tunnel
cloudflared tunnel create nova-local

# 5. Configure (note the tunnel ID from step 4)
cat > ~/.cloudflared/config.yml << 'EOF'
tunnel: nova-local
credentials-file: /Users/yourusername/.cloudflared/TUNNEL_ID.json

ingress:
  - hostname: nova-local.yourdomain.com
    service: http://localhost:5173
  - service: http_status:404
EOF

# 6. Route DNS
cloudflared tunnel route dns nova-local nova-local.yourdomain.com

# 7. Start tunnel
cloudflared tunnel run nova-local
```

**Access:** `https://nova-local.yourdomain.com`

---

### Example 2: EC2 Production

```bash
# 1. SSH/Connect to EC2
# AWS Console → EC2 → Connect → EC2 Instance Connect

# 2. Install cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# 3. Login (opens browser)
cloudflared tunnel login

# 4. Create tunnel
cloudflared tunnel create nova-production

# 5. Get tunnel ID from output, then configure
TUNNEL_ID="your-tunnel-id-here"

mkdir -p ~/.cloudflared
cat > ~/.cloudflared/config.yml << EOF
tunnel: nova-production
credentials-file: /home/ubuntu/.cloudflared/${TUNNEL_ID}.json

ingress:
  - hostname: nova.yourdomain.com
    service: http://localhost:80
  - service: http_status:404
EOF

# 6. Route DNS
cloudflared tunnel route dns nova-production nova.yourdomain.com

# 7. Install as service
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared

# 8. Check status
sudo systemctl status cloudflared
```

**Access:** `https://nova.yourdomain.com`

---

### Example 3: Without Custom Domain (Free Cloudflare Subdomain)

```bash
# 1. Create tunnel
cloudflared tunnel create nova-app

# 2. Configure with trycloudflare
cat > ~/.cloudflared/config.yml << 'EOF'
tunnel: nova-app
credentials-file: ~/.cloudflared/TUNNEL_ID.json

ingress:
  - service: http://localhost:80
EOF

# 3. Run tunnel
cloudflared tunnel run nova-app
```

**Or use quick tunnel (temporary):**
```bash
cloudflared tunnel --url http://localhost:80
```

This gives you a temporary URL like: `https://random-name.trycloudflare.com`

---

## 🔧 Configuration Options

### Multiple Services

```yaml
tunnel: nova-pass-generator
credentials-file: ~/.cloudflared/TUNNEL_ID.json

ingress:
  # Frontend
  - hostname: nova.yourdomain.com
    service: http://localhost:80
  
  # API directly
  - hostname: api.yourdomain.com
    service: http://localhost:8000
  
  # Catch-all
  - service: http_status:404
```

### With Path Routing

```yaml
tunnel: nova-pass-generator
credentials-file: ~/.cloudflared/TUNNEL_ID.json

ingress:
  - hostname: yourdomain.com
    path: /nova/*
    service: http://localhost:80
  
  - hostname: yourdomain.com
    service: http://localhost:3000
  
  - service: http_status:404
```

---

## 🔄 Update Frontend Configuration

After setting up tunnel, update frontend to use your domain:

```bash
# On your server
cd ~/nova-pass-generator/frontend

# Update .env
echo "VITE_API_URL=https://nova.yourdomain.com" > .env

# Rebuild
npm run build

# Reload nginx (if using)
sudo systemctl reload nginx
```

---

## 🛠️ Management Commands

### Check Tunnel Status
```bash
cloudflared tunnel info nova-pass-generator
```

### List Tunnels
```bash
cloudflared tunnel list
```

### View Logs
```bash
# If running as service
sudo journalctl -u cloudflared -f

# If running manually
# Logs appear in terminal
```

### Stop Tunnel
```bash
# If running as service
sudo systemctl stop cloudflared

# If running manually
# Press Ctrl+C
```

### Delete Tunnel
```bash
# Stop first
sudo systemctl stop cloudflared

# Delete
cloudflared tunnel delete nova-pass-generator
```

---

## 🔒 Security Features

### Automatic HTTPS
- SSL certificate automatically provisioned
- No need for Let's Encrypt or manual certificates

### Access Control
Add authentication in Cloudflare Dashboard:
1. Go to Zero Trust
2. Access → Applications
3. Add application
4. Configure authentication (email, Google, etc.)

### IP Restrictions
In Cloudflare Dashboard:
1. Go to Security → WAF
2. Create firewall rule
3. Restrict by country, IP, etc.

---

## 💰 Cost

**Free Tier Includes:**
- Unlimited bandwidth
- Unlimited tunnels
- DDoS protection
- SSL certificates
- Basic analytics

**Paid Features (optional):**
- Advanced DDoS protection
- Load balancing
- Access control (Zero Trust)

---

## 🐛 Troubleshooting

### Tunnel Won't Start

**Check config file:**
```bash
cat ~/.cloudflared/config.yml
```

**Verify credentials exist:**
```bash
ls -la ~/.cloudflared/
```

**Test connection:**
```bash
cloudflared tunnel run nova-pass-generator
```

### DNS Not Resolving

**Check DNS record:**
```bash
dig nova.yourdomain.com
```

Should show CNAME to `TUNNEL_ID.cfargotunnel.com`

**Wait for propagation:**
DNS changes can take 5-10 minutes.

### 502 Bad Gateway

**Check if application is running:**
```bash
curl http://localhost:80
```

**Check tunnel logs:**
```bash
sudo journalctl -u cloudflared -n 50
```

### Connection Refused

**Verify service in config:**
```yaml
service: http://localhost:80  # Must match your app port
```

**Check application is listening:**
```bash
sudo lsof -i :80
```

---

## 📊 Comparison: Cloudflare vs Direct EC2

| Feature | Cloudflare Tunnel | Direct EC2 |
|---------|------------------|------------|
| HTTPS | Free, automatic | Manual setup |
| DDoS Protection | Included | Need AWS Shield |
| Port Forwarding | Not needed | Required |
| Custom Domain | Easy | Need DNS setup |
| Security | Built-in WAF | Manual config |
| Cost | Free | EC2 costs only |

---

## ✅ Quick Reference

### Create and Start Tunnel
```bash
cloudflared tunnel login
cloudflared tunnel create nova-app
# Edit ~/.cloudflared/config.yml
cloudflared tunnel route dns nova-app nova.yourdomain.com
cloudflared tunnel run nova-app
```

### Install as Service
```bash
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

### Check Status
```bash
sudo systemctl status cloudflared
cloudflared tunnel list
```

### View Logs
```bash
sudo journalctl -u cloudflared -f
```

---

## 🎉 Benefits Summary

- ✅ Free HTTPS with automatic SSL
- ✅ No port forwarding or firewall rules
- ✅ DDoS protection included
- ✅ Works behind NAT/firewall
- ✅ Custom domain support
- ✅ Easy to set up and manage
- ✅ More secure than exposing ports
- ✅ Built-in analytics

---

**Cloudflare Tunnel is the recommended way to expose your application securely!** ☁️

Next: [NGROK_SETUP.md](NGROK_SETUP.md) for ngrok alternative
