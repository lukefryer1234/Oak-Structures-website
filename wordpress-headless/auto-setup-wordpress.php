<?php
/**
 * Automated WordPress Setup Script
 * This script will automatically configure WordPress with default settings
 */

// WordPress configuration
define('WP_USE_THEMES', false);

// Set up the WordPress environment
require_once('/var/www/html/wp-config.php');
require_once('/var/www/html/wp-includes/wp-db.php');
require_once('/var/www/html/wp-admin/includes/upgrade.php');
require_once('/var/www/html/wp-includes/functions.php');
require_once('/var/www/html/wp-includes/user.php');
require_once('/var/www/html/wp-includes/pluggable.php');

// Site configuration
$site_title = 'Oak Structures CMS';
$admin_user = 'admin';
$admin_password = 'OakAdmin2024!';
$admin_email = 'admin@oak-structures.local';
$site_url = 'http://localhost:8080';

echo "Setting up WordPress for Oak Structures...\n";

// Check if WordPress is already installed
if (is_blog_installed()) {
    echo "WordPress is already installed!\n";
    exit(0);
}

// Install WordPress
$result = wp_install($site_title, $admin_user, $admin_email, true, '', wp_hash_password($admin_password));

if (is_wp_error($result)) {
    echo "Error installing WordPress: " . $result->get_error_message() . "\n";
    exit(1);
}

echo "WordPress installed successfully!\n";

// Update site URL options
update_option('siteurl', $site_url);
update_option('home', $site_url);

// Set up permalink structure
update_option('permalink_structure', '/%postname%/');

// Enable REST API (should be enabled by default in modern WordPress)
update_option('users_can_register', 0);

// Set timezone
update_option('timezone_string', 'Europe/London');

// Set date and time formats
update_option('date_format', 'F j, Y');
update_option('time_format', 'g:i a');

// Enable comments on posts
update_option('default_comment_status', 'open');

// Disable trackbacks
update_option('default_ping_status', 'closed');

echo "WordPress configuration completed!\n";
echo "Login Details:\n";
echo "URL: http://localhost:8080/wp-admin\n";
echo "Username: $admin_user\n";
echo "Password: $admin_password\n";

?>
