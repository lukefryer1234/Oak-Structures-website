
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { TreeDeciduous } from 'lucide-react';

export default function SimplifiedGazeboPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-3xl mx-auto bg-card/80 backdrop-blur-sm border border-border/50">
        <CardHeader className="text-center">
          <TreeDeciduous className="h-12 w-12 mx-auto text-primary mb-4" />
          <CardTitle className="text-3xl md:text-4xl">Oak Frame Gazebos</CardTitle>
          <CardDescription className="text-lg text-muted-foreground pt-2">
            Elegant and durable oak gazebos to enhance your garden space.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden shadow-md bg-muted">
            <Image
              src="/images/gazebo-category.jpg"
              alt="Custom Oak Frame Gazebo"
              fill
              sizes="100vw"
              style={{objectFit: 'cover'}}
              priority
              data-ai-hint="oak frame gazebo garden furniture"
            />
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Create a stunning focal point in your garden with a Timberline Commerce oak frame gazebo. Perfect for outdoor dining, entertaining, or simply relaxing, our gazebos are built from high-quality European Oak using traditional craftsmanship for lasting beauty and structural integrity.
          </p>
          <div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">Key Features & Options:</h3>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground marker:text-primary">
              <li>Choice of Oak Types (e.g., Kilned Dried, Green Oak)</li>
              <li>Various Sizes (e.g., 3m x 3m, 4m x 3m, 4m x 4m, custom)</li>
              <li>Leg Styles (Full Height, Wall-Mounted/Half Legs)</li>
              <li>Truss Designs (e.g., Curved, Straight)</li>
              <li>Optional roofing materials and side panels (discuss with us)</li>
            </ul>
          </div>
          <p className="text-muted-foreground leading-relaxed pt-4 border-t border-border/30">
            Our detailed online gazebo configurator is currently undergoing improvements. We encourage you to get in touch to discuss your ideal gazebo design.
          </p>
          <div className="mt-8 text-center space-y-3">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="/custom-order">Inquire About a Custom Gazebo</Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              or <Link href="/contact" className="underline hover:text-primary">Contact Us</Link> for more details.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
