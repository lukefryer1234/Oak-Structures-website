
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

const productCategories = [
  // Updated hrefs to point directly to /configure pages
  { name: 'Garages', href: '/products/garages/configure', description: 'Robust oak frame garages.', image: '/images/garage-category.jpg', dataAiHint: 'oak frame garage' },
  { name: 'Gazebos', href: '/products/gazebos/configure', description: 'Elegant oak gazebos for your garden.', image: '/images/gazebo-category.jpg', dataAiHint: 'oak frame gazebo garden' },
  { name: 'Porches', href: '/products/porches/configure', description: 'Welcoming oak porches.', image: '/images/porch-category.jpg', dataAiHint: 'oak frame porch entrance' },
  { name: 'Oak Beams', href: '/products/oak-beams/configure', description: 'Structural and decorative oak beams.', image: '/images/beams-category.jpg', dataAiHint: 'large oak beams rustic' },
  { name: 'Oak Flooring', href: '/products/oak-flooring/configure', description: 'Beautiful and durable oak flooring.', image: '/images/flooring-category.jpg', dataAiHint: 'oak wood flooring interior' },
   { name: 'Special Deals', href: '/special-deals', description: 'Limited time offers and pre-configured items.', image: '/images/special-deals-category.jpg', dataAiHint: 'sale discount offer wood' },
];

// Removed specialDeals array as the section was deleted

export default function Home() {
  return (
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
      <section id="categories" className="py-16 bg-muted/50 backdrop-blur-sm"> {/* Semi-transparent background */}
        <div className="container mx-auto px-4">
           {/* Removed h2 title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {productCategories.map((category) => (
              <Link href={category.href} key={category.name} className="group block">
                <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col bg-card/80 backdrop-blur-sm border border-border/50"> {/* Added transparency, blur, border */}
                   {/* Image fills the CardContent */}
                   <CardContent className="p-0 flex-grow relative aspect-square w-full overflow-hidden">
                    <Image
                      src={`https://picsum.photos/seed/${category.name.replace(/\s+/g, '-')}/400/400`} // Use square image, create unique seed
                      alt={category.name}
                      layout="fill"
                      objectFit="cover"
                      data-ai-hint={category.dataAiHint}
                      className="transition-transform duration-300 group-hover:scale-105" // Added group-hover effect
                    />
                    {/* Optional: Overlay can be added here if desired for text contrast */}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  </CardContent>
                   {/* Footer remains below content */}
                  <CardFooter className="p-4 justify-center bg-card/90 border-t border-border/30"> {/* Slightly opaque footer for text readability */}
                    <CardTitle className="text-lg font-semibold text-center text-card-foreground">{category.name}</CardTitle>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

       {/* Custom Order Callout - Removed */}

      {/* Special Deals Highlights - Removed */}

    </div>
  );
}
