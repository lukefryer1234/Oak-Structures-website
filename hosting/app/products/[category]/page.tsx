import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

import { 
  ProductCategory, 
  categoryConfigs
} from '@/services/product-service';

// Get product name and description for each category
const getProductInfo = (category: string) => {
  switch(category) {
    case 'garages':
      return {
        title: 'Oak Frame Garages',
        description: 'Our oak frame garages combine traditional craftsmanship with modern design to create a structure that complements any property. Choose from various bay configurations, truss designs, and optional features to create your perfect garage.',
        imagePath: '/images/garage-category.jpg'
      };
    case 'gazebos':
      return {
        title: 'Oak Frame Gazebos',
        description: 'Add a stunning focal point to your garden with our handcrafted oak gazebos. Available in different sizes and designs, they create the perfect outdoor space for relaxation or entertainment.',
        imagePath: '/images/gazebo-category.jpg'
      };
    case 'porches':
      return {
        title: 'Oak Frame Porches',
        description: 'Enhance your home\'s entrance with a beautiful oak porch. Our designs range from simple to elaborate, all crafted to provide a welcoming entrance to your property.',
        imagePath: '/images/porch-category.jpg'
      };
    case 'oak-beams':
      return {
        title: 'Oak Beams',
        description: 'Our quality oak beams are perfect for both structural and decorative purposes. Choose from different oak types and specify exact dimensions to meet your requirements.',
        imagePath: '/images/beams-category.jpg'
      };
    case 'oak-flooring':
      return {
        title: 'Oak Flooring',
        description: 'Transform your interior with our premium oak flooring. Available in solid and engineered options with various finishes to suit your style.',
        imagePath: '/images/flooring-category.jpg'
      };
    default:
      return {
        title: category.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase()),
        description: 'Custom oak products built to your specifications.',
        imagePath: '/images/default-category.jpg'
      };
  }
};

export default function ProductCategoryPage({ params }: { params: { category: string } }) {
  const category = params.category as ProductCategory;
  
  // Check if the category is valid
  if (!Object.keys(categoryConfigs).includes(category) || category === 'special-deals') {
    notFound();
  }

  const config = categoryConfigs[category];
  const { title, description, imagePath } = getProductInfo(category);
  
  return (
    <div>
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto bg-card/80 backdrop-blur-sm border border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">{title}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-8">
            {/* Product Image */}
            <div className="relative w-full aspect-video rounded-md overflow-hidden">
              <Image
                src={imagePath}
                alt={title}
                layout="fill"
                objectFit="cover"
                priority
              />
            </div>
            
            {/* Product Description */}
            <div className="text-center">
              <p className="text-muted-foreground">{description}</p>
            </div>
            
            {/* Configuration Options Preview */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-center">Available Configuration Options</h2>
              
              {config.options.map((option) => (
                <div key={option.id} className="text-center border border-border/30 rounded-md p-4 bg-muted/20">
                  <h3 className="text-base font-medium mb-2">{option.label}</h3>
                  {option.type === 'select' && (
                    <p className="text-sm text-muted-foreground">
                      Choose from multiple options
                    </p>
                  )}
                  {option.type === 'slider' && (
                    <p className="text-sm text-muted-foreground">
                      Select a value between {option.min} and {option.max}
                    </p>
                  )}
                  {option.type === 'radio' && (
                    <p className="text-sm text-muted-foreground">
                      Select one of the available styles
                    </p>
                  )}
                  {option.type === 'checkbox' && (
                    <p className="text-sm text-muted-foreground">
                      Optional feature you can toggle
                    </p>
                  )}
                  {option.type === 'dimensions' && (
                    <p className="text-sm text-muted-foreground">
                      Specify custom dimensions in {option.unit}
                    </p>
                  )}
                  {option.type === 'area' && (
                    <p className="text-sm text-muted-foreground">
                      Specify area dimensions in {option.unit}
                    </p>
                  )}
                </div>
              ))}
            </div>
            
            {/* Configure Button */}
            <div className="pt-6 border-t border-border/50">
              <Button 
                size="lg" 
                className="w-full max-w-xs mx-auto block" 
              >
                <Link href={`/products/${category}/configure/`} className="flex items-center justify-center w-full">
                  Configure Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

