import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

const productCategories = [
  { name: 'Garages', href: '/products/garages', description: 'Robust oak frame garages.', image: '/images/garage-category.jpg', dataAiHint: 'oak frame garage' },
  { name: 'Gazebos', href: '/products/gazebos', description: 'Elegant oak gazebos for your garden.', image: '/images/gazebo-category.jpg', dataAiHint: 'oak frame gazebo garden' },
  { name: 'Porches', href: '/products/porches', description: 'Welcoming oak porches.', image: '/images/porch-category.jpg', dataAiHint: 'oak frame porch entrance' },
  { name: 'Oak Beams', href: '/products/oak-beams', description: 'Structural and decorative oak beams.', image: '/images/beams-category.jpg', dataAiHint: 'large oak beams rustic' },
  { name: 'Oak Flooring', href: '/products/oak-flooring', description: 'Beautiful and durable oak flooring.', image: '/images/flooring-category.jpg', dataAiHint: 'oak wood flooring interior' },
];

const specialDeals = [
  { name: 'Pre-Configured Double Garage', price: '£8,500', description: 'Limited time offer on our popular 2-bay garage.', image: '/images/special-deal-garage.jpg', href: '/special-deals/double-garage', dataAiHint: 'double oak frame garage' },
  { name: 'Garden Gazebo Kit', price: '£3,200', description: 'Easy-to-assemble 3m x 3m gazebo kit.', image: '/images/special-deal-gazebo.jpg', href: '/special-deals/gazebo-kit', dataAiHint: 'garden gazebo kit wood' },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[60vh] w-full">
        <Image
          src="https://picsum.photos/1600/900"
          alt="Hero background showing timber products"
          layout="fill"
          objectFit="cover"
          className="z-0"
          data-ai-hint="timber frame workshop landscape"
        />
        <div className="absolute inset-0 bg-black/50 z-10"></div>
      </section>

      {/* Product Categories Section */}
      <section id="categories" className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {productCategories.map((category) => (
              <Card key={category.name} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="p-0">
                   <div className="relative h-48 w-full">
                    <Image
                      src={`https://picsum.photos/seed/${category.name}/400/300`} // Placeholder
                      alt={category.name}
                      layout="fill"
                      objectFit="cover"
                      data-ai-hint={category.dataAiHint}
                    />
                   </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="text-xl mb-2">{category.name}</CardTitle>
                  <CardDescription className="mb-4">{category.description}</CardDescription>
                  <Button variant="outline" asChild>
                    <Link href={category.href}>Configure <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
             {/* Special Deals Category Link */}
             <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border-accent">
                <CardHeader className="p-0">
                   <div className="relative h-48 w-full">
                    <Image
                       src={`https://picsum.photos/seed/specialdeals/400/300`}
                       alt="Special Deals"
                       layout="fill"
                       objectFit="cover"
                       data-ai-hint="sale discount offer wood"
                    />
                   </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="text-xl mb-2 text-accent">Special Deals</CardTitle>
                  <CardDescription className="mb-4">Limited time offers and pre-configured items.</CardDescription>
                  <Button variant="accent" asChild>
                    <Link href="/special-deals">View Deals <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </CardContent>
              </Card>
          </div>
        </div>
      </section>

      {/* Special Deals Highlights */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Deals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {specialDeals.map((deal) => (
              <Card key={deal.name} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col sm:flex-row">
                 <div className="relative h-48 sm:h-auto sm:w-1/3 flex-shrink-0">
                    <Image
                      src={`https://picsum.photos/seed/${deal.name}/400/400`}
                      alt={deal.name}
                      layout="fill"
                      objectFit="cover"
                       data-ai-hint={deal.dataAiHint}
                    />
                   </div>
                <CardContent className="p-6 flex flex-col justify-between flex-grow">
                  <div>
                    <CardTitle className="text-xl mb-2">{deal.name}</CardTitle>
                    <CardDescription className="mb-4">{deal.description}</CardDescription>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                     <span className="text-2xl font-semibold text-primary">{deal.price}</span>
                     <Button variant="secondary" asChild>
                       <Link href={deal.href}>View Deal</Link>
                     </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
           <div className="text-center mt-12">
             <Button variant="outline" asChild>
                <Link href="/special-deals">See All Special Deals <ArrowRight className="ml-2 h-4 w-4" /></Link>
             </Button>
           </div>
        </div>
      </section>

        {/* Call to Action for Custom Orders */}
      <section className="py-16 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Need Something Bespoke?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Can't find exactly what you're looking for? We specialize in custom oak structures. Submit an inquiry, and let's build your vision together.
          </p>
          <Button variant="accent" size="lg" asChild>
            <Link href="/custom-order">Request a Custom Order</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
