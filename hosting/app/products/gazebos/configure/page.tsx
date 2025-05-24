
"use client"; // Needed for form/state

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { notFound, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

// Import from product service
import { 
  gazeboConfig,
  calculateProductPrice,
  addToBasket,
  ConfigState,
  AnyConfigOption,
  generateConfigurationDescription
} from "@/services/product-service";
import { useAuth } from "@/context/auth-context";

// Loading and error states
interface ConfiguratorState {
  loading: boolean;
  addingToBasket: boolean;
  error: string | null;
}

// --- Component ---

export default function ConfigureGazeboPage() {
  const category = "gazebos";
  const router = useRouter();
  const { user } = useAuth();
  
  // State for the configurator
  const [configState, setConfigState] = useState<ConfigState>(() => {
    // Initialize state based on the category config
    const initialState: ConfigState = {};
    gazeboConfig.options.forEach(opt => {
      initialState[opt.id] = opt.defaultValue;
    });
    return initialState;
  });
  
  // UI state
  const [uiState, setUiState] = useState<ConfiguratorState>({
    loading: false,
    addingToBasket: false,
    error: null
  });
  
  // Price state
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  
  // Calculate initial price when component mounts
  useEffect(() => {
    try {
      const price = calculateProductPrice(category, configState);
      setCalculatedPrice(price);
    } catch (error) {
      console.error("Error calculating initial price:", error);
      setUiState(prev => ({ 
        ...prev, 
        error: "Failed to calculate price. Please try again." 
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Handle configuration changes
  const handleConfigChange = (id: string, value: any) => {
    setConfigState(prev => {
      const newState = { ...prev, [id]: value };
      
      // Update price dynamically
      try {
        const price = calculateProductPrice(category, newState);
        setCalculatedPrice(price);
      } catch (error) {
        console.error("Error calculating price:", error);
        setUiState(prev => ({ 
          ...prev, 
          error: "Failed to calculate price. Please try again." 
        }));
      }
      
      return newState;
    });
  };
  
  // Preview the configured product
  const handlePreviewPurchase = () => {
    try {
      const configString = encodeURIComponent(JSON.stringify(configState));
      const price = calculatedPrice !== null ? calculatedPrice.toFixed(2) : "0.00";
      const description = generateConfigurationDescription(category, configState);
      
      router.push(`/preview?category=${category}&config=${configString}&price=${price}&description=${encodeURIComponent(description)}`);
    } catch (error) {
      console.error("Error navigating to preview:", error);
      setUiState(prev => ({ 
        ...prev, 
        error: "Failed to generate preview. Please try again." 
      }));
    }
  };
  
  // Add the configured product to basket
  const handleAddToBasket = async () => {
    if (!user) {
      // Redirect to login if user is not authenticated
      toast({
        title: "Login Required",
        description: "Please login or create an account to add items to your basket.",
        variant: "destructive"
      });
      router.push(`/login?redirect=${encodeURIComponent(`/products/${category}/configure`)}`);
      return;
    }
    
    // Start loading state
    setUiState(prev => ({ ...prev, addingToBasket: true, error: null }));
    
    try {
      // Use the product service to add to basket
      // In a real implementation, you would use a real product ID
      // For now, we will use a placeholder ID
      const placeholderProductId = `${category}-configurator`;
      
      const result = await addToBasket(
        user.uid, 
        placeholderProductId, 
        1, // quantity
        configState,
        category
      );
      
      if (result) {
        toast({
          title: "Added to Basket",
          description: "Your configured gazebo has been added to your basket.",
        });
        
        // Optionally navigate to the basket
        router.push("/basket");
      } else {
        // Handle case where result is null (failed to add to basket)
        toast({
          title: "Error",
          description: "Failed to add item to basket. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error adding to basket:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      // Reset loading state
      setUiState(prev => ({ ...prev, addingToBasket: false }));
    }
  };

  return (
    <div>
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-3xl mx-auto bg-card/80 backdrop-blur-sm border border-border/50">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">{gazeboConfig.title}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-8">
                {/* Error display */}
                {uiState.error && (
                  <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md text-center">
                    {uiState.error}
                  </div>
                )}
                
               <div className="space-y-6">
                 {gazeboConfig.options.map((option) => (
                  <div key={option.id} className="text-center">
                    <Label htmlFor={option.id} className="text-base font-medium block mb-2">{option.label}</Label>
                    {option.type === "select" && (
                      <Select
                        value={configState[option.id]}
                        onValueChange={(value) => handleConfigChange(option.id, value)}
                      >
                        {/* Added justify-center */}
                        <SelectTrigger id={option.id} className="mt-2 bg-background/70 max-w-sm mx-auto justify-center">
                          <SelectValue placeholder={`Select ${option.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {option.options?.map((opt) => (
                            // Added justify-center to SelectItem
                            <SelectItem key={opt.value} value={opt.value} className="justify-center">{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                     {option.type === "radio" && (
                        <RadioGroup
                            value={configState[option.id]}
                            onValueChange={(value) => handleConfigChange(option.id, value)}
                            className={cn(
                                "mt-2 grid gap-4 justify-center",
                                "grid-cols-2 max-w-md mx-auto" // Always side-by-side for radios in gazebo
                             )}
                         >
                           {option.options?.map((opt) => (
                             <Label key={opt.value} htmlFor={`${option.id}-${opt.value}`} className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover/70 p-4 hover:bg-accent/50 hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
                                <RadioGroupItem value={opt.value} id={`${option.id}-${opt.value}`} className="sr-only" />
                                 {opt.image && (
                                    <div className="mb-2 relative w-full aspect-[4/3] rounded overflow-hidden">
                                        <Image
                                            src={`https://picsum.photos/seed/${opt.dataAiHint?.replace(/\s+/g, "-") || opt.value}/200/150`}
                                            alt={opt.label}
                                            layout="fill"
                                            objectFit="cover"
                                            data-ai-hint={opt.dataAiHint || opt.label}
                                        />
                                    </div>
                                 )}
                                 <span className="text-sm font-medium mt-auto">{opt.label}</span>
                             </Label>
                           ))}
                         </RadioGroup>
                     )}
                  </div>
                ))}
               </div>

               {/* Price & Add to Basket Section - FIXED */}
               <div className="space-y-6 border-t border-border/50 pt-6 mt-4">
                 <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Estimated Price (excl. VAT & Delivery)</p>
                    <p className="text-3xl font-bold">
                       {calculatedPrice !== null ? `£${calculatedPrice.toFixed(2)}` : "Calculating..."}
                    </p>
                 </div>

                 <div className="flex flex-col sm:flex-row gap-3 justify-center">
                   {/* Preview button */}
                   <Button 
                     size="lg" 
                     className="flex-1 max-w-xs mx-auto sm:mx-0" 
                     onClick={handlePreviewPurchase} 
                     disabled={calculatedPrice === null || calculatedPrice <= 0 || uiState.loading || uiState.addingToBasket}
                   >
                     Preview Purchase <ArrowRight className="ml-2 h-5 w-5" />
                   </Button>
                   
                   {/* Add to basket button */}
                   <Button 
                     size="lg" 
                     variant="secondary" 
                     className="flex-1 max-w-xs mx-auto sm:mx-0" 
                     onClick={handleAddToBasket}
                     disabled={calculatedPrice === null || calculatedPrice <= 0 || uiState.loading || uiState.addingToBasket}
                   >
                     {uiState.addingToBasket ? (
                       <>Adding...</>
                     ) : (
                       <>Add to Basket <ShoppingCart className="ml-2 h-5 w-5" /></>
                     )}
                   </Button>
                 </div>
               </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}

