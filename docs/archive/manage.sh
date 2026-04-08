#!/bin/bash

# Nova Pass Generator - Management Script
# Run this on EC2 for common management tasks

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

APP_DIR="/home/ubuntu/nova-pass-generator"

show_menu() {
    echo ""
    echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo "${GREEN}  Nova Pass Generator - Management Menu${NC}"
    echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "  ${YELLOW}Service Management:${NC}"
    echo "    1) Start Backend"
    echo "    2) Stop Backend"
    echo "    3) Restart Backend"
    echo "    4) Backend Status"
    echo "    5) Backend Logs (live)"
    echo ""
    echo "  ${YELLOW}Nginx:${NC}"
    echo "    6) Restart Nginx"
    echo "    7) Nginx Status"
    echo "    8) Nginx Logs (live)"
    echo "    9) Test Nginx Config"
    echo ""
    echo "  ${YELLOW}Monitoring:${NC}"
    echo "    10) System Monitor"
    echo "    11) Resource Usage"
    echo "    12) Check Ports"
    echo ""
    echo "  ${YELLOW}Database:${NC}"
    echo "    13) Backup Database"
    echo "    14) List Backups"
    echo "    15) Reset Database"
    echo ""
    echo "  ${YELLOW}Updates:${NC}"
    echo "    16) Update System Packages"
    echo "    17) Rebuild Frontend"
    echo "    18) Update Backend Dependencies"
    echo ""
    echo "  ${YELLOW}Other:${NC}"
    echo "    19) Show Application URLs"
    echo "    20) Clean Logs"
    echo "    0) Exit"
    echo ""
    echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

start_backend() {
    echo "${BLUE}Starting backend...${NC}"
    sudo systemctl start nova-backend
    echo "${GREEN}✓ Backend started${NC}"
}

stop_backend() {
    echo "${BLUE}Stopping backend...${NC}"
    sudo systemctl stop nova-backend
    echo "${GREEN}✓ Backend stopped${NC}"
}

restart_backend() {
    echo "${BLUE}Restarting backend...${NC}"
    sudo systemctl restart nova-backend
    echo "${GREEN}✓ Backend restarted${NC}"
}

backend_status() {
    sudo systemctl status nova-backend
}

backend_logs() {
    echo "${YELLOW}Press Ctrl+C to exit logs${NC}"
    sleep 2
    sudo journalctl -u nova-backend -f
}

restart_nginx() {
    echo "${BLUE}Restarting Nginx...${NC}"
    sudo systemctl restart nginx
    echo "${GREEN}✓ Nginx restarted${NC}"
}

nginx_status() {
    sudo systemctl status nginx
}

nginx_logs() {
    echo "${YELLOW}Press Ctrl+C to exit logs${NC}"
    sleep 2
    sudo tail -f /var/log/nginx/access.log
}

test_nginx() {
    echo "${BLUE}Testing Nginx configuration...${NC}"
    sudo nginx -t
}

system_monitor() {
    if [ -f "$APP_DIR/monitor.sh" ]; then
        bash "$APP_DIR/monitor.sh"
    else
        echo "${RED}Monitor script not found${NC}"
    fi
}

resource_usage() {
    echo "${BLUE}System Resources:${NC}"
    echo ""
    echo "CPU Usage:"
    top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print "  " 100 - $1 "%"}'
    echo ""
    echo "Memory Usage:"
    free -h
    echo ""
    echo "Disk Usage:"
    df -h /
    echo ""
    echo "Top Processes:"
    ps aux --sort=-%mem | head -6
}

check_ports() {
    echo "${BLUE}Checking ports...${NC}"
    echo ""
    echo "Port 8000 (Backend):"
    sudo lsof -i :8000 || echo "  Not in use"
    echo ""
    echo "Port 80 (HTTP):"
    sudo lsof -i :80 || echo "  Not in use"
}

backup_database() {
    echo "${BLUE}Creating database backup...${NC}"
    mkdir -p ~/backups
    BACKUP_FILE=~/backups/hackgear-$(date +%Y%m%d-%H%M%S).db
    cp "$APP_DIR/backend/hackgear.db" "$BACKUP_FILE"
    echo "${GREEN}✓ Backup created: $BACKUP_FILE${NC}"
    ls -lh "$BACKUP_FILE"
}

list_backups() {
    echo "${BLUE}Available backups:${NC}"
    if [ -d ~/backups ]; then
        ls -lh ~/backups/*.db 2>/dev/null || echo "  No backups found"
    else
        echo "  No backups directory"
    fi
}

reset_database() {
    echo "${RED}WARNING: This will delete all data!${NC}"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
        echo "${BLUE}Stopping backend...${NC}"
        sudo systemctl stop nova-backend
        echo "${BLUE}Removing database...${NC}"
        rm -f "$APP_DIR/backend/hackgear.db"
        echo "${BLUE}Starting backend...${NC}"
        sudo systemctl start nova-backend
        echo "${GREEN}✓ Database reset complete${NC}"
    else
        echo "Cancelled"
    fi
}

update_system() {
    echo "${BLUE}Updating system packages...${NC}"
    sudo apt-get update
    sudo apt-get upgrade -y
    echo "${GREEN}✓ System updated${NC}"
}

rebuild_frontend() {
    echo "${BLUE}Rebuilding frontend...${NC}"
    cd "$APP_DIR/frontend"
    npm run build
    sudo systemctl reload nginx
    echo "${GREEN}✓ Frontend rebuilt${NC}"
}

update_backend_deps() {
    echo "${BLUE}Updating backend dependencies...${NC}"
    cd "$APP_DIR/backend"
    source venv/bin/activate
    pip install --upgrade -r requirements.txt
    deactivate
    sudo systemctl restart nova-backend
    echo "${GREEN}✓ Backend dependencies updated${NC}"
}

show_urls() {
    PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "N/A")
    echo ""
    echo "${BLUE}Application URLs:${NC}"
    echo "  Frontend:  ${GREEN}http://$PUBLIC_IP${NC}"
    echo "  API Docs:  ${GREEN}http://$PUBLIC_IP/docs${NC}"
    echo "  Redoc:     ${GREEN}http://$PUBLIC_IP/redoc${NC}"
    echo ""
    echo "${BLUE}Admin Login:${NC}"
    echo "  Username: ${GREEN}admin${NC}"
    echo "  Password: ${GREEN}admin123${NC}"
    echo ""
}

clean_logs() {
    echo "${BLUE}Cleaning logs...${NC}"
    sudo journalctl --vacuum-time=7d
    sudo truncate -s 0 /var/log/nginx/access.log
    sudo truncate -s 0 /var/log/nginx/error.log
    echo "${GREEN}✓ Logs cleaned${NC}"
}

# Main loop
while true; do
    show_menu
    read -p "Select option: " choice
    
    case $choice in
        1) start_backend ;;
        2) stop_backend ;;
        3) restart_backend ;;
        4) backend_status ;;
        5) backend_logs ;;
        6) restart_nginx ;;
        7) nginx_status ;;
        8) nginx_logs ;;
        9) test_nginx ;;
        10) system_monitor ;;
        11) resource_usage ;;
        12) check_ports ;;
        13) backup_database ;;
        14) list_backups ;;
        15) reset_database ;;
        16) update_system ;;
        17) rebuild_frontend ;;
        18) update_backend_deps ;;
        19) show_urls ;;
        20) clean_logs ;;
        0) echo "Goodbye!"; exit 0 ;;
        *) echo "${RED}Invalid option${NC}" ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
done
