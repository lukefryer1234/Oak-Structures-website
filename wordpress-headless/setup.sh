#!/bin/bash

echo "🚀 Setting up Oak Structures Headless WordPress..."

# Create wp-content directory structure
mkdir -p wp-content/themes
mkdir -p wp-content/plugins
mkdir -p wp-content/uploads

# Start Docker containers
echo "📦 Starting Docker containers..."
docker-compose up -d

# Wait for containers to be ready
echo "⏳ Waiting for containers to be ready..."
sleep 30

# Check if WordPress is running
echo "🔍 Checking WordPress status..."
until curl -f http://localhost:8080 > /dev/null 2>&1; do
    echo "Waiting for WordPress to start..."
    sleep 5
done

echo "✅ WordPress is running!"
echo ""
echo "🌐 Access URLs:"
echo "   WordPress: http://localhost:8080"
echo "   phpMyAdmin: http://localhost:8081"
echo ""
echo "📋 Database Info:"
echo "   Database: oak_structures_wp"
echo "   User: wpuser"
echo "   Password: wppass123"
echo ""
echo "🔧 Next steps:"
echo "1. Go to http://localhost:8080 to complete WordPress setup"
echo "2. Install recommended plugins for headless WordPress"
echo "3. Configure REST API settings"
echo ""

# Download headless WordPress plugin
echo "📥 Downloading headless WordPress plugins..."
cd wp-content/plugins

# WP REST API plugin (if needed for older WP versions)
if [ ! -d "rest-api" ]; then
    echo "Downloading WP REST API plugin..."
    wget -q https://downloads.wordpress.org/plugin/rest-api.2.0-beta15.zip
    unzip -q rest-api.2.0-beta15.zip
    rm rest-api.2.0-beta15.zip
fi

# CORS headers plugin
if [ ! -d "wp-cors" ]; then
    echo "Downloading WP CORS plugin..."
    git clone https://github.com/ahmadawais/WP-REST-API-CORS.git wp-cors
fi

cd ../..

echo "🎉 Setup complete! Visit http://localhost:8080 to finish WordPress installation."
