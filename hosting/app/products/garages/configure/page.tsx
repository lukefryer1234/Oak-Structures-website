
"use client"; // Needed for form/state

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Import from product service
import { 
  garageConfig,
  calculateProductPrice,
  addToBasket,
  ConfigState,
  AnyConfigOption,
  generateConfigurationDescription
} from '@/services/product-service';
import { useAuth } from '@/context/auth-context';

// Loading and error states
interface ConfiguratorState {
  loading: boolean;
  addingToBasket: boolean;
  error: string | null;
}

// --- Component ---

export default function ConfigureGaragePage() {
  const category = 'garages'; // Hardcoded for this specific page
  const router = useRouter(); // Initialize router
  const { user } = useAuth();
  
  // State for the configurator
  const [configState, setConfigState] = useState<ConfigState>(() => {
    // Initialize state based on the category config
    const initialState: ConfigState = {};
    garageConfig.options.forEach(opt => {
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
      console.error('Error calculating initial price:', error);
      setUiState(prev => ({ 
        ...prev, 
        error: 'Failed to calculate price. Please try again.' 
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
        console.error('Error calculating price:', error);
        setUiState(prev => ({ 
          ...prev, 
          error: 'Failed to calculate price. Please try again.' 
        }));
      }
      
      return newState;
    });
  };
  
  // Preview the configured product
  const handlePreviewPurchase = () => {
    try {
      const configString = encodeURIComponent(JSON.stringify(configState));
      const price = calculatedPrice !== null ? calculatedPrice.toFixed(2) : '0.00';
      const description = generateConfigurationDescription(category, configState);
      
      router.push(`/preview?category=${category}&config=${configString}&price=${price}&description=${encodeURIComponent(description)}`);
    } catch (error) {
      console.error('Error navigating to preview:', error);
      setUiState(prev => ({ 
        ...prev, 
        error: 'Failed to generate preview. Please try again.' 
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
      // For now, we'll use a placeholder ID
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
          description: "Your configured garage has been added to your basket.",
        });
        
        // Optionally navigate to the basket
        router.push('/basket');
      } else {
        // Handle case where result is null (failed to add to basket)
        toast({
          title: "Error",
          description: "Failed to add item to basket. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error adding to basket:', error);
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
    // Removed relative isolate and background image handling
    <div>
        <div className="container mx-auto px-4 py-12">
           {/* Adjusted card appearance */}
          <Card className="max-w-3xl mx-auto bg-card/80 backdrop-blur-sm border border-border/50">
            <CardHeader className="text-center"> {/* Center align header content */}
              <CardTitle className="text-3xl">{garageConfig.title}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-8">
                {/* Configuration Options */}
               <div className="space-y-6">
                 {garageConfig.options.map((option) => (
                  <div key={option.id} className="text-center"> {/* Center align each option block */}
                    {/* Added text-center to center the label */}
                    <Label htmlFor={option.id} className="text-base font-medium block mb-2">{option.label}</Label>
                    {option.type === 'select' && (
                      <Select
                        value={configState[option.id]}
                        onValueChange={(value) => handleConfigChange(option.id, value)}
                      >
                         {/* Adjusted background and centered */}
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
                     {option.type === 'radio' && (
                        <RadioGroup
                            value={configState[option.id]}
                            onValueChange={(value) => handleConfigChange(option.id, value)}
                             // Make trussType options side-by-side
                            className={cn(
                                "mt-2 grid gap-4 justify-center", // Center the group
                                option.id === 'trussType' ? "grid-cols-2 max-w-md mx-auto" : "grid-cols-1 sm:grid-cols-2" // Use grid-cols-2 for trussType
                             )}
                         >
                           {option.options?.map((opt) => (
                              // Adjusted background and added cursor pointer
                             <Label key={opt.value} htmlFor={`${option.id}-${opt.value}`} className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover/70 p-4 hover:bg-accent/50 hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
                                <RadioGroupItem value={opt.value} id={`${option.id}-${opt.value}`} className="sr-only" />
                                 {/* Add image rendering for radio options */}
                                 {opt.image && (
                                    <div className="mb-2 relative w-full aspect-[4/3] rounded overflow-hidden">
                                        <Image
                                            src={`https://picsum.photos/seed/${opt.dataAiHint?.replace(/\s+/g, '-') || opt.value}/200/150`}
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
                    {option.type === 'slider' && (
                       // Centered slider
                      <div className="mt-2 space-y-2 max-w-sm mx-auto">
                         <Slider
                            id={option.id}
                            min={option.min}
                            max={option.max}
                            step={option.step}
                            value={configState[option.id]}
                            onValueChange={(value) => handleConfigChange(option.id, value)}
                            className="py-2"
                          />
                          <div className="text-center text-sm text-muted-foreground">
                            {configState[option.id]?.[0]} {option.unit || ''}{configState[option.id]?.[0] > 1 ? 's' : ''}
                          </div>
                      </div>
                    )}
                    {/* Standard checkbox rendering (not per bay) */}
                    {option.type === 'checkbox' && (
                       <div className="flex items-center justify-center space-x-2 mt-2">
                         <Checkbox
                            id={option.id}
                            checked={configState[option.id]}
                            onCheckedChange={(checked) => handleConfigChange(option.id, checked)}
                          />
                           {/* Added normal weight */}
                          <Label htmlFor={option.id} className="font-normal">Yes</Label>
                       </div>
                    )}
                  </div>
                ))}
               </div>

                {/* Display error message if there is one */}
                {uiState.error && (
                  <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md text-center">
                    {uiState.error}
                  </div>
                )}

                {/* Price & Add to Basket Section */}
                 {/* Added margin top */}
               <div className="space-y-6 border-t border-border/50 pt-6 mt-4">
                 <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Estimated Price (excl. VAT & Delivery)</p>
                    <p className="text-3xl font-bold">
                       {calculatedPrice !== null ? `£${calculatedPrice.toFixed(2)}` : 'Calculating...'}
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
