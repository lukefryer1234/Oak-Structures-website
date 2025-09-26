<?php
/**
 * Plugin Name: Oak Structures CORS
 * Plugin URI: https://oak-structures.com
 * Description: Enables CORS for headless WordPress integration with Next.js frontend
 * Version: 1.0.0
 * Author: Oak Structures
 * License: GPL v2 or later
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class OakStructuresCORS {
    
    public function __construct() {
        add_action('init', array($this, 'handle_cors'));
        add_action('rest_api_init', array($this, 'add_cors_headers'));
    }
    
    public function handle_cors() {
        // Handle preflight OPTIONS requests
        if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            $this->send_cors_headers();
            exit;
        }
    }
    
    public function add_cors_headers() {
        $this->send_cors_headers();
    }
    
    private function send_cors_headers() {
        $allowed_origins = array(
            'http://localhost:3000',  // Next.js dev server
            'http://localhost:9003',  // Your custom port
            'https://oak-structures.com',
            'https://www.oak-structures.com'
        );
        
        $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
        
        if (in_array($origin, $allowed_origins)) {
            header('Access-Control-Allow-Origin: ' . $origin);
        }
        
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');
    }
}

// Initialize the plugin
new OakStructuresCORS();

// Add REST API enhancements
add_action('rest_api_init', function() {
    // Add featured image to posts
    register_rest_field('post', 'featured_image_url', array(
        'get_callback' => 'get_featured_image_url',
        'schema' => array(
            'description' => 'Featured image URL',
            'type' => 'string'
        )
    ));
    
    // Add excerpt to pages
    register_rest_field('page', 'excerpt', array(
        'get_callback' => 'get_excerpt',
        'schema' => array(
            'description' => 'Page excerpt',
            'type' => 'string'
        )
    ));
});

function get_featured_image_url($object) {
    $featured_image_id = get_post_thumbnail_id($object['id']);
    if ($featured_image_id) {
        return wp_get_attachment_image_url($featured_image_id, 'large');
    }
    return null;
}

function get_excerpt($object) {
    return get_the_excerpt($object['id']);
}

// Custom post types for Oak Structures
add_action('init', function() {
    // Projects post type
    register_post_type('projects', array(
        'labels' => array(
            'name' => 'Projects',
            'singular_name' => 'Project'
        ),
        'public' => true,
        'show_in_rest' => true,
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt'),
        'menu_icon' => 'dashicons-hammer'
    ));
    
    // Services post type
    register_post_type('services', array(
        'labels' => array(
            'name' => 'Services',
            'singular_name' => 'Service'
        ),
        'public' => true,
        'show_in_rest' => true,
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt'),
        'menu_icon' => 'dashicons-admin-tools'
    ));
    
    // Testimonials post type
    register_post_type('testimonials', array(
        'labels' => array(
            'name' => 'Testimonials',
            'singular_name' => 'Testimonial'
        ),
        'public' => true,
        'show_in_rest' => true,
        'supports' => array('title', 'editor', 'thumbnail'),
        'menu_icon' => 'dashicons-format-quote'
    ));
});
?>
