
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

const productCategories = [
  { name: 'Garages', href: '/products/garages/configure', image: '/images/garage-category.jpg', dataAiHint: 'oak frame garage' },
  { name: 'Gazebos', href: '/products/gazebos/configure', image: '/images/gazebo-category.jpg', dataAiHint: 'oak frame gazebo garden' },
  { name: 'Porches', href: '/products/porches/configure', image: '/images/porch-category.jpg', dataAiHint: 'oak frame porch entrance' },
  { name: 'Oak Beams', href: '/products/oak-beams/configure', image: '/images/beams-category.jpg', dataAiHint: 'large oak beams rustic' },
  // { name: 'Oak Flooring', href: '/products/oak-flooring_COMPLETELY_DISABLED/configure', image: '/images/flooring-category.jpg', dataAiHint: 'oak wood flooring interior' },
  { name: 'Special Deals', href: '/special-deals', image: '/images/special-deals-category.jpg', dataAiHint: 'sale discount offer wood' },
];

const featuredDeals = [
   { name: 'Pre-Configured Double Garage', price: '£8,500', description: 'Limited time offer on our popular 2-bay garage.', image: '/images/featured-deal-1.jpg', href: '/special-deals/double-garage', dataAiHint: 'double oak frame garage' },
   { name: 'Garden Gazebo Kit', price: '£3,200', description: 'Easy-to-assemble 3m x 3m gazebo kit.', image: '/images/featured-deal-2.jpg', href: '/special-deals/gazebo-kit', dataAiHint: 'garden gazebo kit wood' },
]


export default function Home() {
  return (
    <div className="flex flex-col">
       <section id="categories" className="py-10 bg-muted/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productCategories.map((category) => (
              <Link href={category.href} key={category.name} className="group block">
                 <Card className="overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 h-full flex flex-col bg-card border border-border/50 relative aspect-[4/3]">
                   <Image
                             src={category.image}
                             alt={category.name}
                             fill
                             sizes="100vw"
                             style={{objectFit: 'cover'}}
                             data-ai-hint={category.dataAiHint}
                             className="transition-transform duration-300 group-hover:scale-105"
                           />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex items-end p-4">
                     <CardTitle className="text-xl font-semibold text-primary-foreground drop-shadow-md">
                       {category.name}
                     </CardTitle>
                   </div>
                 </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Featured Deals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredDeals.map((deal) => (
               <Card key={deal.name} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col sm:flex-row bg-card/80 backdrop-blur-sm border border-border/50">
                 <div className="relative h-48 sm:h-auto sm:w-1/3 flex-shrink-0 bg-muted">
                     <Image
                               src={deal.image}
                               alt={deal.name}
                               fill
                               sizes="100vw"
                               style={{objectFit: 'cover'}}
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
