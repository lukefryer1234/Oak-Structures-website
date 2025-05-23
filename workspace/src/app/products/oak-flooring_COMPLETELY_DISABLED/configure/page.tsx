
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Ruler } from 'lucide-react';

// This is a simplified, informational page for Oak Flooring.
// The interactive configurator is deferred for the initial launch.

export default function SimplifiedOakFlooringPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-3xl mx-auto bg-card/80 backdrop-blur-sm border border-border/50">
        <CardHeader className="text-center">
          <Ruler className="h-12 w-12 mx-auto text-primary mb-4" />
          <CardTitle className="text-3xl md:text-4xl">Oak Flooring</CardTitle>
          <CardDescription className="text-lg text-muted-foreground pt-2">
            Beautiful, durable, and timeless solid oak flooring.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden shadow-md bg-muted">
            <Image
              src="/images/flooring-category.jpg" // Main image for oak flooring
              alt="Room with Oak Flooring"
              fill
              sizes="100vw"
              style={{objectFit: 'cover'}}
              priority
              data-ai-hint="oak wood flooring interior room"
            />
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Transform your space with the natural beauty and enduring quality of solid oak flooring from Timberline Commerce. We offer premium European Oak flooring suitable for a variety of interior styles, from rustic charm to modern elegance.
          </p>
          <div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">Available Oak Types:</h3>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground marker:text-primary">
              <li><strong>Kilned Dried Oak:</strong> Processed for stability and reduced moisture content, making it ideal for interior flooring applications. Ready for finishing.</li>
              <li><strong>Reclaimed Oak:</strong> Offers unique character, rich patinas, and a sense of history. Perfect for creating distinctive floors with an eco-friendly aspect.</li>
            </ul>
            <p className="mt-2 text-muted-foreground">
              Our standard flooring thickness is typically 20mm, providing excellent durability.
            </p>
          </div>
          <p className="text-muted-foreground leading-relaxed pt-4 border-t border-border/30">
            To get a quote for your oak flooring project, please let us know the total area (in square meters) you need to cover and your preferred oak type.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Our online area calculator and pricing tool is currently being updated. Please contact us for assistance.
          </p>
          <div className="mt-8 text-center space-y-3">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="/custom-order">Get a Quote for Oak Flooring</Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              or <Link href="/contact" className="underline hover:text-primary">Contact Us</Link> with your area requirements.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
