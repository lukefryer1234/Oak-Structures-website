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
import { Input } from "@/components/ui/input";
import { notFound, useRouter } from "next/navigation";
import { ArrowRight, PlusCircle, Trash2, ShoppingCart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/error/error-boundary";
import { useSafeQuery, useSafeMutation } from "@/hooks/use-safe-query";
import { useAuth } from "@/hooks/use-auth";
import { basketApi } from "@/lib/api/basket-api";
import { ProductService } from "@/services/domain/product-service";

// --- Interfaces ---

interface ConfigOption {
  id: string;
  label: string;
  type: "select" | "dimensions"; // Simplified for Beams
  options?: { value: string; label: string }[];
  defaultValue?: string | { length: number; width: number; thickness: number };
  unit?: string;
}

interface CategoryConfig {
  title: string;
  options: ConfigOption[];
}

interface BeamConfig {
  oakType: string;
  dimensions: {
    length: number;
    width: number;
    thickness: number;
  };
}

interface BeamListItem {
  id: string; // Unique ID for the list item
  oakType: string;
  dimensions: { length: number; width: number; thickness: number };
  volume: number;
  description: string;
  price: number;
}

// Placeholder Basket Item type (align with basket page)
interface BasketItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  // image: string; // Removed image
  href: string;
  // dataAiHint: string; // Removed dataAiHint
  category: string;
}

// --- Config Data ---

const oakBeamsConfig: CategoryConfig = {
  title: "Configure Your Oak Beams",
  options: [
    {
      id: "oakType",
      label: "Oak Type",
      type: "select",
      options: [
        { value: "reclaimed", label: "Reclaimed Oak" },
        { value: "kilned", label: "Kilned Dried Oak" },
        { value: "green", label: "Green Oak" },
      ],
      defaultValue: "green",
    },
    {
      id: "dimensions",
      label: "Dimensions (cm)",
      type: "dimensions",
      unit: "cm",
      defaultValue: { length: 200, width: 15, thickness: 15 },
    },
  ],
};

// --- Unit Prices (Fetch from admin settings in real app) ---
const unitPrices = {
  reclaimed: 1200,
  kilned: 1000,
  green: 800,
};

// --- Helper Functions ---

const calculateVolumeAndPrice = (
  config: BeamConfig,
  prices = unitPrices
): { volume: number; price: number } => {
  // Ensure we're working with numbers by explicitly parsing
  const dims = config.dimensions || { length: 0, width: 0, thickness: 0 };
  
  // Parse dimensions to ensure they're numbers
  const length = typeof dims.length === 'string' ? parseFloat(dims.length) : dims.length || 0;
  const width = typeof dims.width === 'string' ? parseFloat(dims.width) : dims.width || 0;
  const thickness = typeof dims.thickness === 'string' ? parseFloat(dims.thickness) : dims.thickness || 0;
  
  // Convert to meters
  const lengthM = length / 100;
  const widthM = width / 100;
  const thicknessM = thickness / 100;
  
  const volumeM3 = lengthM * widthM * thicknessM;

  // Get the appropriate unit price
  let unitPrice = prices.green; // Default to Green Oak
  if (config.oakType === "reclaimed") {
    unitPrice = prices.reclaimed;
  } else if (config.oakType === "kilned") {
    unitPrice = prices.kilned;
  }

  const price = volumeM3 * unitPrice;
  return { volume: volumeM3, price: Math.max(0, price) };
};

// Helper function to format currency
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(price);
};

// Helper to format dimension values
const parseDimension = (value: number | string | undefined): number => {
  const num = parseFloat(value as string);
  return isNaN(num) || num <= 0 ? 0 : num;
};

// --- Component Wrapper ---

export default function ConfigureOakBeamsPageWrapper() {
  return (
    <ErrorBoundary>
      <ConfigureOakBeamsPage />
    </ErrorBoundary>
  );
}

