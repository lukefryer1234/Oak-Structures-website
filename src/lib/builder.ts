import { builder } from '@builder.io/sdk'
import { BuilderComponent } from '@builder.io/react'

// Initialize Builder with your public API key
// You'll get this key when you create a free Builder.io account
builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY || 'bpk-placeholder')

// Custom components that can be used in the visual editor
export const customComponents = [
  {
    name: 'Hero Section',
    component: ({ title, subtitle, backgroundImage, buttonText, buttonLink }) => (
      <div 
        className="relative h-screen flex items-center justify-center text-white"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 text-center max-w-4xl px-4">
          <h1 className="text-5xl font-bold mb-4">{title}</h1>
          <p className="text-xl mb-8">{subtitle}</p>
          {buttonText && (
            <a 
              href={buttonLink} 
              className="bg-primary text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              {buttonText}
            </a>
          )}
        </div>
      </div>
    ),
    inputs: [
      { name: 'title', type: 'string', defaultValue: 'Welcome to Oak Structures' },
      { name: 'subtitle', type: 'string', defaultValue: 'Quality timber construction and bespoke woodwork' },
      { name: 'backgroundImage', type: 'file', allowedFileTypes: ['jpeg', 'png', 'webp'] },
      { name: 'buttonText', type: 'string', defaultValue: 'Get Quote' },
      { name: 'buttonLink', type: 'url', defaultValue: '/contact' }
    ]
  },
  {
    name: 'Services Grid',
    component: ({ services = [] }) => (
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                {service.image && (
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                {service.price && (
                  <p className="text-lg font-bold text-primary">{service.price}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    inputs: [
      {
        name: 'services',
        type: 'list',
        subFields: [
          { name: 'title', type: 'string', defaultValue: 'Service Name' },
          { name: 'description', type: 'string', defaultValue: 'Service description' },
          { name: 'price', type: 'string', defaultValue: 'From £500' },
          { name: 'image', type: 'file', allowedFileTypes: ['jpeg', 'png', 'webp'] }
        ]
      }
    ]
  },
  {
    name: 'Project Gallery',
    component: ({ projects = [] }) => (
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Recent Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {projects.map((project, index) => (
              <div key={index} className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-end">
                  <div className="p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-lg font-semibold">{project.title}</h3>
                    <p className="text-sm opacity-90">{project.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    inputs: [
      {
        name: 'projects',
        type: 'list',
        subFields: [
          { name: 'title', type: 'string', defaultValue: 'Project Name' },
          { name: 'location', type: 'string', defaultValue: 'Location' },
          { name: 'image', type: 'file', allowedFileTypes: ['jpeg', 'png', 'webp'] }
        ]
      }
    ]
  },
  {
    name: 'Contact Section',
    component: ({ title, description, phone, email, address }) => (
      <div className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          <p className="text-lg text-gray-600 mb-8">{description}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {phone && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold mb-2">Phone</h3>
                <a href={`tel:${phone}`} className="text-primary hover:underline">{phone}</a>
              </div>
            )}
            {email && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold mb-2">Email</h3>
                <a href={`mailto:${email}`} className="text-primary hover:underline">{email}</a>
              </div>
            )}
            {address && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold mb-2">Address</h3>
                <p className="text-gray-600">{address}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    inputs: [
      { name: 'title', type: 'string', defaultValue: 'Get In Touch' },
      { name: 'description', type: 'string', defaultValue: 'Contact us for a free consultation' },
      { name: 'phone', type: 'string', defaultValue: '+44 123 456 7890' },
      { name: 'email', type: 'string', defaultValue: 'info@oak-structures.com' },
      { name: 'address', type: 'string', defaultValue: 'Cardiff, Wales, UK' }
    ]
  },
  {
    name: 'Testimonials',
    component: ({ testimonials = [] }) => (
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Clients Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating || 5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  {testimonial.company && (
                    <p className="text-sm text-gray-500">{testimonial.company}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    inputs: [
      {
        name: 'testimonials',
        type: 'list',
        subFields: [
          { name: 'content', type: 'string', defaultValue: 'Great service and quality work!' },
          { name: 'name', type: 'string', defaultValue: 'Client Name' },
          { name: 'company', type: 'string', defaultValue: 'Company Name' },
          { name: 'rating', type: 'number', defaultValue: 5, min: 1, max: 5 }
        ]
      }
    ]
  }
]

// Register custom components with Builder
customComponents.forEach(component => {
  builder.component(component)
})

export { builder, BuilderComponent }
