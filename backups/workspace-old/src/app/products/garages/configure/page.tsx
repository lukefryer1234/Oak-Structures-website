
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Wrench } from 'lucide-react';

export default function SimplifiedGaragePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-3xl mx-auto bg-card/80 backdrop-blur-sm border border-border/50">
        <CardHeader className="text-center">
          <Wrench className="h-12 w-12 mx-auto text-primary mb-4" />
          <CardTitle className="text-3xl md:text-4xl">Oak Frame Garages</CardTitle>
          <CardDescription className="text-lg text-muted-foreground pt-2">
            Robust, traditionally crafted oak garages tailored to your needs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden shadow-md bg-muted">
            <Image
              src="/images/garage-category.jpg" // Main image for garages
              alt="Custom Oak Frame Garage"
              fill
              sizes="100vw"
              style={{objectFit: 'cover'}}
              priority
              data-ai-hint="large oak frame garage countryside"
            />
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Timberline Commerce specializes in designing and supplying high-quality oak frame garages. Our structures combine traditional joinery techniques with the timeless beauty and durability of European Oak. Whether you need a single bay for your classic car or a multi-bay workshop with additional features, we can help you create the perfect solution.
          </p>
          <div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">Key Features & Options:</h3>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground marker:text-primary">
              <li>Choice of Oak Types (Green, Kilned Dried, Reclaimed)</li>
              <li>Customizable Number of Bays (1 to 4+)</li>
              <li>Various Truss Designs (e.g., Straight, Curved)</li>
              <li>Optional Cat Slide Roofs for extra depth</li>
              <li>Log Stores and Side Extensions</li>
              <li>Selection of Beam Sizes for structural integrity</li>
              <li>Standard and Custom Bay Sizes</li>
            </ul>
          </div>
          <p className="text-muted-foreground leading-relaxed pt-4 border-t border-border/30">
            Our full online configurator is currently being enhanced to provide an even better design experience. In the meantime, we invite you to discuss your specific requirements with our team.
          </p>
          <div className="mt-8 text-center space-y-3">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="/custom-order">Request a Custom Garage Quote</Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              or <Link href="/contact" className="underline hover:text-primary">Contact Us</Link> for more information.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