function ConfigureOakBeamsPage() {
  const category = "oak-beams";
  const categoryConfig = oakBeamsConfig;
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  // State for the current configuration input
  const [configState, setConfigState] = useState<BeamConfig>(() => {
    const initialState: BeamConfig = {
      oakType: categoryConfig.options[0].defaultValue as string,
      dimensions: categoryConfig.options[1].defaultValue as { 
        length: number; 
        width: number; 
        thickness: number 
      }
    };
    return initialState;
  });

  // State for the cutting list
  const [cuttingList, setCuttingList] = useState<BeamListItem[]>([]);

  // Get unit prices from product service (in a real app)
  const unitPricesQuery = useSafeQuery(
    ['unitPrices', 'oakBeams'],
    async () => {
      // In a real implementation, this would fetch from the product service
      // return await ProductService.getUnitPrices('oak-beams');
      
      // For now, return the hardcoded values
      return unitPrices;
    },
    {
      context: 'fetching unit prices',
      showErrorToast: true,
      queryOptions: {
        staleTime: 3600000, // 1 hour - prices don't change often
      }
    }
  );

  // Calculate price based on current config
  const { price: calculatedPrice } = calculateVolumeAndPrice(
    configState, 
    unitPricesQuery.data || unitPrices
  );

  // Handle changes in configuration options (select)
  const handleConfigChange = (id: string, value: string) => {
    setConfigState((prev: BeamConfig) => ({ ...prev, [id as keyof BeamConfig]: value }));
  };

  // Handle changes in dimension inputs
  const handleDimensionChange = (
    value: string,
    type: "length" | "width" | "thickness",
  ) => {
    // Parse value as number to avoid type issues
    const parsedValue = parseDimension(value);
    
    setConfigState((prev: BeamConfig) => {
      const currentDims = prev.dimensions || {};
      const newDims = { ...currentDims, [type]: parsedValue };
      return { ...prev, dimensions: newDims };
    });
  };

  // Shared validation logic
  const validateCurrentBeam = (): {
    isValid: boolean;
    beam?: Omit<BeamListItem, "id">;
    basketItem?: Omit<BasketItem, "id" | "quantity" | "href">;
  } => {
    const dims = {
      length: parseDimension(configState.dimensions?.length),
      width: parseDimension(configState.dimensions?.width),
      thickness: parseDimension(configState.dimensions?.thickness),
    };

    if (dims.length <= 0 || dims.width <= 0 || dims.thickness <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Dimensions",
        description:
          "Please enter valid positive numbers for length, width, and thickness.",
      });
      return { isValid: false };
    }
    if (!configState.oakType) {
      toast({
        variant: "destructive",
        title: "Missing Oak Type",
        description: "Please select an oak type.",
      });
      return { isValid: false };
    }

    const { volume, price } = calculateVolumeAndPrice(configState);

    if (price <= 0) {
      toast({
        variant: "destructive",
        title: "Calculation Error",
        description: "Cannot add item with zero price. Check dimensions.",
      });
      return { isValid: false };
    }

    const description = `${configState.oakType.charAt(0).toUpperCase() + configState.oakType.slice(1)} Oak Beam: ${dims.length}cm L x ${dims.width}cm W x ${dims.thickness}cm T`;
    const productName = `Oak Beam (${configState.oakType.charAt(0).toUpperCase() + configState.oakType.slice(1)})`;

    return {
      isValid: true,
      beam: {
        oakType: configState.oakType,
        dimensions: dims,
        volume: volume,
        description: description,
        price: price,
      },
      basketItem: {
        name: productName,
        description: description,
        price: price,
        // image: `https://picsum.photos/seed/oak-beam-${configState.oakType}/200/200`, // Placeholder image removed
        // dataAiHint: `oak beam ${configState.oakType}`, // Removed
        category: category,
      },
    };
  };

  // Handle adding the current configuration to the cutting list
  const handleAddToCuttingList = () => {
    const { isValid, beam } = validateCurrentBeam();
    if (!isValid || !beam) return;

    const newItem: BeamListItem = {
      id: `beam-${Date.now()}`, // Simple unique ID
      ...beam,
    };

    setCuttingList((prev) => [...prev, newItem]);

    toast({
      title: "Beam Added to List",
      description: newItem.description,
    });
  };

  // Use React Query mutation for adding to basket
  const addToBasketMutation = useSafeMutation(
    (item: Omit<BasketItem, 'id' | 'href'>) => {
      return basketApi.addToBasket({
        productId: `beam-${Date.now()}`, // Generate product ID
        name: item.name,
        description: item.description,
        price: item.price,
        quantity: item.quantity,
        category: item.category,
        customOptions: {
          oakType: configState.oakType,
          dimensions: configState.dimensions
        }
      });
    },
    {
      context: 'adding beam to basket',
      showErrorToast: true,
      showSuccessToast: true,
      successToastTitle: 'Beam Added to Basket',
      successToastMessage: (data) => `${data.name} added to your basket.`,
      errorToastTitle: 'Failed to Add to Basket',
      mutationOptions: {
        onSuccess: (data) => {
          // Show a more detailed toast with action button
          toast({
            title: "Beam Added to Basket",
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
  
  // Handle adding single beam directly to basket
  const handleAddToBasket = () => {
    const { isValid, basketItem } = validateCurrentBeam();
    if (!isValid || !basketItem) return;
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please sign in to add items to your basket.",
      });
      return;
    }

    // Execute the mutation
    addToBasketMutation.mutate({
      ...basketItem,
      quantity: 1, // Always add one at a time this way
    });
  };

  // Handle removing an item from the cutting list
  const handleRemoveFromList = (id: string) => {
    setCuttingList((prev) => prev.filter((item) => item.id !== id));
    toast({
      title: "Beam Removed",
      description: "Item removed from the cutting list.",
    });
  };

  // Calculate total price of the cutting list
  const cuttingListTotal = cuttingList.reduce(
    (sum, item) => sum + item.price,
    0,
  );

  // Use React Query mutation for adding multiple items to basket
  const addCuttingListToBasketMutation = useSafeMutation(
    (items: BeamListItem[]) => {
      // Convert cutting list items to basket items
      const basketItems = items.map(item => ({
        productId: item.id,
        name: `Oak Beam (${item.oakType.charAt(0).toUpperCase() + item.oakType.slice(1)})`,
        description: item.description,
        price: item.price,
        quantity: 1, // Each item in cutting list has quantity 1
        category: category,
        customOptions: {
          oakType: item.oakType,
          dimensions: item.dimensions
        }
      }));
      
      // Use the basket API to add multiple items
      return basketApi.addMultipleToBasket(basketItems);
    },
    {
      context: 'adding cutting list to basket',
      showErrorToast: true,
      showSuccessToast: true,
      successToastTitle: 'Cutting List Added',
      successToastMessage: (data) => `Added ${data.items?.length || 0} beam(s) to your basket.`,
      errorToastTitle: 'Failed to Add Cutting List',
      mutationOptions: {
        onSuccess: () => {
          // Clear the cutting list after successfully adding to basket
          setCuttingList([]);
          
          // Navigate to basket page
          router.push('/basket');
        }
      }
    }
  );
  
  // Handle proceeding to checkout with the cutting list
  const handleProceedToCheckout = () => {
    if (cuttingList.length === 0) {
      toast({
        variant: "destructive",
        title: "Empty List",
        description: "Please add at least one beam to the cutting list.",
      });
      return;
    }
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please sign in to add items to your basket.",
      });
      return;
    }
    
    // Execute the mutation with the cutting list
    addCuttingListToBasketMutation.mutate(cuttingList);
  };

  return (
    <div>
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto bg-card/80 backdrop-blur-sm border border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">{categoryConfig.title}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-8">
            {/* --- Configuration Section --- */}
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
                      value={configState[option.id as "oakType"]}
                      onValueChange={(value) =>
                        handleConfigChange(option.id, value)
                      }
                    >
                      <SelectTrigger
                        id={option.id}
                        className="mt-2 bg-background/70 max-w-sm mx-auto justify-center"
                      >
                        <SelectValue placeholder={`Select ${option.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {option.options?.map((opt) => (
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
                  {option.type === "dimensions" && (
                    <div className="mt-2 grid grid-cols-3 gap-4 max-w-md mx-auto">
                      <div className="text-center">
                        <Label htmlFor={`${option.id}-length`}>
                          Length ({option.unit})
                        </Label>
                        <Input
                          id={`${option.id}-length`}
                          type="number"
                          min="1"
                          step="any"
                          value={configState.dimensions?.length || ""}
                          onChange={(e) =>
                            handleDimensionChange(e.target.value, "length")
                          }
                          className="mt-1 bg-background/70 text-center"
                        />
                      </div>
                      <div className="text-center">
                        <Label htmlFor={`${option.id}-width`}>
                          Width ({option.unit})
                        </Label>
                        <Input
                          id={`${option.id}-width`}
                          type="number"
                          min="1"
                          step="any"
                          value={configState.dimensions?.width || ""}
                          onChange={(e) =>
                            handleDimensionChange(e.target.value, "width")
                          }
                          className="mt-1 bg-background/70 text-center"
                        />
                      </div>
                      <div className="text-center">
                        <Label htmlFor={`${option.id}-thickness`}>
                          Thickness ({option.unit})
                        </Label>
                        <Input
                          id={`${option.id}-thickness`}
                          type="number"
                          min="1"
                          step="any"
                          value={configState.dimensions?.thickness || ""}
                          onChange={(e) =>
                            handleDimensionChange(e.target.value, "thickness")
                          }
                          className="mt-1 bg-background/70 text-center"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Price & Add Buttons */}
              <div className="space-y-6 border-t border-border/50 pt-6 mt-4">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Estimated Price for this Beam (excl. VAT & Delivery)
                  </p>
                  <p className="text-3xl font-bold">
                    {calculatedPrice !== null
                      ? formatPrice(calculatedPrice)
                      : "Calculating..."}
                  </p>
                </div>
                {/* Buttons container */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto"
                    onClick={handleAddToCuttingList}
                    disabled={calculatedPrice <= 0}
                  >
                    <PlusCircle className="mr-2 h-5 w-5" /> Add to Cutting List
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full sm:w-auto"
                    onClick={handleAddToBasket}
                    disabled={calculatedPrice <= 0}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" /> Add Direct to
                    Basket
                  </Button>
                </div>
              </div>
            </div>

            {/* --- Cutting List Section --- */}
            {cuttingList.length > 0 && (
              <div className="space-y-6 border-t border-border/50 pt-6 mt-8">
                <h3 className="text-xl font-semibold text-center">
                  Cutting List
                </h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right w-[50px]">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cuttingList.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatPrice(item.price)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleRemoveFromList(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <Separator className="my-4 border-border/50" />
                <div className="text-right space-y-2">
                  <p className="text-lg font-semibold">
                    Cutting List Total: {formatPrice(cuttingListTotal)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    (Excl. VAT & Delivery)
                  </p>
                  <Button
                    size="lg"
                    className="ml-auto block"
                    onClick={handleProceedToCheckout}
                  >
                    Add List to Basket & Proceed{" "}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
