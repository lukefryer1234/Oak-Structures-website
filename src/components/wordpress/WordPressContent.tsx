'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { wpApi, WPPost, WPProject, WPService, WPTestimonial, stripHtml, truncateContent } from '@/lib/wordpress'
import { CalendarDays, ExternalLink, Star } from 'lucide-react'

// Blog Posts Component
export function BlogPosts({ initialPosts = [], showAll = false }: { 
  initialPosts?: WPPost[], 
  showAll?: boolean 
}) {
  const [posts, setPosts] = useState<WPPost[]>(initialPosts)
  const [loading, setLoading] = useState(!initialPosts.length)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!initialPosts.length) {
      loadPosts()
    }
  }, [initialPosts.length])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const fetchedPosts = await wpApi.getPosts({ 
        per_page: showAll ? 100 : 6,
        orderby: 'date',
        order: 'desc'
      })
      setPosts(fetchedPosts)
    } catch (err) {
      setError('Failed to load blog posts')
      console.error('Error loading posts:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <Button onClick={loadPosts} className="mt-4">Try Again</Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          {post.featured_image_url && (
            <div className="relative h-48 overflow-hidden">
              <Image
                src={post.featured_image_url}
                alt={stripHtml(post.title.rendered)}
                fill
                className="object-cover transition-transform hover:scale-105"
              />
            </div>
          )}
          <CardHeader>
            <CardTitle className="line-clamp-2">
              <Link href={`/blog/${post.slug}`} className="hover:text-primary">
                {stripHtml(post.title.rendered)}
              </Link>
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {new Date(post.date).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {truncateContent(post.excerpt.rendered, 120)}
            </p>
            <Button asChild size="sm" className="mt-4">
              <Link href={`/blog/${post.slug}`}>
                Read More <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Projects Component
export function ProjectsGrid({ initialProjects = [], showAll = false }: { 
  initialProjects?: WPProject[], 
  showAll?: boolean 
}) {
  const [projects, setProjects] = useState<WPProject[]>(initialProjects)
  const [loading, setLoading] = useState(!initialProjects.length)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!initialProjects.length) {
      loadProjects()
    }
  }, [initialProjects.length])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const fetchedProjects = await wpApi.getProjects({ 
        per_page: showAll ? 100 : 8,
        orderby: 'date',
        order: 'desc'
      })
      setProjects(fetchedProjects)
    } catch (err) {
      setError('Failed to load projects')
      console.error('Error loading projects:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <Button onClick={loadProjects} className="mt-4">Try Again</Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {projects.map((project) => (
        <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          {project.featured_image_url && (
            <div className="relative h-48 overflow-hidden">
              <Image
                src={project.featured_image_url}
                alt={stripHtml(project.title.rendered)}
                fill
                className="object-cover transition-transform hover:scale-105"
              />
            </div>
          )}
          <CardHeader>
            <CardTitle className="line-clamp-2">
              <Link href={`/projects/${project.slug}`} className="hover:text-primary">
                {stripHtml(project.title.rendered)}
              </Link>
            </CardTitle>
            {project.acf?.project_type && (
              <Badge variant="secondary">{project.acf.project_type}</Badge>
            )}
            {project.acf?.location && (
              <CardDescription>{project.acf.location}</CardDescription>
            )}
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

// Services Component
export function ServicesGrid({ initialServices = [] }: { initialServices?: WPService[] }) {
  const [services, setServices] = useState<WPService[]>(initialServices)
  const [loading, setLoading] = useState(!initialServices.length)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!initialServices.length) {
      loadServices()
    }
  }, [initialServices.length])

  const loadServices = async () => {
    try {
      setLoading(true)
      const fetchedServices = await wpApi.getServices({
        orderby: 'menu_order',
        order: 'asc'
      })
      setServices(fetchedServices)
    } catch (err) {
      setError('Failed to load services')
      console.error('Error loading services:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <Button onClick={loadServices} className="mt-4">Try Again</Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <Card key={service.id} className="hover:shadow-lg transition-shadow">
          {service.featured_image_url && (
            <div className="relative h-48 overflow-hidden">
              <Image
                src={service.featured_image_url}
                alt={stripHtml(service.title.rendered)}
                fill
                className="object-cover"
              />
            </div>
          )}
          <CardHeader>
            <CardTitle>{stripHtml(service.title.rendered)}</CardTitle>
            {service.acf?.service_price && (
              <Badge variant="outline">{service.acf.service_price}</Badge>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {truncateContent(service.content.rendered, 150)}
            </p>
            {service.acf?.service_features && (
              <ul className="text-sm space-y-1">
                {service.acf.service_features.slice(0, 3).map((feature: string, index: number) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Testimonials Component
export function TestimonialsCarousel({ initialTestimonials = [] }: { initialTestimonials?: WPTestimonial[] }) {
  const [testimonials, setTestimonials] = useState<WPTestimonial[]>(initialTestimonials)
  const [loading, setLoading] = useState(!initialTestimonials.length)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!initialTestimonials.length) {
      loadTestimonials()
    }
  }, [initialTestimonials.length])

  const loadTestimonials = async () => {
    try {
      setLoading(true)
      const fetchedTestimonials = await wpApi.getTestimonials({
        per_page: 10,
        orderby: 'date',
        order: 'desc'
      })
      setTestimonials(fetchedTestimonials)
    } catch (err) {
      setError('Failed to load testimonials')
      console.error('Error loading testimonials:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            <Skeleton className="h-6 w-1/2" />
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <Button onClick={loadTestimonials} className="mt-4">Try Again</Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {testimonials.map((testimonial) => (
        <Card key={testimonial.id} className="p-6 hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            {testimonial.acf?.rating && (
              <div className="flex mb-4">
                {[...Array(testimonial.acf.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            )}
            <blockquote className="text-lg mb-4">
              "{stripHtml(testimonial.content.rendered)}"
            </blockquote>
            <div className="text-sm">
              <p className="font-semibold">
                {testimonial.acf?.client_name || stripHtml(testimonial.title.rendered)}
              </p>
              {testimonial.acf?.client_company && (
                <p className="text-muted-foreground">{testimonial.acf.client_company}</p>
              )}
              {testimonial.acf?.project_type && (
                <Badge variant="secondary" className="mt-2">
                  {testimonial.acf.project_type}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
