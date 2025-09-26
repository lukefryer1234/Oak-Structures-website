# WordPress Headless CMS Integration Guide

## Overview

Your Oak Structures website now has a complete headless WordPress integration! This allows you to:
- Keep your fast Next.js frontend
- Use WordPress as a user-friendly content management system
- Manage blog posts, projects, services, and testimonials from WordPress admin
- Automatically sync content to your Next.js site

## Quick Start

### 1. WordPress Setup (Already Done!)
Your WordPress installation is running at:
- **WordPress Admin**: http://localhost:8080/wp-admin
- **Frontend**: http://localhost:8080
- **API**: http://localhost:8080/wp-json/wp/v2
- **Database Admin**: http://localhost:8081 (phpMyAdmin)

### 2. Complete WordPress Installation
1. Visit http://localhost:8080
2. Follow the WordPress installation wizard:
   - Site Title: "Oak Structures CMS"
   - Username: Choose your admin username
   - Password: Create a strong password
   - Email: Your email address

### 3. Activate Custom Plugin
1. Log into WordPress Admin
2. Go to Plugins → Installed Plugins
3. Activate "Oak Structures CORS" plugin
4. This enables your custom post types and API access

## Content Management

### Available Content Types

#### 1. Blog Posts (Standard WordPress)
- **URL**: wp-admin → Posts
- **API**: `/wp-json/wp/v2/posts`
- **Features**: Title, content, excerpt, featured image, categories, tags

#### 2. Projects (Custom Post Type)
- **URL**: wp-admin → Projects
- **API**: `/wp-json/wp/v2/projects`
- **Custom Fields**: Project type, completion date, client name, location, gallery

#### 3. Services (Custom Post Type)
- **URL**: wp-admin → Services
- **API**: `/wp-json/wp/v2/services`
- **Custom Fields**: Service price, duration, features list

#### 4. Testimonials (Custom Post Type)
- **URL**: wp-admin → Testimonials
- **API**: `/wp-json/wp/v2/testimonials`
- **Custom Fields**: Client name, company, rating (1-5 stars), project type

### Adding Content

1. **Blog Posts**:
   ```
   wp-admin → Posts → Add New
   - Title: Your post title
   - Content: Full article content
   - Excerpt: Short description
   - Featured Image: Main image for the post
   - Categories/Tags: For organization
   ```

2. **Projects**:
   ```
   wp-admin → Projects → Add New
   - Title: Project name
   - Content: Project description
   - Featured Image: Main project image
   - Custom Fields (if ACF is installed):
     - Project Type: e.g., "Kitchen Extension"
     - Location: e.g., "Cardiff, Wales"
     - Client Name: Client reference
     - Completion Date: When finished
   ```

3. **Services**:
   ```
   wp-admin → Services → Add New
   - Title: Service name
   - Content: Service description
   - Featured Image: Service image
   - Custom Fields:
     - Service Price: e.g., "From £500"
     - Duration: e.g., "2-3 days"
     - Features: List of service features
   ```

## Using in Next.js

### Import Components
```typescript
import { 
  BlogPosts, 
  ProjectsGrid, 
  ServicesGrid, 
  TestimonialsCarousel 
} from '@/components/wordpress/WordPressContent'
```

### Example Usage

#### Homepage Integration
```typescript
// app/page.tsx
import { BlogPosts, ProjectsGrid, TestimonialsCarousel } from '@/components/wordpress/WordPressContent'

export default function Homepage() {
  return (
    <div>
      {/* Latest Projects */}
      <section className="py-16">
        <h2 className="text-3xl font-bold mb-8">Recent Projects</h2>
        <ProjectsGrid showAll={false} />
      </section>

      {/* Latest Blog Posts */}
      <section className="py-16">
        <h2 className="text-3xl font-bold mb-8">Latest News</h2>
        <BlogPosts showAll={false} />
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <h2 className="text-3xl font-bold mb-8">What Our Clients Say</h2>
        <TestimonialsCarousel />
      </section>
    </div>
  )
}
```

#### Blog Page
```typescript
// app/blog/page.tsx
import { BlogPosts } from '@/components/wordpress/WordPressContent'

export default function BlogPage() {
  return (
    <div>
      <h1>Our Blog</h1>
      <BlogPosts showAll={true} />
    </div>
  )
}
```

### API Integration

#### Using the WordPress API Directly
```typescript
import { wpApi } from '@/lib/wordpress'

// Get latest posts
const posts = await wpApi.getPosts({ per_page: 5 })

// Get specific post
const post = await wpApi.getPostBySlug('your-post-slug')

// Get projects
const projects = await wpApi.getProjects({ per_page: 8 })

// Search content
const results = await wpApi.search('kitchen renovation')
```

#### Using Next.js API Routes
```typescript
// Client-side fetching
const response = await fetch('/api/wordpress/posts?per_page=10')
const { data: posts } = await response.json()
```

