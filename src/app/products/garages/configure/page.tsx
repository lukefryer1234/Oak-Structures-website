
import { getProductById } from '@/lib/products';
import { ProductConfigurationForm } from '@/components/ProductConfigurationForm';
import { AlertTriangle } from 'lucide-react';

export default async function ConfigureGaragePage() {
  const product = getProductById('garages');

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold text-foreground mb-2">Product Not Found</h1>
        <p className="text-muted-foreground">Sorry, the product you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <ProductConfigurationForm product={product} />
    </div>
  );
}
