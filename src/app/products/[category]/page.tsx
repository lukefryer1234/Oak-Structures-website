import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { notFound } from 'next/navigation';
import Link from 'next/link';

// Placeholder data - Replace with actual data fetching
const categoryData: { [key: string]: { title: string; description: string, configPath: string } } = {
  garages: { title: "Configure Your Garage", description: "Select the options for your custom oak frame garage.", configPath: '/products/garages/configure' },
  gazebos: { title: "Configure Your Gazebo", description: "Design your perfect oak frame gazebo.", configPath: '/products/gazebos/configure' },
  porches: { title: "Configure Your Porch", description: "Customize your welcoming oak porch.", configPath: '/products/porches/configure' },
  'oak-beams': { title: "Configure Your Oak Beams", description: "Specify the dimensions and type for your oak beams.", configPath: '/products/oak-beams/configure' },
  'oak-flooring': { title: "Configure Your Oak Flooring", description: "Calculate the area and select the type for your oak flooring.", configPath: '/products/oak-flooring/configure' },
};

interface ProductCategoryPageProps {
  params: {
    category: string;
  };
}

export default function ProductCategoryPage({ params }: ProductCategoryPageProps) {
  const { category } = params;
  const data = categoryData[category];

  if (!data) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">{data.title}</CardTitle>
          <CardDescription>{data.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for category intro/image */}
          <p className="mb-6">
            Use our configuration tool to build the perfect {category.replace('-', ' ')} for your needs.
            Get started by clicking the button below.
          </p>
          <Button size="lg" asChild>
            <Link href={data.configPath}>Start Configuration</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Optional: Generate static paths if categories are fixed
// export async function generateStaticParams() {
//   return Object.keys(categoryData).map((category) => ({
//     category,
//   }));
// }
