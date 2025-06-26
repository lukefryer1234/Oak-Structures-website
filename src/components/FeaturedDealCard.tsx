import type { Product } from '@/types';
import Link from 'next/link';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { ArrowRight } from 'lucide-react'; // Not used in new design

interface FeaturedDealCardProps {
  deal: Product; 
}

export function FeaturedDealCard({ deal }: FeaturedDealCardProps) {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD', // Keep consistent with app currency
    minimumFractionDigits: 0, // For whole numbers like £8,500
    maximumFractionDigits: 2,
  }).format(deal.basePrice).replace(/\.00$/, ''); // Remove .00 for whole numbers

  return (
    <Card className="flex flex-col sm:flex-row overflow-hidden shadow-lg rounded-lg h-full transition-shadow hover:shadow-xl bg-card">
      <div 
        className="w-full sm:w-2/5 h-48 sm:h-auto shrink-0 bg-amber-600 rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none sm:rounded-r-none"
        data-ai-hint={`${deal.name.toLowerCase().split(' ').slice(0,2).join(' ')} deal visual`}
      >
        {/* This div acts as the image placeholder. An actual <Image> can be placed here if needed */}
      </div>
      <div className="flex flex-col justify-between p-4 sm:p-6 flex-grow bg-card rounded-b-lg sm:rounded-r-lg sm:rounded-bl-none sm:rounded-l-none">
        <div>
          <CardTitle className="text-lg md:text-xl font-semibold text-foreground mb-1">{deal.name}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground mb-3 leading-relaxed line-clamp-2">
            {deal.description}
          </CardDescription>
        </div>
        <div className="mt-auto flex items-end justify-between">
          <p className="text-xl font-bold text-amber-700">{formattedPrice}</p>
          <Button asChild variant="secondary" size="sm" className="text-sm">
            <Link href={`/products/${deal.id}/configure`}>
              View Deal
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
