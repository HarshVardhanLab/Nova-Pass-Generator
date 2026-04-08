# 🌐 ngrok Setup

## What is ngrok?

ngrok creates secure tunnels to your localhost, making your local application accessible from the internet. Perfect for testing, demos, and webhooks!

**Benefits:**
- ✅ Super easy setup (one command!)
- ✅ Free tier available
- ✅ HTTPS included
- ✅ No configuration needed
- ✅ Great for development/testing

---

## 📋 Prerequisites

1. ngrok account (free)
2. Application running locally or on EC2

---

## 🚀 Quick Setup

### Step 1: Install ngrok

**On macOS:**
```bash
brew install ngrok/ngrok/ngrok
```

**On Ubuntu/EC2:**
```bash
# Download
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | \
  sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && \
  echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | \
  sudo tee /etc/apt/sources.list.d/ngrok.list && \
  sudo apt update && sudo apt install ngrok

# Or using snap
sudo snap install ngrok
```

**Manual Download:**
```bash
# Download
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz

# Extract
tar -xvzf ngrok-v3-stable-linux-amd64.tgz

# Move to PATH
sudo mv ngrok /usr/local/bin/
```

---

### Step 2: Sign Up and Get Auth Token

1. Go to https://dashboard.ngrok.com/signup
2. Sign up (free)
3. Get your auth token from: https://dashboard.ngrok.com/get-started/your-authtoken

---

### Step 3: Add Auth Token

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

---

### Step 4: Start Tunnel

**For local development (port 5173):**
```bash
ngrok http 5173
```

**For production (port 80):**
```bash
ngrok http 80
```

**For backend only (port 8000):**
```bash
ngrok http 8000
```

---

## 🎯 Complete Setup Examples

### Example 1: Local Development (macOS)

```bash
# 1. Start your application
cd /path/to/nova-pass-generator
./start.sh

# 2. Install ngrok
brew install ngrok/ngrok/ngrok

# 3. Add auth token
ngrok config add-authtoken YOUR_AUTH_TOKEN

# 4. Start tunnel (in new terminal)
ngrok http 5173
```

**Output:**
```
ngrok

Session Status                online
Account                       your@email.com
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok.io -> http://localhost:5173

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Access:** `https://abc123.ngrok.io`

---

### Example 2: EC2 Production

```bash
# 1. Connect to EC2
# AWS Console → EC2 → Connect → EC2 Instance Connect

# 2. Install ngrok
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | \
  sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | \
  sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update
sudo apt install ngrok

# 3. Add auth token
ngrok config add-authtoken YOUR_AUTH_TOKEN

# 4. Start tunnel
ngrok http 80
```

**Access:** `https://xyz789.ngrok.io`

---

### Example 3: Custom Domain (Paid)

```bash
# Start with custom domain
ngrok http 80 --domain=nova.yourdomain.com
```

**Requires:** ngrok paid plan ($8/month)

---

### Example 4: Run in Background

```bash
# Start in background
nohup ngrok http 80 > ngrok.log 2>&1 &

# View URL
curl http://localhost:4040/api/tunnels | jq '.tunnels[0].public_url'

# Or check log
cat ngrok.log
```

---

## 🔧 Advanced Configuration

### Create Config File

```bash
# Edit config
ngrok config edit
```

Add configuration:

```yaml
version: "2"
authtoken: YOUR_AUTH_TOKEN

tunnels:
  nova-frontend:
    proto: http
    addr: 5173
    
  nova-backend:
    proto: http
    addr: 8000
    
  nova-production:
    proto: http
    addr: 80
    subdomain: nova-app  # Requires paid plan
```

### Start Multiple Tunnels

```bash
# Start all tunnels
ngrok start --all

# Start specific tunnel
ngrok start nova-frontend

# Start multiple specific tunnels
ngrok start nova-frontend nova-backend
```

---

## 🔄 Update Frontend Configuration

After starting ngrok, update frontend:

```bash
# Get ngrok URL (e.g., https://abc123.ngrok.io)
NGROK_URL="https://abc123.ngrok.io"

# Update frontend .env
cd ~/nova-pass-generator/frontend
echo "VITE_API_URL=$NGROK_URL" > .env

# Rebuild
npm run build

# Reload nginx (if using)
sudo systemctl reload nginx
```

---

## 🛠️ Management Commands

### View Active Tunnels

**Web Interface:**
Open browser: `http://localhost:4040`

**API:**
```bash
curl http://localhost:4040/api/tunnels
```

**Get Public URL:**
```bash
curl http://localhost:4040/api/tunnels | jq '.tunnels[0].public_url'
```

### Stop Tunnel

```bash
# If running in foreground
# Press Ctrl+C

# If running in background
pkill ngrok
```

### View Logs

```bash
# If started with nohup
tail -f ngrok.log

# Web interface shows live logs
# Open: http://localhost:4040
```

---

## 🎨 ngrok Features

### Web Interface (Inspector)

Access: `http://localhost:4040`

Features:
- View all requests/responses
- Replay requests
- See request details
- Debug webhooks

### Request Inspection