## Development Workflow

### Daily Content Management
1. **Add Content**: Use WordPress admin to add/edit content
2. **Preview**: Content appears automatically on your Next.js site
3. **No Deployment Needed**: Changes are live immediately in development

### Content Creation Best Practices

#### Blog Posts
- Use clear, descriptive titles
- Add featured images (recommended: 1200x800px)
- Write compelling excerpts for preview cards
- Use categories for organization

#### Projects
- Include high-quality before/after images
- Fill in all custom fields for rich display
- Use consistent project type naming
- Add location information for local SEO

#### Services
- Be clear about pricing and duration
- List key features/benefits
- Include relevant images
- Keep descriptions concise but informative

### SEO & Performance

The integration includes:
- ✅ Automatic image optimization via Next.js
- ✅ SEO-friendly URLs (/blog/post-slug)
- ✅ Fast loading with static generation
- ✅ Responsive design
- ✅ Search functionality

## Advanced Customization

### Adding Custom Fields (Recommended: ACF Plugin)

1. Install Advanced Custom Fields (ACF) plugin in WordPress
2. Create field groups for your post types
3. Fields automatically appear in the API

### Custom Post Types

To add new post types, edit:
`wordpress-headless/wp-content/plugins/oak-structures-cors/oak-structures-cors.php`

Example:
```php
register_post_type('portfolio', array(
    'labels' => array(
        'name' => 'Portfolio',
        'singular_name' => 'Portfolio Item'
    ),
    'public' => true,
    'show_in_rest' => true, // Important for API access
    'supports' => array('title', 'editor', 'thumbnail', 'excerpt'),
    'menu_icon' => 'dashicons-portfolio'
));
```

### Custom API Endpoints

Add to `wordpress-headless/wp-content/plugins/oak-structures-cors/oak-structures-cors.php`:
```php
add_action('rest_api_init', function() {
    register_rest_route('oak-structures/v1', '/featured-projects', array(
        'methods' => 'GET',
        'callback' => 'get_featured_projects',
    ));
});

function get_featured_projects() {
    $posts = get_posts(array(
        'post_type' => 'projects',
        'meta_key' => 'featured',
        'meta_value' => 'yes',
        'numberposts' => 6
    ));
    
    return rest_ensure_response($posts);
}
```

## Production Deployment

### WordPress Hosting
For production, you'll need:
1. **WordPress Hosting**: Any standard WordPress host (WP Engine, SiteGround, etc.)
2. **Custom Domain**: e.g., `cms.oak-structures.com`
3. **SSL Certificate**: Ensure HTTPS

### Environment Variables Update
```bash
# .env.production
NEXT_PUBLIC_WP_API_URL="https://cms.oak-structures.com/wp-json/wp/v2"
NEXT_PUBLIC_WP_SITE_URL="https://cms.oak-structures.com"
```

### CORS Configuration
Update the CORS plugin with your production domains:
```php
$allowed_origins = array(
    'http://localhost:3000',
    'http://localhost:9003',
    'https://oak-structures.com',
    'https://www.oak-structures.com',
    'https://your-production-domain.com'
);
```

## Troubleshooting

### WordPress Not Loading
```bash
cd wordpress-headless
docker-compose down
docker-compose up -d
```

### API Errors
1. Check WordPress is running: http://localhost:8080
2. Test API directly: http://localhost:8080/wp-json/wp/v2/posts
3. Check CORS plugin is activated
4. Verify environment variables

### Content Not Appearing
1. Ensure posts are published (not draft)
2. Check post type is set to `show_in_rest => true`
3. Verify API permissions

### CORS Issues
1. Activate the Oak Structures CORS plugin
2. Check allowed origins in plugin settings
3. Clear browser cache

## Support

### Useful Commands

```bash
# Start WordPress
cd wordpress-headless && docker-compose up -d

# Stop WordPress  
cd wordpress-headless && docker-compose down

# View logs
cd wordpress-headless && docker-compose logs wordpress

# Backup database
docker exec oak-structures-wp-db mysqldump -u wpuser -pwppass123 oak_structures_wp > backup.sql

# Restore database
docker exec -i oak-structures-wp-db mysql -u wpuser -pwppass123 oak_structures_wp < backup.sql
```

### WordPress Admin Access
- URL: http://localhost:8080/wp-admin
- Complete setup wizard on first visit
- Install recommended plugins: ACF, Yoast SEO

### Database Access
- URL: http://localhost:8081
- Server: oak-structures-wp-db
- Username: wpuser
- Password: wppass123
- Database: oak_structures_wp

---

🎉 **Your headless WordPress integration is complete!** 

Visit http://localhost:8080 to set up WordPress and start adding content. Your Next.js app will automatically display the content using the beautiful components we've created.
