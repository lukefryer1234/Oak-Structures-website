'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Edit, Eye, Plus } from 'lucide-react'

export default function VisualEditorDashboard() {
  const [builderConfigured, setBuilderConfigured] = useState(false)

  useEffect(() => {
    // Check if Builder.io API key is configured
    setBuilderConfigured(!!process.env.NEXT_PUBLIC_BUILDER_API_KEY && 
      process.env.NEXT_PUBLIC_BUILDER_API_KEY !== 'bpk-placeholder')
  }, [])

  const dashboardSections = [
    {
      title: 'Visual Page Editor',
      description: 'Edit your website pages with drag-and-drop visual editor',
      status: builderConfigured ? 'ready' : 'setup-needed',
      actions: [
        {
          label: 'Open Builder.io Editor',
          href: builderConfigured ? 'https://builder.io/content' : '#',
          external: true,
          icon: <Edit className="w-4 h-4" />
        },
        {
          label: 'Create New Page',
          href: builderConfigured ? 'https://builder.io/content/page' : '#',
          external: true,
          icon: <Plus className="w-4 h-4" />
        }
      ]
    },
    {
      title: 'Content Management',
      description: 'Manage your content through WordPress admin',
      status: 'ready',
      actions: [
        {
          label: 'WordPress Admin',
          href: 'http://localhost:8080/wp-admin',
          external: true,
          icon: <Edit className="w-4 h-4" />
        },
        {
          label: 'View Content API',
          href: 'http://localhost:8080/index.php?rest_route=/wp/v2',
          external: true,
          icon: <Eye className="w-4 h-4" />
        }
      ]
    },
    {
      title: 'Website Preview',
      description: 'Preview your live website and editable pages',
      status: 'ready',
      actions: [
        {
          label: 'View Homepage',
          href: '/',
          external: false,
          icon: <Eye className="w-4 h-4" />
        },
        {
          label: 'Builder Pages',
          href: '/builder/home',
          external: false,
          icon: <Eye className="w-4 h-4" />
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Oak Structures Visual Editor
          </h1>
          <p className="text-lg text-gray-600">
            Edit your website visually with live preview and one-click publishing
          </p>
        </div>

        {/* Setup Alert */}
        {!builderConfigured && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Setup Required:</strong> To enable visual editing, you need to:
                  <br />
                  1. Create a free account at <a href="https://builder.io" className="underline" target="_blank">builder.io</a>
                  <br />
                  2. Get your API key and add it to your environment variables
                  <br />
                  3. Add <code className="bg-yellow-100 px-1">NEXT_PUBLIC_BUILDER_API_KEY=your_key_here</code> to .env.local
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {dashboardSections.map((section, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                  <Badge 
                    variant={section.status === 'ready' ? 'default' : 'secondary'}
                    className={section.status === 'ready' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {section.status === 'ready' ? 'Ready' : 'Setup Needed'}
                  </Badge>
                </div>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {section.actions.map((action, actionIndex) => (
                    <Button
                      key={actionIndex}
                      variant="outline"
                      className="w-full justify-start"
                      asChild={section.status === 'ready'}
                      disabled={section.status !== 'ready'}
                    >
                      <a 
                        href={action.href}
                        target={action.external ? '_blank' : '_self'}
                        rel={action.external ? 'noopener noreferrer' : undefined}
                        className="flex items-center gap-2"
                      >
                        {action.icon}
                        {action.label}
                        {action.external && <ExternalLink className="w-4 h-4 ml-auto" />}
                      </a>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Start Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Start Guide</CardTitle>
            <CardDescription>Get started with visual editing in 3 steps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Set up Builder.io Account</h3>
                  <p className="text-gray-600">
                    Create a free account at builder.io and get your API key to enable visual editing.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Edit Content Visually</h3>
                  <p className="text-gray-600">
                    Use the Builder.io visual editor to drag and drop components, edit text, and upload images.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Publish Changes</h3>
                  <p className="text-gray-600">
                    Preview your changes in real-time and publish them instantly to your live website.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
