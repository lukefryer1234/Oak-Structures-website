"use client"; // Needed for form/state

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { notFound, useRouter } from "next/navigation"; 
import Image from "next/image";
import { ArrowRight, ShoppingCart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/error/error-boundary";
import { useSafeQuery, useSafeMutation } from "@/hooks/use-safe-query";
import { useAuth } from "@/hooks/use-auth";
import { ProductImagesService } from "@/services/domain/product-images/product-images-service";

// --- Configuration Interfaces & Data ---

interface ConfigOption {
  id: string;
  label: string;
  type: "select" | "radio"; // Simplified for Gazebos
  options?: {
    value: string;
    label: string;
    image?: string;
    dataAiHint?: string;
  }[];
  defaultValue?: string;
}

interface GazeboConfig {
  legType: string;
  sizeType: string;
  trussType: string;
}

interface CategoryConfig {
  title: string;
  options: ConfigOption[];
}

// Specific configuration for Gazebos - Removed Oak Type
const gazeboConfig: CategoryConfig = {
  title: "Configure Your Gazebo",
  options: [
    {
      id: "legType",
      label: "Leg Type",
      type: "select",
      options: [
        { value: "full", label: "Full Height Legs" },
        { value: "wall", label: "Wall Mount (Half Legs)" },
      ],
      defaultValue: "full",
    },
    {
      id: "sizeType",
      label: "Size Type",
      type: "select",
      options: [
        { value: "3x3", label: "3m x 3m" },
        { value: "4x3", label: "4m x 3m" },
        { value: "4x4", label: "4m x 4m" },
      ],
      defaultValue: "3x3",
    },
    {
      id: "trussType",
      label: "Truss Type",
      type: "radio",
      options: [
        {
          value: "curved",
          label: "Curved",
          image: "/images/config/truss-curved.jpg",
          dataAiHint: "curved oak truss",
        },
        {
          value: "straight",
          label: "Straight",
          image: "/images/config/truss-straight.jpg",
          dataAiHint: "straight oak truss",
        },
      ],
      defaultValue: "curved",
    },
    // { id: 'oakType', label: 'Oak Type', type: 'select', options: [{ value: 'reclaimed', label: 'Reclaimed Oak' }, { value: 'kilned', label: 'Kilned Dried Oak' }], defaultValue: 'kilned' }, // Removed Oak Type
  ],
};

// --- Helper Functions ---

// Updated calculatePrice function without oakType dependency
const calculatePrice = (config: GazeboConfig): number => {
  let basePrice = 3000; // Base price for Gazebo
  if (config.sizeType === "4x4") basePrice += 500;
  if (config.sizeType === "4x3") basePrice += 250;
  if (config.legType === "wall") basePrice -= 100; // Example adjustment
  // Add other pricing adjustments based on config.trussType if needed
  return Math.max(0, basePrice);
};

// --- Component ---

export default function ConfigureGazeboPageWrapper() {
  return (
    <ErrorBoundary>
      <ConfigureGazeboPage />
    </ErrorBoundary>
  );
}

function ConfigureGazeboPage() {
  const category = "gazebos";
  const categoryConfig = gazeboConfig;
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const [configState, setConfigState] = useState<GazeboConfig>(() => {
    const initialState: GazeboConfig = { legType: 'full', sizeType: '3x3', trussType: 'curved' };
    categoryConfig.options.forEach((opt) => {
      if (opt.defaultValue) {
        initialState[opt.id as keyof GazeboConfig] = opt.defaultValue;
      }
    });
    return initialState;
  });

  // Fetch truss images using React Query
  const trussImagesQuery = useSafeQuery(
    ['trussImages', 'gazebos'],
    async () => {
      const images: Record<string, string> = {};
      const trussOption = categoryConfig.options.find(opt => opt.id === "trussType");
      
      if (trussOption && trussOption.options) {
        for (const opt of trussOption.options) {
          if (opt.image) {
            const fallbackUrl = `https://picsum.photos/seed/${opt.dataAiHint?.replace(/\s+/g, "-") || opt.value}/200/150`;
            try {
              // Use ProductImagesService instead of direct Firebase access
              const imageResults = await ProductImagesService.getProductImagesByTarget(`gazebo-${opt.value}`);
              
              // If images exist, use the first one, otherwise use fallback
              const imageUrl = imageResults.length > 0 
                ? imageResults[0].url 
                : fallbackUrl;
              
              images[opt.value] = imageUrl;
            } catch (error) {
              console.error(`Error loading image for ${opt.value}:`, error);
              images[opt.value] = fallbackUrl;
            }
          }
        }
      }
      
      return images;
    },
    {
      context: 'fetching truss images',
      showErrorToast: true,
      queryOptions: {
        staleTime: 3600000, // 1 hour - images don't change often
        retry: 2,
      }
    }
  );

  // Calculate price based on current configuration
  const calculatedPrice = calculatePrice(configState);

  const handleConfigChange = (id: string, value: string) => {
    setConfigState((prev: GazeboConfig) => ({
      ...prev, 
      [id as keyof GazeboConfig]: value
    }));
  };
  
  // Create a basket item from the current configuration
  const createBasketItem = () => {
    // Validate configuration if needed
    if (!configState.legType || !configState.sizeType || !configState.trussType) {
      toast({
        variant: "destructive",
        title: "Invalid Configuration",
        description: "Please make sure all options are selected.",
      });
      return null;
    }
    
    // Generate description from configuration
    const legTypeLabel = categoryConfig.options.find(opt => opt.id === "legType")?.options?.find(
      opt => opt.value === configState.legType
    )?.label || configState.legType;
    
    const sizeTypeLabel = categoryConfig.options.find(opt => opt.id === "sizeType")?.options?.find(
      opt => opt.value === configState.sizeType
    )?.label || configState.sizeType;
    
    const trussTypeLabel = categoryConfig.options.find(opt => opt.id === "trussType")?.options?.find(
      opt => opt.value === configState.trussType
    )?.label || configState.trussType;
    
    const description = `Gazebo with ${trussTypeLabel} truss, ${legTypeLabel}, Size: ${sizeTypeLabel}`;
    
    return {
      name: `Gazebo (${trussTypeLabel})`,
      description,
      price: calculatedPrice,
      category,
      customOptions: configState
    };
  };
  
  // Add to basket mutation
  const addToBasketMutation = useSafeMutation(
    (item: any) => {
      // This is a placeholder implementation since basketApi is not fully implemented
      // In a real implementation, this would call basketApi.addToBasket
      console.log("Adding gazebo to basket:", item);
      
      // Simulate API call
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            success: true,
            name: item.name,
            description: item.description
          });
        }, 800);
      });
    },
    {
      context: 'adding gazebo to basket',
      showErrorToast: true,
      showSuccessToast: true,
      successToastTitle: 'Gazebo Added to Basket',
      successToastMessage: (data: any) => `${data.name} added to your basket.`,
      errorToastTitle: 'Failed to Add to Basket',
      mutationOptions: {
        onSuccess: (data) => {
          toast({
            title: "Gazebo Added to Basket",
            description: data.description,
            action: (
              <Button variant="outline" size="sm" asChild>
                <a href="/basket">View Basket</a>
              </Button>
            ),
          });
        }
      }
    }
  );
  
  // Handle adding to basket
  const handleAddToBasket = () => {
    const basketItem = createBasketItem();
    if (!basketItem) return;
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please sign in to add items to your basket.",
      });
      return;
    }
    
    addToBasketMutation.mutate(basketItem);
  };

  // Preview purchase handler
  const handlePreviewPurchase = () => {
    const configString = encodeURIComponent(JSON.stringify(configState));
    const price = calculatedPrice.toFixed(2);
    router.push(
      `/preview?category=${category}&config=${configString}&price=${price}`,
    );
  };

  return (
    <div>
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto bg-card/80 backdrop-blur-sm border border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">{categoryConfig.title}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-8">
            <div className="space-y-6">
              {categoryConfig.options.map((option) => (
                <div key={option.id} className="text-center">
                  <Label
                    htmlFor={option.id}
                    className="text-base font-medium block mb-2"
                  >
                    {option.label}
                  </Label>
                  {option.type === "select" && (
                    <Select
                      value={configState[option.id as keyof GazeboConfig] as string}
                      onValueChange={(value) =>
                        handleConfigChange(option.id, value)
                      }
                    >
                      {/* Added justify-center */}
                      <SelectTrigger
                        id={option.id}
                        className="mt-2 bg-background/70 max-w-sm mx-auto justify-center"
                      >
                        <SelectValue placeholder={`Select ${option.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {option.options?.map((opt) => (
                          // Added justify-center to SelectItem
                          <SelectItem
                            key={opt.value}
                            value={opt.value}
                            className="justify-center"
                          >
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {option.type === "radio" && (
                    <RadioGroup
                      value={configState[option.id as keyof GazeboConfig] as string}
                      onValueChange={(value) =>
                        handleConfigChange(option.id, value)
                      }
                      className={cn(
                        "mt-2 grid gap-4 justify-center",
                        "grid-cols-2 max-w-md mx-auto", // Always side-by-side for radios in gazebo
                      )}
                    >
                      {option.options?.map((opt) => (
                        <Label
                          key={opt.value}
                          htmlFor={`${option.id}-${opt.value}`}
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover/70 p-4 hover:bg-accent/50 hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <RadioGroupItem
                            value={opt.value}
                            id={`${option.id}-${opt.value}`}
                            className="sr-only"
                          />
                          {opt.image && (
                            <div className="mb-2 relative w-full aspect-[4/3] rounded overflow-hidden">
                              {trussImagesQuery.isLoading ? (
                                <div className="flex items-center justify-center w-full h-full bg-muted/50">
                                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                              ) : (
                                <Image
                                  src={
                                    (trussImagesQuery.data && trussImagesQuery.data[opt.value]) ||
                                    `https://picsum.photos/seed/${opt.dataAiHint?.replace(/\s+/g, "-") || opt.value}/200/150`
                                  }
                                  alt={opt.label}
                                  fill
                                  style={{ objectFit: "cover" }}
                                  data-ai-hint={opt.dataAiHint || opt.label}
                                />
                            </div>
                          )}
                          <span className="text-sm font-medium mt-auto">
                            {opt.label}
                          </span>
                        </Label>
                      ))}
                    </RadioGroup>
                  )}
                </div>
              ))}
            </div>
            <div className="space-y-6 border-t border-border/50 pt-6 mt-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Estimated Price (excl. VAT & Delivery)
                </p>
                <p className="text-3xl font-bold">
                  {calculatedPrice !== null
                    ? `£${calculatedPrice.toFixed(2)}`
                    : "Calculating..."}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Button
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={handleAddToBasket}
                  disabled={calculatedPrice <= 0 || addToBasketMutation.isPending}
                >
                  {addToBasketMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add to Basket
                    </>
                  )}
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto"
                  onClick={handlePreviewPurchase}
                  disabled={calculatedPrice <= 0}
                >
                  Preview Purchase <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
