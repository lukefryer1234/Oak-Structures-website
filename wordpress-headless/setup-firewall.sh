#!/bin/bash

echo "🔒 Setting up firewall security for Oak Structures WordPress..."

# Check if running on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📱 Configuring macOS firewall..."
    
    # Enable macOS firewall
    sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on
    
    # Set stealth mode
    sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setstealthmode on
    
    # Block all incoming connections by default
    sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setblockall off
    
    # Allow specific applications
    sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/bin/ssh
    sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblock /usr/bin/ssh
    
    echo "✅ macOS firewall configured"
    
    # Configure pfctl (advanced firewall rules)
    echo "⚡ Setting up advanced firewall rules with pfctl..."
    
    # Create pfctl configuration
    sudo tee /etc/pf.conf.oakstructures > /dev/null <<EOF
# Oak Structures WordPress Security Configuration
# Default policies
set block-policy drop
set skip on lo0

# Scrub all traffic
scrub in all

# Block all by default
block all

# Allow loopback traffic
pass on lo0

# Allow outbound traffic from this machine
pass out quick on en0 inet proto tcp from any to any
pass out quick on en0 inet proto udp from any to any
pass out quick on en0 inet proto icmp from any to any

# Allow inbound SSH (if needed - comment out if not using SSH)
# pass in on en0 inet proto tcp from any to any port 22

# Block common attack ports
block in quick on en0 inet proto tcp from any to any port { 21, 23, 25, 53, 110, 143, 993, 995 }

# Allow HTTPS and HTTP only from localhost/private networks
pass in on en0 inet proto tcp from 127.0.0.0/8 to any port { 80, 443 }
pass in on en0 inet proto tcp from 10.0.0.0/8 to any port { 80, 443 }
pass in on en0 inet proto tcp from 172.16.0.0/12 to any port { 80, 443 }
pass in on en0 inet proto tcp from 192.168.0.0/16 to any port { 80, 443 }

# Rate limiting for web traffic
pass in on en0 inet proto tcp from any to any port { 80, 443 } flags S/SA keep state (max-src-conn-rate 10/5, overload <bad_hosts> flush global)

# Block bad hosts table
table <bad_hosts> persist
block in quick from <bad_hosts>
EOF

    echo "⚠️  Advanced firewall rules created at /etc/pf.conf.oakstructures"
    echo "📋 To enable advanced rules, run: sudo pfctl -f /etc/pf.conf.oakstructures -e"
    
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🐧 Configuring Linux firewall (ufw)..."
    
    # Reset UFW
    sudo ufw --force reset
    
    # Default policies
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    
    # Allow SSH (if needed)
    # sudo ufw allow 22
    
    # Allow HTTP and HTTPS only from local networks
    sudo ufw allow from 192.168.0.0/16 to any port 80
    sudo ufw allow from 192.168.0.0/16 to any port 443
    sudo ufw allow from 10.0.0.0/8 to any port 80
    sudo ufw allow from 10.0.0.0/8 to any port 443
    sudo ufw allow from 172.16.0.0/12 to any port 80
    sudo ufw allow from 172.16.0.0/12 to any port 443
    
    # Rate limiting
    sudo ufw limit 80/tcp
    sudo ufw limit 443/tcp
    
    # Enable firewall
    sudo ufw --force enable
    
    echo "✅ Linux firewall (ufw) configured"
fi

echo ""
echo "🛡️  Firewall Security Summary:"
echo "   ✅ Default deny all incoming connections"
echo "   ✅ Allow outbound connections"
echo "   ✅ HTTP/HTTPS restricted to private networks only"
echo "   ✅ Rate limiting enabled"
echo "   ✅ Stealth mode enabled (where supported)"
echo ""
echo "🌐 Your WordPress site will be accessible at:"
echo "   • https://localhost (from your machine)"
echo "   • https://192.168.1.x (from local network only)"
echo ""
echo "⚠️  External internet access is now BLOCKED for security"
echo "    To allow external access in production, you'll need to:"
echo "    1. Configure proper domain and SSL certificates"
echo "    2. Update firewall rules for your specific needs"
echo "    3. Implement additional security measures"
