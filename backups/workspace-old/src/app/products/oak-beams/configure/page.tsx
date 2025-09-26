
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Layers } from 'lucide-react'; // Icon for beams

export default function SimplifiedOakBeamsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-3xl mx-auto bg-card/80 backdrop-blur-sm border border-border/50">
        <CardHeader className="text-center">
          <Layers className="h-12 w-12 mx-auto text-primary mb-4" />
          <CardTitle className="text-3xl md:text-4xl">Custom Oak Beams</CardTitle>
          <CardDescription className="text-lg text-muted-foreground pt-2">
            Structural and decorative oak beams, cut to your precise specifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden shadow-md bg-muted">
            <Image
              src="/images/beams-category.jpg"
              alt="Stack of Custom Oak Beams"
              fill
              sizes="100vw"
              style={{objectFit: 'cover'}}
              priority
              data-ai-hint="large oak beams rustic wood pile"
            />
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Timberline Commerce supplies high-quality European Oak beams for a wide range of applications, from structural supports in new builds and renovations to decorative fireplace mantels and ceiling features. We offer beams cut to your exact dimensions.
          </p>
          <div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">Available Oak Types:</h3>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground marker:text-primary">
              <li><strong>Green Oak:</strong> Ideal for structural purposes, air-dries naturally in place. Cost-effective.</li>
              <li><strong>Kilned Dried Oak:</strong> More stable with reduced moisture content, suitable for internal applications where stability is key.</li>
              <li><strong>Reclaimed Oak:</strong> Rich in character and history, perfect for feature beams and rustic aesthetics.</li>
            </ul>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            To order oak beams, please provide us with the required dimensions (length, width, thickness) and your preferred oak type. Our team will then provide you with a tailored quote.
          </p>
          <p className="text-muted-foreground leading-relaxed pt-4 border-t border-border/30">
            Our online beam calculator is currently under maintenance. For pricing and orders, please contact us directly.
          </p>
          <div className="mt-8 text-center space-y-3">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="/custom-order">Request a Quote for Oak Beams</Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              or <Link href="/contact" className="underline hover:text-primary">Contact Us</Link> with your requirements.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