```bash
# View request details
curl http://localhost:4040/api/requests/http
```

### Replay Requests

In web interface:
1. Click on a request
2. Click "Replay"
3. Modify if needed
4. Send

---

## 💰 Pricing

### Free Tier
- ✅ 1 online ngrok process
- ✅ 4 tunnels per process
- ✅ 40 connections/minute
- ✅ Random URLs
- ✅ HTTPS included

**Limitations:**
- ❌ No custom domains
- ❌ URLs change on restart
- ❌ Session timeout (2 hours)

### Personal ($8/month)
- ✅ 3 online processes
- ✅ Custom domains
- ✅ Reserved domains
- ✅ No session timeout
- ✅ 120 connections/minute

### Pro ($20/month)
- ✅ 10 online processes
- ✅ IP whitelisting
- ✅ More custom domains
- ✅ 600 connections/minute

---

## 🔒 Security Options

### Basic Auth

```bash
ngrok http 80 --basic-auth="username:password"
```

### IP Restrictions

```bash
ngrok http 80 --cidr-allow="1.2.3.4/32"
```

### OAuth (Paid)

```bash
ngrok http 80 --oauth=google --oauth-allow-email="user@domain.com"
```

---

## 🐛 Troubleshooting

### "ERR_NGROK_108"

**Error:** Account limit reached

**Solution:**
- Free tier: Only 1 tunnel at a time
- Stop other ngrok processes
- Upgrade to paid plan

### "ERR_NGROK_105"

**Error:** Invalid auth token

**Solution:**
```bash
ngrok config add-authtoken YOUR_CORRECT_TOKEN
```

### Tunnel Not Accessible

**Check if ngrok is running:**
```bash
ps aux | grep ngrok
```

**Check web interface:**
```bash
curl http://localhost:4040/api/tunnels
```

**Verify application is running:**
```bash
curl http://localhost:80
```

### URL Changes on Restart

**Problem:** Free tier gives random URLs

**Solutions:**
1. Use paid plan for reserved domains
2. Use Cloudflare Tunnel instead (free custom domains)
3. Update frontend .env after each restart

---

## 📊 Comparison: ngrok vs Cloudflare Tunnel

| Feature | ngrok Free | ngrok Paid | Cloudflare Tunnel |
|---------|-----------|------------|-------------------|
| Cost | Free | $8-20/mo | Free |
| Custom Domain | ❌ | ✅ | ✅ |
| HTTPS | ✅ | ✅ | ✅ |
| Session Timeout | 2 hours | None | None |
| URL Stability | Random | Fixed | Fixed |
| DDoS Protection | Basic | Basic | Advanced |
| Best For | Testing | Development | Production |

---

## 🎯 Use Cases

### ngrok is Great For:

✅ **Quick Testing**
```bash
ngrok http 5173
```

✅ **Webhook Development**
- Test webhooks locally
- Debug webhook payloads

✅ **Demos**
- Show work to clients
- Share with team

✅ **Mobile Testing**
- Test on real devices
- Access from phone

### Cloudflare Tunnel is Better For:

✅ **Production**
✅ **Long-term hosting**
✅ **Custom domains (free)**
✅ **Better security**

---

## 🚀 Quick Start Scripts

### Start Script

Create `start-ngrok.sh`:

```bash
#!/bin/bash

# Start application
cd ~/nova-pass-generator
./start.sh &

# Wait for app to start
sleep 5

# Start ngrok
ngrok http 5173 > ngrok.log 2>&1 &

# Wait for ngrok
sleep 3

# Get URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url')

echo "Application available at: $NGROK_URL"
```

### Stop Script

Create `stop-ngrok.sh`:

```bash
#!/bin/bash

# Stop ngrok
pkill ngrok

# Stop application
./stop.sh

echo "Stopped"
```

---

## ✅ Quick Reference

### Install and Setup
```bash
# Install
brew install ngrok/ngrok/ngrok  # macOS
sudo apt install ngrok          # Ubuntu

# Add token
ngrok config add-authtoken YOUR_TOKEN

# Start tunnel
ngrok http 80
```

### Common Commands
```bash
# Start tunnel
ngrok http 5173

# With custom subdomain (paid)
ngrok http 80 --subdomain=nova-app

# With auth
ngrok http 80 --basic-auth="user:pass"

# View tunnels
curl http://localhost:4040/api/tunnels

# Stop
pkill ngrok
```

### Web Interface
```
http://localhost:4040
```

---

## 🎉 Summary

### Pros
- ✅ Super easy setup (one command)
- ✅ Great for development/testing
- ✅ Built-in request inspector
- ✅ HTTPS included
- ✅ No configuration needed

### Cons
- ❌ Free tier has limitations
- ❌ URLs change on restart (free)
- ❌ Session timeout (free)
- ❌ Costs money for production use

### Recommendation

**For Development/Testing:** Use ngrok ⭐
**For Production:** Use Cloudflare Tunnel ⭐⭐⭐

---

**ngrok is perfect for quick testing and development!** 🌐

See also: [CLOUDFLARE_TUNNEL.md](CLOUDFLARE_TUNNEL.md) for production setup
