
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

const productCategories = [
  { name: 'Garages', href: '/products/garages', description: 'Robust oak frame garages.', image: '/images/garage-category.jpg', dataAiHint: 'oak frame garage' },
  { name: 'Gazebos', href: '/products/gazebos', description: 'Elegant oak gazebos for your garden.', image: '/images/gazebo-category.jpg', dataAiHint: 'oak frame gazebo garden' },
  { name: 'Porches', href: '/products/porches', description: 'Welcoming oak porches.', image: '/images/porch-category.jpg', dataAiHint: 'oak frame porch entrance' },
  { name: 'Oak Beams', href: '/products/oak-beams', description: 'Structural and decorative oak beams.', image: '/images/beams-category.jpg', dataAiHint: 'large oak beams rustic' },
  { name: 'Oak Flooring', href: '/products/oak-flooring', description: 'Beautiful and durable oak flooring.', image: '/images/flooring-category.jpg', dataAiHint: 'oak wood flooring interior' },
   { name: 'Special Deals', href: '/special-deals', description: 'Limited time offers and pre-configured items.', image: '/images/special-deals-category.jpg', dataAiHint: 'sale discount offer wood' },
];

const specialDeals = [
  { name: 'Pre-Configured Double Garage', price: '£8,500', description: 'Limited time offer on our popular 2-bay garage.', image: '/images/special-deal-garage.jpg', href: '/special-deals/double-garage', dataAiHint: 'double oak frame garage' },
  { name: 'Garden Gazebo Kit', price: '£3,200', description: 'Easy-to-assemble 3m x 3m gazebo kit.', image: '/images/special-deal-gazebo.jpg', href: '/special-deals/gazebo-kit', dataAiHint: 'garden gazebo kit wood' },
];

export default function Home() {
  return (
    // Added relative positioning and background image to the main container
    <div className="relative isolate overflow-hidden">
       {/* Background Image */}
       <Image
         src="https://picsum.photos/seed/home-bg/1920/1080"
         alt="Subtle wood texture background"
         layout="fill"
         objectFit="cover"
         className="absolute inset-0 -z-10 opacity-5" // Very subtle opacity
         data-ai-hint="light wood texture pattern subtle"
         aria-hidden="true"
       />
      {/* Product Categories Section */}
      <section id="categories" className="py-16 bg-background/50"> {/* Semi-transparent background */}
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {productCategories.map((category) => (
              <Link href={category.href} key={category.name} className="group block">
                <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col bg-card/80 backdrop-blur-sm"> {/* Added transparency and blur */}
                  <CardContent className="p-0 flex-grow relative aspect-square w-full"> {/* Combined relative and aspect-square */}
                    <Image
                      src={`https://picsum.photos/seed/${category.name}/400/400`} // Use square image
                      alt={category.name}
                      layout="fill"
                      objectFit="cover"
                      data-ai-hint={category.dataAiHint}
                      className="transition-transform duration-300 group-hover:scale-105" // Added group-hover effect
                    />
                     {/* Overlay */}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </CardContent>
                  <CardFooter className="p-4 justify-center relative z-10 bg-card/70"> {/* Bring footer text above overlay */}
                    <CardTitle className="text-lg font-semibold text-center text-card-foreground">{category.name}</CardTitle> {/* Centered title */}
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Special Deals Highlights */}
      <section className="py-16 bg-background/50"> {/* Semi-transparent background */}
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Featured Deals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {specialDeals.map((deal) => (
              <Card key={deal.name} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col sm:flex-row bg-card/80 backdrop-blur-sm"> {/* Added transparency and blur */}
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
                    <CardTitle className="text-xl mb-2 text-card-foreground">{deal.name}</CardTitle>
                    <CardDescription className="mb-4 text-muted-foreground">{deal.description}</CardDescription>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                     <span className="text-2xl font-semibold text-primary">{deal.price}</span>
                     <Button variant="secondary" asChild>
                        {/* Link to main special deals page */}
                       <Link href="/special-deals">View Deal</Link>
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
    </div>
  );
}
