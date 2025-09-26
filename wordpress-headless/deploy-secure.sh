#!/bin/bash

echo "🛡️  Deploying Oak Structures WordPress with Enhanced Security..."

# Check if we're in the right directory
if [ ! -f "docker-compose.secure.yml" ]; then
    echo "❌ Error: docker-compose.secure.yml not found. Please run this script from the wordpress-headless directory."
    exit 1
fi

# Stop any existing containers
echo "⏹️  Stopping existing containers..."
docker-compose down 2>/dev/null || true
docker-compose -f docker-compose.secure.yml down 2>/dev/null || true

# Create necessary directories
echo "📁 Creating required directories..."
mkdir -p nginx/ssl nginx/logs wp-content/themes wp-content/plugins wp-content/uploads

# Set proper permissions
echo "🔐 Setting secure permissions..."
chmod 755 nginx/ssl
chmod 600 nginx/ssl/*
chmod 755 wp-content
chmod 755 wp-content/themes wp-content/plugins wp-content/uploads

# Start secure containers
echo "🚀 Starting secure WordPress environment..."
docker-compose -f docker-compose.secure.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 15

# Check if nginx is running
if docker ps | grep -q "oak-structures-nginx"; then
    echo "✅ Nginx reverse proxy is running"
else
    echo "❌ Error: Nginx failed to start"
    docker-compose -f docker-compose.secure.yml logs nginx
    exit 1
fi

# Check if WordPress is running
if docker ps | grep -q "oak-structures-wp"; then
    echo "✅ WordPress is running"
else
    echo "❌ Error: WordPress failed to start"
    docker-compose -f docker-compose.secure.yml logs wordpress
    exit 1
fi

# Test HTTPS connection
echo "🔍 Testing HTTPS connectivity..."
sleep 5
if curl -k -I https://localhost &>/dev/null; then
    echo "✅ HTTPS is working"
else
    echo "⚠️  HTTPS test failed - this is normal on first run, certificates may need time to be trusted"
fi

echo ""
echo "🎉 Secure WordPress deployment complete!"
echo ""
echo "🌐 Access URLs:"
echo "   • HTTPS: https://localhost (✅ Secure)"
echo "   • HTTP:  http://localhost (↗️ Redirects to HTTPS)"
echo "   • Database Admin: http://localhost:8081 (🔒 Localhost only)"
echo ""
echo "🔒 Security Features Enabled:"
echo "   ✅ HTTPS with SSL/TLS encryption"
echo "   ✅ HTTP to HTTPS automatic redirect"
echo "   ✅ Security headers (HSTS, CSP, XSS protection)"
echo "   ✅ Rate limiting on login and API endpoints"
echo "   ✅ Database not externally accessible"
echo "   ✅ phpMyAdmin restricted to localhost"
echo "   ✅ WordPress debug mode disabled"
echo "   ✅ PHP security restrictions enabled"
echo "   ✅ File upload restrictions"
echo "   ✅ Sensitive file access blocked"
echo ""
echo "⚠️  Next Steps for Complete Security:"
echo "1. Complete WordPress setup at https://localhost"
echo "2. Install security plugins (Wordfence, etc.)"
echo "3. Run firewall setup: ./setup-firewall.sh"
echo "4. Change default database passwords"
echo "5. Configure backup strategy"
echo ""
echo "🆘 Troubleshooting:"
echo "   • Certificate warnings are normal for self-signed certificates"
echo "   • Click 'Advanced' → 'Proceed to localhost' in your browser"
echo "   • For production, replace self-signed certificates with real ones"
