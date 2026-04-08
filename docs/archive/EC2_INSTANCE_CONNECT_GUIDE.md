# 🔌 EC2 Instance Connect - Step-by-Step Guide

## What is EC2 Instance Connect?

EC2 Instance Connect allows you to connect to your EC2 instance directly from your browser - no SSH keys needed!

---

## 📋 Prerequisites

- EC2 instance running Ubuntu 22.04
- Instance in "Running" state
- Security group allows SSH (port 22) from your IP

---

## 🚀 How to Connect

### Step 1: Go to EC2 Console

Open: https://console.aws.amazon.com/ec2/

### Step 2: Find Your Instance

1. Click **"Instances"** in the left sidebar
2. Find your instance (e.g., "nova-pass-generator")
3. Check that Status is **"Running"** (green dot)

### Step 3: Connect

1. **Select** your instance (checkbox)
2. Click **"Connect"** button at the top
3. Choose **"EC2 Instance Connect"** tab
4. Keep default settings:
   - User name: `ubuntu`
5. Click **"Connect"** button

### Step 4: Browser Terminal Opens

You'll see a terminal in your browser that looks like:
```
ubuntu@ip-172-31-xx-xx:~$
```

You're now connected! 🎉

---

## 📤 Uploading Files

### Method 1: Using the Upload Button (Easiest)

1. In the EC2 Instance Connect terminal
2. Look for **"Actions"** menu at the top
3. Click **"Actions"** → **"Upload file"**
4. Click **"Select file"**
5. Choose `nova-app.tar.gz` from your computer
6. Click **"Upload"**
7. Wait for upload to complete
8. File will be in your home directory (`~/`)

### Method 2: Using AWS CLI + S3

If you have AWS CLI configured:

**On your local machine:**
```bash
# Upload to S3
aws s3 cp nova-app.tar.gz s3://your-bucket/nova-app.tar.gz
```

**In EC2 Instance Connect terminal:**
```bash
# Download from S3
aws s3 cp s3://your-bucket/nova-app.tar.gz ~/nova-app.tar.gz
```

---

## 🎯 Complete Deployment Flow

### 1. Create Package (Local Machine)

```bash
cd /path/to/nova-pass-generator
chmod +x quick_deploy.sh
./quick_deploy.sh YOUR_EC2_IP
```

This creates `nova-app.tar.gz`

### 2. Connect to EC2

1. AWS Console → EC2 → Instances
2. Select instance → Click "Connect"
3. Choose "EC2 Instance Connect" → Click "Connect"

### 3. Upload Package

In the browser terminal:
- Click "Actions" → "Upload file"
- Select `nova-app.tar.gz`
- Click "Upload"

### 4. Deploy

In the browser terminal:

```bash
# Verify file is uploaded
ls -lh nova-app.tar.gz

# Extract
mkdir -p nova-pass-generator
tar -xzf nova-app.tar.gz -C nova-pass-generator
cd nova-pass-generator

# Deploy
chmod +x deploy_ec2.sh
./deploy_ec2.sh
```

Wait 5-10 minutes for deployment to complete.

### 5. Access Application

Open browser: `http://YOUR_EC2_IP`

---

## 🔧 Common Tasks

### Check Application Status

```bash
cd ~/nova-pass-generator
./monitor.sh
```

### Manage Services

```bash
cd ~/nova-pass-generator
./manage.sh
```

### View Logs

```bash
# Backend logs
sudo journalctl -u nova-backend -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
```

### Restart Services

```bash
sudo systemctl restart nova-backend
sudo systemctl restart nginx
```

---

## 💡 Tips

### Keep Terminal Open

The EC2 Instance Connect session stays open for 60 minutes. If it closes:
1. Just click "Connect" again
2. You'll be back in the same server

### Multiple Terminals

You can open multiple EC2 Instance Connect sessions:
1. Open EC2 Console in multiple browser tabs
2. Connect to the same instance in each tab
3. Useful for viewing logs in one tab while working in another

### Copy/Paste

- **Copy from terminal**: Select text, it auto-copies
- **Paste to terminal**: Right-click → Paste, or Ctrl+Shift+V

### File Size Limits

EC2 Instance Connect file upload has a size limit (~10 MB).
If your package is larger, use AWS CLI + S3 method.

---

## 🐛 Troubleshooting

### Can't Connect

**Error: "Failed to connect"**

Check:
1. Instance is running (not stopped)
2. Security group allows SSH (port 22) from your IP
3. Try refreshing the page

**Fix Security Group:**
1. EC2 Console → Instances
2. Select instance → Security tab
3. Click security group link
4. Edit inbound rules
5. Add rule: SSH (22) from "My IP"

### Upload Fails

**Error: "Upload failed"**

Try:
1. Check file size (must be < 10 MB)
2. Check internet connection
3. Try uploading again
4. Use AWS CLI + S3 method instead

### Terminal Freezes

If terminal becomes unresponsive:
1. Close the browser tab
2. Go back to EC2 Console
3. Click "Connect" again

---

## 🔒 Security Notes

### Session Timeout

EC2 Instance Connect sessions expire after 60 minutes of inactivity.
This is a security feature.

### No Key Required

You don't need to manage SSH keys with EC2 Instance Connect.
AWS handles authentication using IAM permissions.

### IAM Permissions

Your AWS user needs these permissions:
- `ec2-instance-connect:SendSSHPublicKey`
- `ec2:DescribeInstances`

---

## 📚 Alternative: Traditional SSH

If you prefer traditional SSH with key files:

```bash
# Make key secure
chmod 400 ~/Downloads/your-key.pem

# Connect
ssh -i ~/Downloads/your-key.pem ubuntu@YOUR_EC2_IP

# Upload files
scp -i ~/Downloads/your-key.pem nova-app.tar.gz ubuntu@YOUR_EC2_IP:~
```

---

## ✅ Quick Reference

### Connect to Instance
```
AWS Console → EC2 → Instances → Select → Connect → EC2 Instance Connect → Connect
```

### Upload File
```
In terminal: Actions → Upload file → Select file → Upload
```

### Deploy Application
```bash
tar -xzf nova-app.tar.gz -C nova-pass-generator
cd nova-pass-generator
chmod +x deploy_ec2.sh
./deploy_ec2.sh
```

### Check Status
```bash
cd ~/nova-pass-generator
./monitor.sh
```

---

**EC2 Instance Connect makes deployment easy - no SSH keys to manage! 🎉**
