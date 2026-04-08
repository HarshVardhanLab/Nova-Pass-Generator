# Fix GitHub Secrets - SSH Key Issue

## The Problem

Error: `can't connect without a private SSH key or password`

This means GitHub Actions can't read your SSH key properly.

## Solution: Check Your SSH Key Format

### Step 1: Get Your Key Correctly

```bash
# On your local machine
cat ~/.ssh/your-ec2-key.pem
```

Or if your key is elsewhere:
```bash
cat ~/Downloads/your-ec2-key.pem
```

### Step 2: Verify Key Format

Your key should look like ONE of these:

**RSA Key:**
```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
(many lines of random characters)
...
-----END RSA PRIVATE KEY-----
```

**OpenSSH Key:**
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAA...
(many lines of random characters)
...
-----END OPENSSH PRIVATE KEY-----
```

**EC2 Key:**
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0B...
(many lines of random characters)
...
-----END PRIVATE KEY-----
```

### Step 3: Copy the Key Properly

**CRITICAL RULES:**
1. ✅ Include the `-----BEGIN` line
2. ✅ Include the `-----END` line
3. ✅ Include ALL lines in between
4. ❌ NO extra spaces before or after
5. ❌ NO extra blank lines at start or end
6. ✅ Keep the exact line breaks as they are

### Step 4: Add to GitHub Secrets

1. Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`

2. Click **"New repository secret"**

3. Name: `EC2_SSH_KEY`

4. Value: Paste your ENTIRE key (from Step 2)

5. Click **"Add secret"**

### Step 5: Verify Other Secrets

Make sure you also have:

**EC2_HOST:**
```
100.55.91.90
```

**EC2_USERNAME:**
```
ubuntu
```

### Step 6: Test Connection Manually

Before using GitHub Actions, test SSH manually:

```bash
# On your local machine
ssh -i ~/.ssh/your-ec2-key.pem ubuntu@100.55.91.90

# If this works, your key is valid
# If this fails, fix your key first
```

### Step 7: Re-run GitHub Actions

1. Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`
2. Click on the failed workflow
3. Click **"Re-run all jobs"**

## Alternative: Use Password Authentication

If SSH key keeps failing, you can use password instead:

### Update Workflow File

Edit `.github/workflows/deploy-ec2.yml`:

```yaml
- name: Deploy to EC2
  uses: appleboy/ssh-action@v1.0.3
  with:
    host: ${{ secrets.EC2_HOST }}
    username: ${{ secrets.EC2_USERNAME }}
    password: ${{ secrets.EC2_PASSWORD }}  # Use password instead of key
    port: 22
    script: |
      cd /home/ubuntu/Nova-Pass-Generator
      git pull origin main
      cd backend
      source venv/bin/activate
      pip install -r requirements.txt
      cd ..
      pm2 restart nova-backend
```

### Add Password Secret

1. Go to GitHub Secrets
2. Add new secret: `EC2_PASSWORD`
3. Value: Your EC2 instance password

**Note:** You need to enable password authentication on EC2 first:

```bash
# SSH into EC2
sudo nano /etc/ssh/sshd_config

# Change this line:
PasswordAuthentication yes

# Save and restart SSH
sudo systemctl restart sshd

# Set password for ubuntu user
sudo passwd ubuntu
```

## Alternative: Use GitHub Deploy Keys

More secure than password:

### Step 1: Generate Deploy Key on EC2

```bash
# SSH into EC2
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/github_deploy
# Press Enter for no passphrase

# View public key
cat ~/.ssh/github_deploy.pub
```

### Step 2: Add Public Key to GitHub

1. Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/keys`
2. Click **"Add deploy key"**
3. Title: `EC2 Deploy Key`
4. Key: Paste the public key from above
5. ✅ Check "Allow write access"
6. Click **"Add key"**

### Step 3: Configure Git on EC2

```bash
# SSH into EC2
cd /home/ubuntu/Nova-Pass-Generator

# Configure git to use deploy key
git config core.sshCommand "ssh -i ~/.ssh/github_deploy -o IdentitiesOnly=yes"

# Test it
git pull origin main
```

### Step 4: Update Workflow

Keep using your EC2 SSH key in GitHub Actions (not the deploy key).
The deploy key is only for git operations on EC2.

## Common Issues

### Issue 1: "Permission denied (publickey)"

**Solution:** Your SSH key doesn't match EC2
- Verify you're using the correct .pem file
- Check EC2 key pair name in AWS Console
- Download the key again if needed

### Issue 2: "Host key verification failed"

**Solution:** Add to workflow:

```yaml
- name: Deploy to EC2
  uses: appleboy/ssh-action@v1.0.3
  with:
    host: ${{ secrets.EC2_HOST }}
    username: ${{ secrets.EC2_USERNAME }}
    key: ${{ secrets.EC2_SSH_KEY }}
    port: 22
    script_stop: false
    script: |
      ssh-keyscan -H 100.55.91.90 >> ~/.ssh/known_hosts
      cd /home/ubuntu/Nova-Pass-Generator
      git pull origin main
      # ... rest of script
```

### Issue 3: "Connection timeout"

**Solution:** Check EC2 Security Group
- Go to AWS Console → EC2 → Security Groups
- Find your instance's security group
- Ensure port 22 is open to 0.0.0.0/0 (or GitHub Actions IPs)

### Issue 4: Key has wrong permissions

**Solution:** Fix key permissions locally:

```bash
chmod 600 ~/.ssh/your-ec2-key.pem
```

## Verify Everything Works

Run this checklist:

```bash
# 1. Can you SSH manually?
ssh -i ~/.ssh/your-ec2-key.pem ubuntu@100.55.91.90
# Should connect without errors

# 2. Is git configured on EC2?
cd /home/ubuntu/Nova-Pass-Generator
git remote -v
# Should show your GitHub repo

# 3. Can you pull code?
git pull origin main
# Should pull without errors

# 4. Is PM2 running?
pm2 status
# Should show nova-backend

# 5. Are GitHub secrets set?
# Go to GitHub → Settings → Secrets
# Should see: EC2_HOST, EC2_USERNAME, EC2_SSH_KEY
```

If all 5 checks pass, GitHub Actions should work!

## Still Not Working?

Try the simple manual deploy method:

```bash
# Just SSH and pull manually after each push
ssh -i ~/.ssh/your-ec2-key.pem ubuntu@100.55.91.90
cd /home/ubuntu/Nova-Pass-Generator
git pull origin main
cd backend
source venv/bin/activate
pip install -r requirements.txt
cd ..
pm2 restart nova-backend
```

This is reliable and works every time, just not automatic.
