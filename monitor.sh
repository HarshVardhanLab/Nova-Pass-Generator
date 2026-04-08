#!/bin/bash

# Nova Pass Generator - Monitoring Script
# Run this on EC2 to monitor the application

echo "🔍 Nova Pass Generator - System Monitor"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get system info
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "N/A")
INSTANCE_TYPE=$(curl -s http://169.254.169.254/latest/meta-data/instance-type 2>/dev/null || echo "N/A")

echo "${BLUE}Instance Information:${NC}"
echo "  Public IP: $PUBLIC_IP"
echo "  Instance Type: $INSTANCE_TYPE"
echo ""

# Check services
echo "${BLUE}Service Status:${NC}"

# Backend
if systemctl is-active --quiet nova-backend; then
    echo "  Backend: ${GREEN}✓ Running${NC}"
    BACKEND_PID=$(systemctl show -p MainPID nova-backend | cut -d= -f2)
    echo "    PID: $BACKEND_PID"
else
    echo "  Backend: ${RED}✗ Stopped${NC}"
fi

# Nginx
if systemctl is-active --quiet nginx; then
    echo "  Nginx: ${GREEN}✓ Running${NC}"
else
    echo "  Nginx: ${RED}✗ Stopped${NC}"
fi

echo ""

# Check ports
echo "${BLUE}Port Status:${NC}"
if sudo lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "  Port 8000 (Backend): ${GREEN}✓ Listening${NC}"
else
    echo "  Port 8000 (Backend): ${RED}✗ Not listening${NC}"
fi

if sudo lsof -Pi :80 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "  Port 80 (HTTP): ${GREEN}✓ Listening${NC}"
else
    echo "  Port 80 (HTTP): ${RED}✗ Not listening${NC}"
fi

echo ""

# System resources
echo "${BLUE}System Resources:${NC}"

# CPU
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
echo "  CPU Usage: ${CPU_USAGE}%"

# Memory
MEM_INFO=$(free -m | awk 'NR==2{printf "%.1f%%", $3*100/$2 }')
echo "  Memory Usage: $MEM_INFO"

# Disk
DISK_USAGE=$(df -h / | awk 'NR==2{print $5}')
echo "  Disk Usage: $DISK_USAGE"

echo ""

# Database info
if [ -f "/home/ubuntu/nova-pass-generator/backend/hackgear.db" ]; then
    DB_SIZE=$(du -h /home/ubuntu/nova-pass-generator/backend/hackgear.db | cut -f1)
    echo "${BLUE}Database:${NC}"
    echo "  Size: $DB_SIZE"
    echo ""
fi

# Recent logs
echo "${BLUE}Recent Backend Logs (last 10 lines):${NC}"
sudo journalctl -u nova-backend -n 10 --no-pager | tail -10

echo ""
echo "${BLUE}Recent Nginx Errors (last 5 lines):${NC}"
sudo tail -5 /var/log/nginx/error.log 2>/dev/null || echo "  No errors"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "${GREEN}Monitoring Complete${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Useful Commands:"
echo "  View live backend logs: ${YELLOW}sudo journalctl -u nova-backend -f${NC}"
echo "  View live nginx logs:   ${YELLOW}sudo tail -f /var/log/nginx/access.log${NC}"
echo "  Restart backend:        ${YELLOW}sudo systemctl restart nova-backend${NC}"
echo "  Restart nginx:          ${YELLOW}sudo systemctl restart nginx${NC}"
echo ""
