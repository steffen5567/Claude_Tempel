#!/bin/bash

# Script to generate and configure SSH keys for GitHub Actions deployment

set -e

echo "🔑 Setting up SSH keys for GitHub Actions deployment..."
echo ""

# Generate SSH key
KEY_PATH="$HOME/.ssh/github-actions"
if [ -f "$KEY_PATH" ]; then
    echo "⚠️  SSH key already exists at $KEY_PATH"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborting."
        exit 1
    fi
fi

echo "📝 Generating new SSH key..."
ssh-keygen -t ed25519 -f "$KEY_PATH" -C "github-actions-deployment" -N ""

echo ""
echo "✅ SSH key pair generated!"
echo ""

# Add public key to authorized_keys
echo "📝 Adding public key to authorized_keys..."
mkdir -p ~/.ssh
chmod 700 ~/.ssh
cat "${KEY_PATH}.pub" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

echo ""
echo "✅ Public key added to authorized_keys!"
echo ""

# Display instructions
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 GitHub Secrets Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Go to: https://github.com/steffen5567/Claude_Tempel/settings/secrets/actions"
echo ""
echo "Add the following secrets:"
echo ""

echo "1️⃣  SSH_PRIVATE_KEY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat "$KEY_PATH"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "2️⃣  SERVER_HOST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Your server IP or hostname (e.g., 123.45.67.89)"
echo ""

echo "3️⃣  SERVER_USER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$USER"
echo ""

echo "4️⃣  DEPLOY_PATH"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "/var/www/habit-tracker-app"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Setup complete!"
echo ""
echo "🧪 Test SSH connection:"
echo "   ssh -i $KEY_PATH $USER@YOUR_SERVER_IP"
echo ""
