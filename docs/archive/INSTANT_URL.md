# ⚡ Get Instant Public URL (30 Seconds!)

## No Domain? No Account? No Problem!

Get a public HTTPS URL for your app in 30 seconds!

---

## 🚀 Fastest Method (Cloudflare Quick Tunnel)

### Step 1: Install (One Time)

**On Mac:**
```bash
brew install cloudflared
```

**On Ubuntu/EC2:**
```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

### Step 2: Start Tunnel

```bash
cloudflared tunnel --url http://localhost:80
```

### Step 3: Get Your URL!

You'll see:
```
Your quick Tunnel has been created! Visit it at:
https://random-words-123.trycloudflare.com
```

**That's it!** Share that URL! 🎉

---

## 📋 Complete Example

### Local Development (Mac)

```bash
# Terminal 1: Start your app
cd /path/to/nova-pass-generator
./start.sh

# Terminal 2: Start tunnel
cloudflared tunnel --url http://localhost:5173
```

**Access:** `https://random-words.trycloudflare.com`

---

### EC2 Production

```bash
# Connect to EC2 via Instance Connect

# Install cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Start tunnel
cloudflared tunnel --url http://localhost:80
```

**Access:** `https://random-words.trycloudflare.com`

---

## 🔄 Update Frontend

After getting your URL, update the frontend:

```bash
# Copy the URL from terminal (e.g., https://abc-def.trycloudflare.com)

cd ~/nova-pass-generator/frontend
echo "VITE_API_URL=https://abc-def.trycloudflare.com" > .env
npm run build
sudo systemctl reload nginx  # if on EC2
```

---

## ✨ Features

- ✅ **Free** - No cost
- ✅ **HTTPS** - Secure by default
- ✅ **No Account** - No signup needed
- ✅ **Instant** - 30 seconds setup
- ✅ **No Timeout** - Runs as long as you want

---

## ⚠️ Note

**URL changes each time you restart the tunnel.**

For a permanent URL, see: [TUNNEL_NO_DOMAIN.md](TUNNEL_NO_DOMAIN.md)

---

## 🎯 Alternative: ngrok (With Account)

If you prefer ngrok:

```bash
# 1. Install
brew install ngrok  # or sudo apt install ngrok

# 2. Sign up at https://dashboard.ngrok.com/signup

# 3. Get token from https://dashboard.ngrok.com/get-started/your-authtoken

# 4. Add token
ngrok config add-authtoken YOUR_TOKEN

# 5. Start
ngrok http 80
```

**You get:** `https://random.ngrok.io`

---

## 📱 Share Your App

```
🎉 Your Nova Pass Generator is live!

URL: https://your-tunnel-url.trycloudflare.com

Login:
  Username: admin
  Password: admin123

Features:
✓ Event Management
✓ CSV Upload
✓ Template Editor
✓ Pass Generation
✓ QR Scanner
```

---

## 🆘 Troubleshooting

### "Connection Refused"

**Check if app is running:**
```bash
curl http://localhost:80
```

**If not running:**
```bash
cd ~/nova-pass-generator
./start.sh  # local
# or check services on EC2
sudo systemctl status nova-backend
```

---

### "Tunnel Closed"

**Just restart:**
```bash
cloudflared tunnel --url http://localhost:80
```

You'll get a new URL.

---

## 💡 Pro Tip

### Keep Tunnel Running

**Run in background:**
```bash
nohup cloudflared tunnel --url http://localhost:80 > tunnel.log 2>&1 &
```

**Get URL from log:**
```bash
cat tunnel.log | grep "trycloudflare.com"
```

**Stop tunnel:**
```bash
pkill cloudflared
```

---

## 🎉 That's It!

**One command to get a public URL:**

```bash
cloudflared tunnel --url http://localhost:80
```

**No domain, no account, no configuration needed!** ⚡

---

## 📚 Want More?

- **Permanent URL:** [TUNNEL_NO_DOMAIN.md](TUNNEL_NO_DOMAIN.md)
- **Full ngrok Guide:** [NGROK_SETUP.md](NGROK_SETUP.md)
- **Full Cloudflare Guide:** [CLOUDFLARE_TUNNEL.md](CLOUDFLARE_TUNNEL.md)
- **Comparison:** [TUNNEL_COMPARISON.md](TUNNEL_COMPARISON.md)

---

**Get your app online in 30 seconds!** 🚀
