#!/bin/bash

# Habit Tracker - Server Setup Script
# This script prepares an Ubuntu/Debian server for deployment

set -e

echo "🚀 Starting Habit Tracker Server Setup..."

# Update system
echo "📦 Updating system packages..."
sudo apt update
sudo apt upgrade -y

# Install required packages
echo "📦 Installing required packages..."
sudo apt install -y git nginx python3-pip python3-venv nodejs npm

# Create deployment directory
DEPLOY_PATH="/var/www/habit-tracker-app"
echo "📁 Creating deployment directory at $DEPLOY_PATH..."
sudo mkdir -p $DEPLOY_PATH
sudo chown $USER:$USER $DEPLOY_PATH

# Clone repository (you'll need to provide your repo URL)
echo "📥 Cloning repository..."
read -p "Enter your GitHub repository URL (e.g., git@github.com:steffen5567/Claude_Tempel.git): " REPO_URL
git clone $REPO_URL $DEPLOY_PATH
cd $DEPLOY_PATH

# Setup Python virtual environment
echo "🐍 Setting up Python virtual environment..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate

# Install frontend dependencies
echo "⚛️  Installing frontend dependencies..."
cd ../frontend
npm install

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Create nginx web directory
echo "🌐 Setting up nginx..."
sudo mkdir -p /var/www/habit-tracker
sudo chown $USER:$USER /var/www/habit-tracker
sudo cp -r dist/* /var/www/habit-tracker/

# Create nginx configuration
echo "⚙️  Creating nginx configuration..."
sudo tee /etc/nginx/sites-available/habit-tracker > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        root /var/www/habit-tracker;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

# Enable nginx site
sudo ln -sf /etc/nginx/sites-available/habit-tracker /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Create systemd service for backend
echo "⚙️  Creating systemd service..."
sudo tee /etc/systemd/system/habit-tracker-backend.service > /dev/null <<EOF
[Unit]
Description=Habit Tracker Backend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$DEPLOY_PATH/backend
Environment="PATH=$DEPLOY_PATH/backend/venv/bin"
ExecStart=$DEPLOY_PATH/backend/venv/bin/python app.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable habit-tracker-backend
sudo systemctl start habit-tracker-backend

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
echo "y" | sudo ufw enable || true

# Setup sudoers for deployment without password
echo "🔐 Configuring sudo permissions for deployment..."
echo "$USER ALL=(ALL) NOPASSWD: /bin/systemctl restart habit-tracker-backend" | sudo tee /etc/sudoers.d/habit-tracker
echo "$USER ALL=(ALL) NOPASSWD: /bin/systemctl restart nginx" | sudo tee -a /etc/sudoers.d/habit-tracker
echo "$USER ALL=(ALL) NOPASSWD: /bin/rm -rf /var/www/habit-tracker/*" | sudo tee -a /etc/sudoers.d/habit-tracker
echo "$USER ALL=(ALL) NOPASSWD: /bin/cp -r * /var/www/habit-tracker/" | sudo tee -a /etc/sudoers.d/habit-tracker
sudo chmod 440 /etc/sudoers.d/habit-tracker

echo ""
echo "✅ Server setup completed!"
echo ""
echo "📝 Next steps:"
echo "1. Check if backend is running: sudo systemctl status habit-tracker-backend"
echo "2. Check if nginx is running: sudo systemctl status nginx"
echo "3. Get your server IP: curl -4 ifconfig.me"
echo "4. Visit http://YOUR_SERVER_IP to see your app!"
echo ""
echo "🔑 For GitHub Actions, you need to set up SSH keys:"
echo "   Run: ssh-keygen -t ed25519 -C 'github-actions'"
echo "   Then add the public key (~/.ssh/id_ed25519.pub) to ~/.ssh/authorized_keys"
echo "   And add the private key to GitHub Secrets as SSH_PRIVATE_KEY"
echo ""
