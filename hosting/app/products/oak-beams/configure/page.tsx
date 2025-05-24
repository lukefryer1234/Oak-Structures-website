
"use client"; // Needed for form/state

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { notFound, useRouter } from "next/navigation";
import { ArrowRight, PlusCircle, Trash2, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

// Import from product service
import { 
  oakBeamsConfig,
  calculateProductPrice,
  addToBasket,
  ConfigState,
  AnyConfigOption,
  generateConfigurationDescription
} from "@/services/product-service";
import { useAuth } from "@/context/auth-context";

// Basic component with simplified implementation
export default function ConfigureOakBeamPage() {
  const category = "oak-beams";
  const router = useRouter();
  const { user } = useAuth();
  
  // Initialize state
  const [configState, setConfigState] = useState<ConfigState>({
    oakType: "green",
    dimensions: { length: 200, width: 15, thickness: 15 }
  });
  
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Update price when config changes
  useEffect(() => {
    try {
      const price = calculateProductPrice(category, configState);
      setCalculatedPrice(price);
    } catch (error) {
      console.error("Error calculating price:", error);
    }
  }, [configState, category]);
  
  // Handle configuration changes
  const handleConfigChange = (id: string, value: any) => {
    setConfigState(prev => ({ ...prev, [id]: value }));
  };
  
  // Handle dimension changes
  const handleDimensionChange = (value: string, type: "length" | "width" | "thickness") => {
    setConfigState(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [type]: value
      }
    }));
  };
  
  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(price);
  };
  
  // Add to basket
  const handleAddToBasket = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to your basket",
        variant: "destructive"
      });
      router.push(`/login?redirect=${encodeURIComponent(`/products/${category}/configure`)}`);
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await addToBasket(
        user.uid,
        `${category}-configurator`,
        1,
        configState,
        category
      );
      
      if (result) {
        toast({
          title: "Added to Basket",
          description: "Your configured oak beam has been added to your basket."
        });
        router.push("/basket");
      }
    } catch (error) {
      console.error("Error adding to basket:", error);
      toast({
        title: "Error",
        description: "Failed to add to basket",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto bg-card/80 backdrop-blur-sm border border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">{oakBeamsConfig.title}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-8">
            <div className="space-y-6">
              {oakBeamsConfig.options.map((option) => (
                <div key={option.id} className="text-center">
                  <Label htmlFor={option.id} className="text-base font-medium block mb-2">{option.label}</Label>
                  {option.type === "select" && (
                    <Select
                      value={configState[option.id]}
                      onValueChange={(value) => handleConfigChange(option.id, value)}
                    >
                      <SelectTrigger id={option.id} className="mt-2 bg-background/70 max-w-sm mx-auto justify-center">
                        <SelectValue placeholder={`Select ${option.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {option.options?.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="justify-center">{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {option.type === "dimensions" && (
                    <div className="mt-2 grid grid-cols-3 gap-4 max-w-md mx-auto">
                      <div className="text-center">
                        <Label htmlFor={`${option.id}-length`}>Length ({option.unit})</Label>
                        <Input 
                          id={`${option.id}-length`} 
                          type="number" 
                          min="1" 
                          step="any"
                          value={configState[option.id]?.length || ""}
                          onChange={(e) => handleDimensionChange(e.target.value, "length")}
                          className="mt-1 bg-background/70 text-center"
                        />
                      </div>
                      <div className="text-center">
                        <Label htmlFor={`${option.id}-width`}>Width ({option.unit})</Label>
                        <Input 
                          id={`${option.id}-width`} 
                          type="number" 
                          min="1" 
                          step="any"
                          value={configState[option.id]?.width || ""}
                          onChange={(e) => handleDimensionChange(e.target.value, "width")}
                          className="mt-1 bg-background/70 text-center"
                        />
                      </div>
                      <div className="text-center">
                        <Label htmlFor={`${option.id}-thickness`}>Thickness ({option.unit})</Label>
                        <Input 
                          id={`${option.id}-thickness`} 
                          type="number" 
                          min="1" 
                          step="any"
                          value={configState[option.id]?.thickness || ""}
                          onChange={(e) => handleDimensionChange(e.target.value, "thickness")}
                          className="mt-1 bg-background/70 text-center"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Price & Add to Basket Section */}
            <div className="space-y-6 border-t border-border/50 pt-6 mt-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Estimated Price (excl. VAT & Delivery)</p>
                <p className="text-3xl font-bold">
                  {formatPrice(calculatedPrice)}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  size="lg" 
                  className="flex-1 max-w-xs mx-auto sm:mx-0" 
                  onClick={handleAddToBasket} 
                  disabled={loading || calculatedPrice <= 0}
                >
                  {loading ? "Adding..." : (
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

