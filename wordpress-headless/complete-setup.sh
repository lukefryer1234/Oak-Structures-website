#!/bin/bash

echo "🔧 Completing WordPress setup for Oak Structures..."

# Wait for WordPress to be fully ready
echo "⏳ Waiting for WordPress to be fully initialized..."
sleep 10

# Check if WordPress is responding
until curl -f http://localhost:8080 >/dev/null 2>&1; do
    echo "Still waiting for WordPress..."
    sleep 5
done

echo "✅ WordPress is responding!"

# Try to access the API
echo "🔍 Testing WordPress API..."
if curl -f http://localhost:8080/wp-json/wp/v2 >/dev/null 2>&1; then
    echo "✅ WordPress REST API is working!"
else
    echo "⚠️  WordPress needs initial setup. Please visit: http://localhost:8080"
fi

echo ""
echo "🎉 Setup Status:"
echo "   WordPress: http://localhost:8080"
echo "   Admin: http://localhost:8080/wp-admin (after setup)"
echo "   API: http://localhost:8080/wp-json/wp/v2"
echo "   Database: http://localhost:8081"
echo ""
echo "📋 Next Steps:"
echo "1. Visit http://localhost:8080 to complete WordPress installation"
echo "2. Create admin account and set site title to 'Oak Structures CMS'"
echo "3. Log into admin and activate the 'Oak Structures CORS' plugin"
echo "4. Start adding content (Posts, Projects, Services, Testimonials)"
echo ""
echo "💡 Your Next.js app will automatically fetch and display WordPress content!"
echo "   Check WORDPRESS-HEADLESS-GUIDE.md for complete instructions."
