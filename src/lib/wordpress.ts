/**
 * WordPress Headless API Integration
 * Utilities for fetching content from WordPress REST API
 */

// WordPress API configuration
const WP_API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'http://localhost:8080/index.php?rest_route=/wp/v2';

// TypeScript interfaces for WordPress content
export interface WPPost {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
  };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  author: number;
  featured_media: number;
  featured_image_url?: string;
  comment_status: string;
  ping_status: string;
  sticky: boolean;
  template: string;
  format: string;
  categories: number[];
  tags: number[];
  acf?: any;
  _embedded?: any;
}

export interface WPPage {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
  };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt?: {
    rendered: string;
    protected: boolean;
  };
  author: number;
  featured_media: number;
  featured_image_url?: string;
  parent: number;
  menu_order: number;
  comment_status: string;
  ping_status: string;
  template: string;
  acf?: any;
  _embedded?: any;
}

export interface WPProject {
  id: number;
  date: string;
  slug: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  featured_image_url?: string;
  acf?: {
    project_gallery?: string[];
    project_type?: string;
    completion_date?: string;
    client_name?: string;
    location?: string;
  };
}

export interface WPService {
  id: number;
  date: string;
  slug: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  featured_image_url?: string;
  acf?: {
    service_price?: string;
    service_duration?: string;
    service_features?: string[];
  };
}

export interface WPTestimonial {
  id: number;
  date: string;
  slug: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  acf?: {
    client_name?: string;
    client_company?: string;
    rating?: number;
    project_type?: string;
  };
}

// API Helper Functions
class WordPressAPI {
  private baseUrl: string;

  constructor(baseUrl: string = WP_API_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic fetch function with error handling
   */
  private async fetchAPI(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('WordPress API fetch error:', error);
      throw error;
    }
  }

  /**
   * Get all posts
   */
  async getPosts(params: {
    per_page?: number;
    page?: number;
    orderby?: string;
    order?: 'asc' | 'desc';
    categories?: number[];
    tags?: number[];
    search?: string;
  } = {}): Promise<WPPost[]> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          searchParams.set(key, value.join(','));
        } else {
          searchParams.set(key, value.toString());
        }
      }
    });

    const endpoint = `/posts?${searchParams.toString()}&_embed`;
    return await this.fetchAPI(endpoint);
  }

  /**
   * Get a single post by slug
   */
  async getPostBySlug(slug: string): Promise<WPPost | null> {
    const posts = await this.fetchAPI(`/posts?slug=${slug}&_embed`);
    return posts.length > 0 ? posts[0] : null;
  }

  /**
   * Get all pages
   */
  async getPages(params: {
    per_page?: number;
    page?: number;
    parent?: number;
    orderby?: string;
    order?: 'asc' | 'desc';
  } = {}): Promise<WPPage[]> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, value.toString());
      }
    });

    const endpoint = `/pages?${searchParams.toString()}&_embed`;
    return await this.fetchAPI(endpoint);
  }

  /**
   * Get a single page by slug
   */
  async getPageBySlug(slug: string): Promise<WPPage | null> {
    const pages = await this.fetchAPI(`/pages?slug=${slug}&_embed`);
    return pages.length > 0 ? pages[0] : null;
  }

  /**
   * Get all projects
   */
  async getProjects(params: {
    per_page?: number;
    page?: number;
    orderby?: string;
    order?: 'asc' | 'desc';
  } = {}): Promise<WPProject[]> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, value.toString());
      }
    });

    const endpoint = `/projects?${searchParams.toString()}&_embed`;
    return await this.fetchAPI(endpoint);
  }

  /**
   * Get a single project by slug
   */
  async getProjectBySlug(slug: string): Promise<WPProject | null> {
    const projects = await this.fetchAPI(`/projects?slug=${slug}&_embed`);
    return projects.length > 0 ? projects[0] : null;
  }

  /**
   * Get all services
   */
  async getServices(params: {
    per_page?: number;
    page?: number;
    orderby?: string;
    order?: 'asc' | 'desc';
  } = {}): Promise<WPService[]> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, value.toString());
      }
    });

    const endpoint = `/services?${searchParams.toString()}&_embed`;
    return await this.fetchAPI(endpoint);
  }

  /**
   * Get all testimonials
   */
  async getTestimonials(params: {
    per_page?: number;
    page?: number;
    orderby?: string;
    order?: 'asc' | 'desc';
  } = {}): Promise<WPTestimonial[]> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, value.toString());
      }
    });

    const endpoint = `/testimonials?${searchParams.toString()}&_embed`;
    return await this.fetchAPI(endpoint);
  }

  /**
   * Search content across all post types
   */
  async search(query: string, params: {
    type?: string[];
    per_page?: number;
  } = {}): Promise<any[]> {
    const searchParams = new URLSearchParams();
    searchParams.set('search', query);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          searchParams.set(key, value.join(','));
        } else {
          searchParams.set(key, value.toString());
        }
      }
    });

    const endpoint = `/search?${searchParams.toString()}`;
    return await this.fetchAPI(endpoint);
  }
}

// Create and export the API instance
export const wpApi = new WordPressAPI();

// Utility functions for Next.js
export async function getStaticProps() {
  try {
    const posts = await wpApi.getPosts({ per_page: 10 });
    const pages = await wpApi.getPages();
    const projects = await wpApi.getProjects({ per_page: 6 });
    const services = await wpApi.getServices();
    const testimonials = await wpApi.getTestimonials({ per_page: 5 });

    return {
      props: {
        posts,
        pages,
        projects,
        services,
        testimonials,
      },
      revalidate: 60, // Regenerate at most once per minute
    };
  } catch (error) {
    console.error('Error fetching WordPress data:', error);
    return {
      props: {
        posts: [],
        pages: [],
        projects: [],
        services: [],
        testimonials: [],
      },
      revalidate: 60,
    };
  }
}

// Helper function to strip HTML tags from content
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

// Helper function to truncate content
export function truncateContent(content: string, length: number = 150): string {
  const stripped = stripHtml(content);
  return stripped.length > length ? `${stripped.substring(0, length)}...` : stripped;
}
