# 🎯 Next Steps - Get Your App Running

## Current Status

✅ Frontend deployed on Vercel: https://nova-pass-generator.vercel.app
❌ Backend on EC2 failing to start (pydantic validation errors)

---

## 🚀 What You Need to Do

### Step 1: Fix Backend on EC2 (5 minutes)

1. **Connect to EC2**
   - Go to AWS EC2 Console
   - Select your instance
   - Click "Connect" → "EC2 Instance Connect" → "Connect"

2. **Run the fix script**
   ```bash
   cd ~/Nova-Pass-Generator
   git pull
   chmod +x fix_backend_ec2.sh
   ./fix_backend_ec2.sh
   ```

3. **Verify it's working**
   ```bash
   pm2 status
   # Should show "online" status
   
   curl http://localhost:8000/api/v1/health
   # Should return: {"status":"ok"}
   ```

**That's it for the backend!** ✅

---

### Step 2: Configure Vercel Frontend (2 minutes)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select project: `nova-pass-generator`

2. **Add Environment Variable**
   - Go to "Settings" → "Environment Variables"
   - Click "Add New"
   - Name: `VITE_API_URL`
   - Value: `http://100.55.91.90:8000`
   - Environments: Check all (Production, Preview, Development)
   - Click "Save"

3. **Redeploy**
   - Go to "Deployments"
   - Click "..." on the latest deployment
   - Click "Redeploy"
   - Wait 1-2 minutes

**Done!** ✅

---

### Step 3: Test Your App (1 minute)

1. **Open your app**
   - Visit: https://nova-pass-generator.vercel.app

2. **Login**
   - Username: `harshvardhan`
   - Password: `harsh9837`

3. **Test features**
   - Create an event
   - Upload CSV
   - Generate passes
   - Scan QR codes

**If everything works, you're done!** 🎉

---

## 🐛 If Something Goes Wrong

### Backend Still Not Working

```bash
# On EC2, check logs
pm2 logs nova-backend --lines 50

# Try manual restart
pm2 restart nova-backend

# Check status
pm2 status
```

**See:** `QUICK_FIX.md` for detailed troubleshooting

### Frontend Shows "Network Error"

**Check EC2 Security Group:**
1. EC2 Console → Security Groups
2. Find your instance's security group
3. Inbound Rules → Edit
4. Add rule if missing:
   - Type: Custom TCP
   - Port: 8000
   - Source: 0.0.0.0/0
5. Save

### CORS Errors in Browser Console

```bash
# On EC2
cd ~/Nova-Pass-Generator/backend
nano .env

# Make sure this line is correct:
CORS_ORIGINS=["https://nova-pass-generator.vercel.app","http://localhost:5173"]

# Save (Ctrl+O, Enter, Ctrl+X) and restart
pm2 restart nova-backend
```

---

## 📚 Documentation Reference

- **`QUICK_FIX.md`** - Detailed troubleshooting for backend errors
- **`VERCEL_SETUP.md`** - Complete Vercel configuration guide
- **`PM2_GUIDE.md`** - All PM2 commands and management
- **`README.md`** - Complete project documentation

---

## 🎯 Your URLs

- **Frontend**: https://nova-pass-generator.vercel.app
- **Backend**: http://100.55.91.90:8000
- **API Docs**: http://100.55.91.90:8000/docs
- **Health Check**: http://100.55.91.90:8000/api/v1/health

---

## ✅ Success Checklist

After completing the steps above, verify:

- [ ] Backend status is "online" (`pm2 status` on EC2)
- [ ] Health check returns `{"status":"ok"}`
- [ ] Can access frontend at Vercel URL
- [ ] Can login with credentials
- [ ] No CORS errors in browser console (F12 → Console)
- [ ] Can create events and upload CSV
- [ ] Can generate passes
- [ ] Can scan QR codes

---

## 🔧 Useful Commands

### On EC2 (Backend Management)
```bash
pm2 status              # Check if backend is running
pm2 logs nova-backend   # View logs
pm2 restart nova-backend # Restart backend
pm2 stop nova-backend   # Stop backend
pm2 start nova-backend  # Start backend
```

### Test Backend API
```bash
# From anywhere
curl http://100.55.91.90:8000/api/v1/health

# Should return: {"status":"ok"}
```

---

## 💡 Pro Tips

1. **Bookmark these URLs:**
   - Your app: https://nova-pass-generator.vercel.app
   - API docs: http://100.55.91.90:8000/docs
   - Vercel dashboard: https://vercel.com/dashboard

2. **Keep EC2 Instance Connect tab open** for quick access

3. **Monitor backend logs** if you encounter issues:
   ```bash
   pm2 logs nova-backend
   ```

4. **Generate a secure SECRET_KEY** for production:
   ```bash
   openssl rand -hex 32
   # Update in backend/.env
   ```

---

## 🎉 That's It!

Follow the 3 steps above and your app will be live and working!

**Total time: ~10 minutes**

Need help? Check the documentation files listed above.

**Happy event managing! 🚀**
