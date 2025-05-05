
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

// --- Placeholder Category Data (Replace with actual data source) ---
interface CategoryDetails {
    title: string;
    description: string;
    image: string;
    dataAiHint: string;
    configureHref: string;
}

const categoryData: { [key: string]: CategoryDetails } = {
    garages: {
        title: "Oak Frame Garages",
        description: "Discover our range of robust and customizable oak frame garages. Designed for durability and style, choose from various sizes, bay configurations, truss types, and oak finishes to create the perfect structure for your needs.",
        image: "/images/category/garage-main.jpg", // Replace with actual image path
        dataAiHint: "completed oak frame garage building",
        configureHref: "/products/garages/configure"
    },
    gazebos: {
        title: "Oak Frame Gazebos",
        description: "Enhance your garden with an elegant oak frame gazebo. Ideal for outdoor entertaining or creating a peaceful retreat, our gazebos are available in different sizes and styles, crafted from high-quality oak.",
        image: "/images/category/gazebo-main.jpg", // Replace with actual image path
        dataAiHint: "oak frame gazebo garden structure",
        configureHref: "/products/gazebos/configure"
    },
    porches: {
        title: "Oak Frame Porches",
        description: "Add character and a welcoming entrance to your home with a bespoke oak frame porch. Configure the style, size, and oak type online to match your property's aesthetic.",
        image: "/images/category/porch-main.jpg", // Replace with actual image path
        dataAiHint: "oak frame porch house entrance",
        configureHref: "/products/porches/configure"
    },
    'oak-beams': {
        title: "Custom Oak Beams",
        description: "Order high-quality structural or decorative oak beams cut to your exact specifications. Choose from green, kilned dried, or reclaimed oak to suit your project requirements.",
        image: "/images/category/beams-main.jpg", // Replace with actual image path
        dataAiHint: "stack of oak beams wood yard",
        configureHref: "/products/oak-beams/configure"
    },
    'oak-flooring': {
        title: "Premium Oak Flooring",
        description: "Select beautiful and durable solid oak flooring. Available in reclaimed or kilned dried oak, specify the area you need and get an instant price estimate per square meter.",
        image: "/images/category/flooring-main.jpg", // Replace with actual image path
        dataAiHint: "oak flooring planks texture",
        configureHref: "/products/oak-flooring/configure"
    }
};

export default function ProductCategoryPage({ params }: { params: { category: string } }) {
    const category = params.category;
    const details = categoryData[category];

    if (!details) {
        notFound();
    }

    return (
        <div className="relative isolate overflow-hidden"> {/* Added relative isolate */}
           {/* Background Image */}
           <Image
             src={`https://picsum.photos/seed/${category}-page-bg/1920/1080`}
             alt={`Subtle background for ${details.title}`}
             layout="fill"
             objectFit="cover"
             className="absolute inset-0 -z-10 opacity-5" // Very subtle opacity
             data-ai-hint={`subtle pattern texture wood ${details.dataAiHint.split(' ')[0]}`}
             aria-hidden="true"
           />
            <div className="container mx-auto px-4 py-12">
                 {/* Category Hero/Introduction */}
                <div className="relative mb-12 rounded-lg overflow-hidden min-h-[300px] flex items-center justify-center text-center p-8 bg-muted/50 backdrop-blur-sm"> {/* Adjusted background */}
                     <Image
                        src={`https://picsum.photos/seed/${details.dataAiHint.split(' ')[0]}/1200/400`} // Placeholder
                        alt={`${details.title} main image`}
                        layout="fill"
                        objectFit="cover"
                        className="absolute inset-0 z-0 opacity-20" // Adjusted opacity
                        data-ai-hint={details.dataAiHint}
                        priority
                     />
                    <div className="relative z-10 max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{details.title}</h1>
                        <p className="text-lg text-muted-foreground">{details.description}</p>
                         <Button size="lg" asChild className="mt-8">
                            <Link href={details.configureHref}>
                               Configure Your {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                               <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Additional Content Area (Optional) */}
                {/* Example: You could add sections here showing example configurations, benefits, etc. */}
                 {/* <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
                    <CardHeader>
                        <CardTitle>Why Choose Our {details.title}?</CardTitle>
                    </CardHeader>
                     <CardContent>
                        <p>More details about the benefits, materials, or process...</p>
                     </CardContent>
                </Card> */}
            </div>
        </div>
    );
}

// Optional: Generate static paths if you know all categories beforehand
// export async function generateStaticParams() {
//   return Object.keys(categoryData).map((category) => ({
//     category,
//   }));
// }

// Optional: Generate metadata dynamically
export async function generateMetadata({ params }: { params: { category: string } }) {
    const category = params.category;
    const details = categoryData[category];

    if (!details) {
        return {
            title: "Product Not Found",
        };
    }

    return {
        title: `${details.title} | Timberline Commerce`,
        description: details.description,
        // Add other metadata tags as needed
    };
}
