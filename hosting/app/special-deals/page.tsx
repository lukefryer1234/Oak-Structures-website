
"use client"; // Ensures client-side interactivity for onClick handlers

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Placeholder data - replace with actual data fetching
const specialDeals = [
  { id: 'deal1', name: 'Pre-Configured Double Garage', price: '£8,500', originalPrice: '£9,200', description: 'Our popular 2-bay garage with reclaimed oak and curved trusses. Ready for quick dispatch.', image: '/images/special-deal-garage.jpg', href: '/special-deals/double-garage', dataAiHint: 'double oak frame garage sale' },
  { id: 'deal2', name: 'Garden Gazebo Kit', price: '£3,200', originalPrice: '£3,500', description: 'Easy-to-assemble 3m x 3m gazebo kit in kilned dried oak. Perfect DIY project.', image: '/images/special-deal-gazebo.jpg', href: '/special-deals/gazebo-kit', dataAiHint: 'garden gazebo kit wood offer' },
  { id: 'deal3', name: 'Rustic Oak Beam Bundle', price: '£450', description: 'A selection of 3 reclaimed oak beams (various sizes) ideal for fireplace mantels or shelves.', image: '/images/special-deal-beams.jpg', href: '/special-deals/beam-bundle', dataAiHint: 'rustic oak beams bundle' },
   { id: 'deal4', name: 'End-of-Line Oak Flooring (15m²)', price: '£750', description: 'Kilned dried oak flooring, 15 square meters remaining. Grab a bargain!', image: '/images/special-deal-flooring.jpg', href: '/special-deals/flooring-lot', dataAiHint: 'oak flooring discount lot' },
];

export default function SpecialDealsPage() {
  return (
     // Removed relative isolate and background image handling
     <div>
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-center mb-12">Special Deals</h1>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Check out our limited-time offers and pre-configured items available at special prices. These deals won't last long!
          </p>
          {/* Grid of deals - Added transparency, blur, lighter border for cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {specialDeals.map((deal) => (
              <Card key={deal.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col bg-card/80 backdrop-blur-sm border border-border/50">
                <CardHeader className="p-0 relative">
                  <Badge variant="destructive" className="absolute top-2 right-2 z-10">DEAL</Badge>
                  <div className="relative h-56 w-full">
                    <Image
                      src={`https://picsum.photos/seed/${deal.id}/400/300`} // Placeholder
                      alt={deal.name}
                      layout="fill"
                      objectFit="cover"
                      data-ai-hint={deal.dataAiHint}
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-6 flex flex-col justify-between flex-grow">
                  <div>
                    <CardTitle className="text-xl mb-2">{deal.name}</CardTitle>
                    <CardDescription className="mb-4 flex-grow">{deal.description}</CardDescription>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-semibold text-primary">{deal.price}</span>
                      {deal.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">{deal.originalPrice}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button asChild className="flex-1">
                        {/* Link to the main special deals page as specific pages don't exist */}
                        <Link href="/special-deals">View Details</Link>
                      </Button>
                      <Button variant="secondary" className="flex-1" onClick={() => alert(`Add ${deal.name} to basket (placeholder)`)}>
                        Add to Basket
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
     </div>
  );
}

    