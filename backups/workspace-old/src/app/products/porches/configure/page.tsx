
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { DoorOpen } from 'lucide-react';

export default function SimplifiedPorchPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-3xl mx-auto bg-card/80 backdrop-blur-sm border border-border/50">
        <CardHeader className="text-center">
          <DoorOpen className="h-12 w-12 mx-auto text-primary mb-4" />
          <CardTitle className="text-3xl md:text-4xl">Oak Frame Porches</CardTitle>
          <CardDescription className="text-lg text-muted-foreground pt-2">
            Add character and a welcoming entrance with a bespoke oak porch.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden shadow-md bg-muted">
            <Image
              src="/images/porch-category.jpg"
              alt="Custom Oak Frame Porch"
              fill
              sizes="100vw"
              style={{objectFit: 'cover'}}
              priority
              data-ai-hint="oak frame porch house entrance"
            />
          </div>
          <p className="text-muted-foreground leading-relaxed">
            An oak frame porch from Timberline Commerce adds instant kerb appeal and practicality to any home. Crafted from high-quality European Oak, our porches are designed to complement your property's style while providing a sturdy and attractive entrance.
          </p>
          <div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">Key Features & Options:</h3>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground marker:text-primary">
              <li>Choice of Oak Types (e.g., Green Oak, Kilned Dried)</li>
              <li>Various Sizes (Narrow, Standard, Wide, or custom dimensions)</li>
              <li>Leg Styles (To Floor, To Wall/Brackets)</li>
              <li>Truss Designs (e.g., Curved, Straight, King Post)</li>
              <li>Optional roofing and infill panel considerations (discuss with us)</li>
            </ul>
          </div>
          <p className="text-muted-foreground leading-relaxed pt-4 border-t border-border/30">
            Our comprehensive online porch configurator is being updated. To design your perfect porch, please reach out to our team with your ideas.
          </p>
          <div className="mt-8 text-center space-y-3">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="/custom-order">Get a Custom Porch Quote</Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              or <Link href="/contact" className="underline hover:text-primary">Contact Us</Link> to discuss your project.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
