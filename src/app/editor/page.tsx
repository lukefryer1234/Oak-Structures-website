'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Save, Eye, Monitor, Smartphone, Tablet, Edit3, Image, Type, Layout, Palette } from 'lucide-react'

interface EditableContent {
  id: string
  type: 'text' | 'image' | 'title' | 'description'
  content: string
  label: string
}

export default function VisualEditor() {
  const [isEditing, setIsEditing] = useState(false)
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [hasChanges, setHasChanges] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const [editableContent, setEditableContent] = useState<EditableContent[]>([
    {
      id: 'hero-title',
      type: 'title',
      content: 'Premium Oak Structures & Timber Construction',
      label: 'Main Heading'
    },
    {
      id: 'hero-subtitle',
      type: 'text',
      content: 'Crafting bespoke timber solutions with traditional techniques and modern design',
      label: 'Hero Subtitle'
    },
    {
      id: 'about-text',
      type: 'description',
      content: 'Oak Structures specializes in high-quality timber construction, from kitchen extensions to garden structures. Our expert craftsmen combine time-honored techniques with contemporary design to create lasting, beautiful solutions for your home.',
      label: 'About Description'
    },
    {
      id: 'services-title',
      type: 'title',
      content: 'Our Services',
      label: 'Services Section Title'
    },
    {
      id: 'contact-title',
      type: 'title',
      content: 'Get In Touch',
      label: 'Contact Section Title'
    }
  ])

  const updateContent = (id: string, newContent: string) => {
    setEditableContent(prev => 
      prev.map(item => 
        item.id === id ? { ...item, content: newContent } : item
      )
    )
    setHasChanges(true)

    // Send message to iframe to update content
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'UPDATE_CONTENT',
        id: id,
        content: newContent
      }, '*')
    }
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    
    // Simulate publishing delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Here you would typically save to your CMS/database
    console.log('Publishing changes:', editableContent)
    
    setHasChanges(false)
    setIsPublishing(false)
    
    // Show success message
    alert('Changes published successfully!')
  }

  const getCurrentContent = (id: string) => {
    return editableContent.find(item => item.id === id)?.content || ''
  }

  const getPreviewStyles = () => {
    switch (previewMode) {
      case 'mobile':
        return 'w-[375px] h-[667px]'
      case 'tablet':
        return 'w-[768px] h-[1024px]'
      default:
        return 'w-full h-full'
    }
  }

  useEffect(() => {
    // Listen for messages from the iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'ELEMENT_CLICKED') {
        setSelectedElement(event.data.id)
        setIsEditing(true)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  return (
    <div className="h-screen bg-gray-100 flex">
      {/* Website Preview Side */}
      <div className="flex-1 bg-white border-r border-gray-300 flex flex-col">
        {/* Preview Controls */}
        <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-800">Website Preview</h2>
            <Badge variant={hasChanges ? 'destructive' : 'secondary'}>
              {hasChanges ? 'Unsaved Changes' : 'Up to Date'}
            </Badge>
          </div>
          
          {/* Device Preview Buttons */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={previewMode === 'desktop' ? 'default' : 'outline'}
              onClick={() => setPreviewMode('desktop')}
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={previewMode === 'tablet' ? 'default' : 'outline'}
              onClick={() => setPreviewMode('tablet')}
            >
              <Tablet className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={previewMode === 'mobile' ? 'default' : 'outline'}
              onClick={() => setPreviewMode('mobile')}
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 p-4 overflow-auto bg-gray-50">
          <div className={`mx-auto bg-white shadow-lg ${getPreviewStyles()} transition-all duration-300`}>
            <div className="h-full overflow-auto">
              {/* Simulated Website Content */}
              <div className="min-h-full">
                {/* Hero Section */}
                <section 
                  className="relative h-96 bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center text-center px-8 cursor-pointer hover:bg-gradient-to-br hover:from-amber-100 hover:to-amber-150 transition-colors"
                  onClick={() => {
                    setSelectedElement('hero-title')
                    setIsEditing(true)
                  }}
                >
                  <div className="max-w-4xl">
                    <h1 
                      className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 hover:outline hover:outline-2 hover:outline-blue-500 hover:outline-dashed p-2 rounded"
                      data-editable-id="hero-title"
                    >
                      {getCurrentContent('hero-title')}
                    </h1>
                    <p 
                      className="text-xl text-gray-700 hover:outline hover:outline-2 hover:outline-blue-500 hover:outline-dashed p-2 rounded cursor-pointer"
                      data-editable-id="hero-subtitle"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedElement('hero-subtitle')
                        setIsEditing(true)
                      }}
                    >
                      {getCurrentContent('hero-subtitle')}
                    </p>
                    <Button className="mt-6 bg-amber-600 hover:bg-amber-700">
                      Get Free Quote
                    </Button>
                  </div>
                </section>

                {/* About Section */}
                <section className="py-16 px-8 bg-white">
                  <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">About Oak Structures</h2>
                    <p 
                      className="text-lg text-gray-600 text-center max-w-4xl mx-auto leading-relaxed hover:outline hover:outline-2 hover:outline-blue-500 hover:outline-dashed p-2 rounded cursor-pointer"
                      data-editable-id="about-text"
                      onClick={() => {
                        setSelectedElement('about-text')
                        setIsEditing(true)
                      }}
                    >
                      {getCurrentContent('about-text')}
                    </p>
                  </div>
                </section>

                {/* Services Section */}
                <section className="py-16 px-8 bg-gray-50">
                  <div className="max-w-6xl mx-auto">
                    <h2 
                      className="text-3xl font-bold text-center mb-12 text-gray-900 hover:outline hover:outline-2 hover:outline-blue-500 hover:outline-dashed p-2 rounded cursor-pointer"
                      data-editable-id="services-title"
                      onClick={() => {
                        setSelectedElement('services-title')
                        setIsEditing(true)
                      }}
                    >
                      {getCurrentContent('services-title')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {[
                        { title: 'Kitchen Extensions', desc: 'Custom kitchen extensions with exposed oak beams', price: 'From £25,000' },
                        { title: 'Garden Structures', desc: 'Gazebos, pergolas, and outdoor entertaining spaces', price: 'From £3,500' },
                        { title: 'Oak Flooring', desc: 'Premium solid oak flooring installation', price: 'From £45/sq ft' }
                      ].map((service, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <CardTitle>{service.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600 mb-4">{service.desc}</p>
                            <p className="font-semibold text-amber-600">{service.price}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Contact Section */}
                <section className="py-16 px-8 bg-amber-50">
                  <div className="max-w-4xl mx-auto text-center">
                    <h2 
                      className="text-3xl font-bold mb-8 text-gray-900 hover:outline hover:outline-2 hover:outline-blue-500 hover:outline-dashed p-2 rounded cursor-pointer"
                      data-editable-id="contact-title"
                      onClick={() => {
                        setSelectedElement('contact-title')
                        setIsEditing(true)
                      }}
                    >
                      {getCurrentContent('contact-title')}
                    </h2>
                    <p className="text-lg text-gray-700 mb-8">
                      Ready to start your timber construction project? Contact us for a free consultation.
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 justify-center">
                      <Button size="lg" className="bg-amber-600 hover:bg-amber-700">
                        Call: 01234 567890
                      </Button>
                      <Button size="lg" variant="outline">
                        Email: info@oak-structures.com
                      </Button>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Controls Side */}
      <div className="w-96 bg-white border-l border-gray-300 flex flex-col">
        {/* Editor Header */}
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Visual Editor</h2>
            <Button 
              onClick={handlePublish}
              disabled={!hasChanges || isPublishing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isPublishing ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Publishing...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Publish Changes
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Click on any text or section in the preview to edit it
          </p>
        </div>

        {/* Editor Tabs */}
        <div className="flex-1 overflow-auto">
          <Tabs defaultValue="content" className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content" className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                Content
              </TabsTrigger>
              <TabsTrigger value="design" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Design
              </TabsTrigger>
              <TabsTrigger value="layout" className="flex items-center gap-2">
                <Layout className="w-4 h-4" />
                Layout
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="p-4 space-y-6">
              {selectedElement ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Edit3 className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold">
                      Editing: {editableContent.find(item => item.id === selectedElement)?.label}
                    </h3>
                  </div>
                  
                  {editableContent.find(item => item.id === selectedElement)?.type === 'title' ? (
                    <div>
                      <Label htmlFor="content-input">Title Text</Label>
                      <Input
                        id="content-input"
                        value={getCurrentContent(selectedElement)}
                        onChange={(e) => updateContent(selectedElement, e.target.value)}
                        className="mt-1"
                        placeholder="Enter title..."
                      />
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="content-textarea">Content Text</Label>
                      <Textarea
                        id="content-textarea"
                        value={getCurrentContent(selectedElement)}
                        onChange={(e) => updateContent(selectedElement, e.target.value)}
                        className="mt-1 min-h-[100px]"
                        placeholder="Enter content..."
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Edit3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Click on any text in the preview to start editing</p>
                </div>
              )}

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Quick Edit</h3>
                <div className="space-y-3">
                  {editableContent.map((item) => (
                    <Button
                      key={item.id}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        setSelectedElement(item.id)
                        setIsEditing(true)
                      }}
                    >
                      <Type className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="design" className="p-4">
              <div className="space-y-6">
                <h3 className="font-semibold">Design Controls</h3>
                <p className="text-sm text-gray-600">
                  Design customization features will be available here, including:
                </p>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Color schemes</li>
                  <li>• Typography settings</li>
                  <li>• Button styles</li>
                  <li>• Background options</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="layout" className="p-4">
              <div className="space-y-6">
                <h3 className="font-semibold">Layout Options</h3>
                <p className="text-sm text-gray-600">
                  Layout customization features will be available here, including:
                </p>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Section ordering</li>
                  <li>• Column layouts</li>
                  <li>• Spacing controls</li>
                  <li>• Responsive settings</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
