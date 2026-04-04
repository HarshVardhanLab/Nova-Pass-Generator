#!/bin/bash
# ==========================================================
# HackGear EC2 Deployment Script
# Run this on your fresh Ubuntu Server EC2 instance
# ==========================================================

echo "=========================================="
echo "    Preparing EC2 for HackGear Pass   "
echo "=========================================="

# 1. Update OS & Install Dependencies
echo "[1/4] Updating Ubuntu Packages..."
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y ca-certificates curl gnupg git

# 2. Install Docker & Docker Compose
echo "[2/4] Installing Docker Engine..."
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 3. Secure Production Keys
echo "[3/4] Establishing Production Defaults..."
if [ ! -f .env ]; then
    echo "Creating secure .env file..."
    cp .env.production .env
    # Generate random 32 digit hex string securely
    RANDOM_KEY=$(openssl rand -hex 32)
    sed -i "s/enter_secure_random_string_here_for_production/$RANDOM_KEY/" .env
    echo "✓ Generated new secure SECRET_KEY injected into .env"
fi

# 4. Stand Up Application
echo "[4/4] Building and Deploying Docker Containers..."
sudo docker compose down
sudo docker compose up --build -d

echo "=========================================="
echo "    DEPLOYMENT COMPLETE"
echo "=========================================="
echo "Your API container and NGINX Proxy are running!"
echo "Check status: docker compose ps"
echo "Follow logs: docker compose logs -f"
echo "=========================================="
