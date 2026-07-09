#!/bin/bash
# ============================================
# Initial SSL Certificate Setup (run once)
# Usage: sudo ./scripts/setup-ssl.sh
# ============================================

set -euo pipefail

DOMAIN="${1:-admin.puravankara.com}"
EMAIL="${2:-admin@puravankara.com}"

echo "=== SSL Certificate Setup ==="
echo "Domain: $DOMAIN"
echo "Email:  $EMAIL"

# Stop any running containers that may block port 80
docker-compose -f docker-compose.prod.yml down nginx 2>/dev/null || true

# Obtain initial certificate
docker run --rm \
  -v "$(pwd)/ssl:/etc/letsencrypt" \
  -v "$(pwd)/ssl-data:/var/www/certbot" \
  -p 80:80 \
  certbot/certbot certonly --standalone \
  --non-interactive \
  --agree-tos \
  --email "$EMAIL" \
  --domains "$DOMAIN"

# Copy certificates to nginx SSL directory
mkdir -p ssl
cp "ssl/live/$DOMAIN/fullchain.pem" ssl/
cp "ssl/live/$DOMAIN/privkey.pem" ssl/

echo "=== SSL Setup Complete ==="
echo "Certificates saved to ./ssl/"
echo ""
echo "Start the stack with:"
echo "  docker-compose -f docker-compose.prod.yml up -d"
