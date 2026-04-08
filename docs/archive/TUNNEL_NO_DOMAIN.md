# 🚀 Tunnel Setup WITHOUT Custom Domain

## No Domain? No Problem!

Both ngrok and Cloudflare Tunnel provide FREE URLs without needing your own domain.

---

## ⚡ Option 1: ngrok (Easiest!)

### Setup (1 minute)

```bash
# 1. Install ngrok
# macOS:
brew install ngrok

# Ubuntu/EC2:
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | \
  sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | \
  sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok

# 2. Sign up and get token
# Go to: https://dashboard.ngrok.com/signup
# Get token from: https://dashboard.ngrok.com/get-started/your-authtoken

# 3. Add token
ngrok config add-authtoken YOUR_AUTH_TOKEN

# 4. Start tunnel
ngrok http 5173  # for local dev
# OR
ngrok http 80    # for EC2
```

### You Get a Free URL!

```
Forwarding: https://abc123xyz.ngrok.io -> http://localhost:5173
```

**Access your app at:** `https://abc123xyz.ngrok.io`

### Update Frontend

```bash
# Get the ngrok URL from terminal output
# Then update frontend:

cd ~/nova-pass-generator/frontend
echo "VITE_API_URL=https://abc123xyz.ngrok.io" > .env
npm run build
sudo systemctl reload nginx  # if on EC2
```

---

## ☁️ Option 2: Cloudflare Quick Tunnel (Free!)

### Temporary URL (No Account Needed!)

```bash
# Install cloudflared
# macOS:
brew install cloudflared

# Ubuntu/EC2:
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Start quick tunnel (no login required!)
cloudflared tunnel --url http://localhost:80
```

### You Get a Free URL!

```
Your quick Tunnel has been created! Visit it at:
https://random-words-123.trycloudflare.com
```

**Access your app at:** `https://random-words-123.trycloudflare.com`

**Note:** URL changes each time you restart. Good for quick testing!

---

## ☁️ Option 3: Cloudflare Tunnel with Free Subdomain

### Permanent Free URL (Requires Cloudflare Account)

```bash
# 1. Install cloudflared (same as above)

# 2. Login to Cloudflare (free account)
cloudflared tunnel login

# 3. Create tunnel
cloudflared tunnel create nova-app

# 4. Configure
mkdir -p ~/.cloudflared

# Get tunnel ID from step 3 output
TUNNEL_ID="your-tunnel-id"

cat > ~/.cloudflared/config.yml << EOF
tunnel: nova-app
credentials-file: ~/.cloudflared/${TUNNEL_ID}.json

ingress:
  - service: http://localhost:80
EOF

# 5. Start tunnel
cloudflared tunnel run nova-app
```

### You Get a Permanent URL!

```
https://TUNNEL_ID.cfargotunnel.com
```

This URL stays the same every time!

---

## 📊 Comparison

| Feature | ngrok Free | Cloudflare Quick | Cloudflare Tunnel |
|---------|-----------|------------------|-------------------|
| **Setup Time** | 1 min | 30 sec | 5 min |
| **Account Required** | Yes (free) | No | Yes (free) |
| **URL Stability** | Changes on restart | Changes on restart | Permanent |
| **Session Timeout** | 2 hours | None | None |
| **HTTPS** | ✅ | ✅ | ✅ |
| **Best For** | Development | Quick test | Production |

---

## 🎯 Recommended Setup

### For Quick Testing (Right Now!)

**Use Cloudflare Quick Tunnel:**
```bash
cloudflared tunnel --url http://localhost:80
```

No account, no config, instant URL! ⚡

---

### For Development (Few Days/Weeks)

**Use ngrok:**
```bash
ngrok http 80
```

Better web interface, request inspector, stable during session.

---

### For Production (Long Term)

**Use Cloudflare Tunnel with Account:**
```bash
cloudflared tunnel create nova-app
cloudflared tunnel run nova-app
```

Permanent URL, no timeouts, runs 24/7.

---

## 🚀 Complete Setup Examples

### Example 1: Local Development (Mac)

```bash
# Start your app
cd /path/to/nova-pass-generator
./start.sh

# In new terminal, start ngrok
ngrok http 5173

# You'll see:
# Forwarding: https://abc123.ngrok.io -> http://localhost:5173

# Share the URL!
```

---

### Example 2: EC2 Quick Test

```bash
# Connect to EC2 via Instance Connect

# Install cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Start quick tunnel
cloudflared tunnel --url http://localhost:80

# You'll see:
# https://random-words.trycloudflare.com

# Access your app at that URL!
```

---

### Example 3: EC2 Production (Permanent URL)

