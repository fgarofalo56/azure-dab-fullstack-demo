#!/bin/sh
set -e

# Replace DAB backend URL placeholder in nginx config
# Default to http://localhost:5000 for local development
DAB_BACKEND_URL="${DAB_BACKEND_URL:-http://localhost:5000}"

# Use sed to replace the placeholder - avoids envsubst conflicts with Nginx variables ($uri, $host, etc.)
sed -i "s|DAB_BACKEND_URL_PLACEHOLDER|${DAB_BACKEND_URL}|g" /etc/nginx/conf.d/default.conf

echo "Nginx configured with DAB backend: ${DAB_BACKEND_URL}"

# Start nginx
exec nginx -g 'daemon off;'