```bash
# Connect to EC2

# Install cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Login (opens browser)
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create nova-production

# Note the Tunnel ID from output
TUNNEL_ID="abc123-def456-ghi789"

# Configure
mkdir -p ~/.cloudflared
cat > ~/.cloudflared/config.yml << EOF
tunnel: nova-production
credentials-file: /home/ubuntu/.cloudflared/${TUNNEL_ID}.json

ingress:
  - service: http://localhost:80
EOF

# Install as service (runs forever)
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared

# Your permanent URL:
# https://abc123-def456-ghi789.cfargotunnel.com
```

---

## 🔄 Update Frontend for Tunnel URL

After starting tunnel, update your frontend:

```bash
# Get your tunnel URL (e.g., https://abc123.ngrok.io)
TUNNEL_URL="https://your-tunnel-url-here"

# Update frontend
cd ~/nova-pass-generator/frontend
echo "VITE_API_URL=$TUNNEL_URL" > .env

# Rebuild
npm run build

# Reload nginx (if on EC2)
sudo systemctl reload nginx
```

---

## 💡 Pro Tips

### ngrok Tips

**Save URL between restarts (paid):**
```bash
# Requires ngrok paid plan ($8/mo)
ngrok http 80 --subdomain=nova-app
# Always get: https://nova-app.ngrok.io
```

**View all requests:**
```
Open: http://localhost:4040
```

---

### Cloudflare Tips

**Get your permanent URL:**
```bash
# After creating tunnel
cloudflared tunnel info nova-app

# Shows: https://TUNNEL_ID.cfargotunnel.com
```

**Run in background:**
```bash
# Install as service
sudo cloudflared service install
sudo systemctl start cloudflared

# Check status
sudo systemctl status cloudflared
```

---

## 🆘 Troubleshooting

### ngrok: "Account limit reached"

**Problem:** Free tier allows only 1 tunnel

**Solution:**
```bash
# Stop other ngrok processes
pkill ngrok

# Start again
ngrok http 80
```

---

### Cloudflare: "Tunnel not accessible"

**Problem:** Application not running

**Solution:**
```bash
# Check if app is running
curl http://localhost:80

# Check tunnel status
sudo systemctl status cloudflared

# View logs
sudo journalctl -u cloudflared -f
```

---

### URL Changes Every Time

**Problem:** Using quick tunnel or ngrok free

**Solutions:**

1. **Use Cloudflare Tunnel with account** (permanent URL)
2. **Upgrade to ngrok paid** ($8/mo for fixed subdomain)
3. **Update frontend .env after each restart**

---

## 📱 Share Your App

### With ngrok:
```
Share this URL: https://abc123.ngrok.io

Login:
  Username: admin
  Password: admin123
```

### With Cloudflare:
```
Share this URL: https://random-words.trycloudflare.com

Login:
  Username: admin
  Password: admin123
```

---

## ✅ Quick Commands

### ngrok (1 minute)
```bash
# Install
brew install ngrok  # or sudo apt install ngrok

# Setup
ngrok config add-authtoken YOUR_TOKEN

# Start
ngrok http 80
```

### Cloudflare Quick (30 seconds)
```bash
# Install
brew install cloudflared  # or wget + dpkg

# Start
cloudflared tunnel --url http://localhost:80
```

### Cloudflare Permanent (5 minutes)
```bash
# Install
brew install cloudflared

# Setup
cloudflared tunnel login
cloudflared tunnel create nova-app

# Configure (edit config.yml)

# Start
cloudflared tunnel run nova-app
```

---

## 🎉 Summary

### You Have 3 Options:

1. **ngrok** - Best for development
   - Free URL: `https://random.ngrok.io`
   - Changes on restart
   - 2-hour timeout

2. **Cloudflare Quick** - Best for instant testing
   - Free URL: `https://random.trycloudflare.com`
   - Changes on restart
   - No timeout

3. **Cloudflare Tunnel** - Best for production
   - Free URL: `https://TUNNEL_ID.cfargotunnel.com`
   - Permanent URL
   - No timeout

---

## 🎯 My Recommendation

### For You (No Domain):

**Quick Test:** Cloudflare Quick Tunnel
```bash
cloudflared tunnel --url http://localhost:80
```

**Production:** Cloudflare Tunnel with Account
```bash
cloudflared tunnel create nova-app
sudo cloudflared service install
```

**Why:** Free, permanent URL, no timeouts, runs 24/7!

---

## 📚 Full Guides

- **ngrok Details:** [NGROK_SETUP.md](NGROK_SETUP.md)
- **Cloudflare Details:** [CLOUDFLARE_TUNNEL.md](CLOUDFLARE_TUNNEL.md)
- **Comparison:** [TUNNEL_COMPARISON.md](TUNNEL_COMPARISON.md)

---

**You don't need a domain! Get a free URL in 30 seconds!** 🚀

```bash
# Fastest way (no account needed):
cloudflared tunnel --url http://localhost:80
```
