// src/hooks/products/useCreateConfigurablePrice.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService, type CreateConfigurablePriceData, type ConfigurablePrice } from '@/services/domain/product-service';
import { CONFIGURABLE_PRICES_QUERY_KEY_PREFIX } from './useConfigurablePrices';
import { useToast } from '@/hooks/use-toast';

export function useCreateConfigurablePrice() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ConfigurablePrice, Error, CreateConfigurablePriceData, unknown>({
    mutationFn: (data: CreateConfigurablePriceData) => productService.createConfigurablePrice(data),
    onSuccess: (newPrice) => {
      queryClient.invalidateQueries({ queryKey: [CONFIGURABLE_PRICES_QUERY_KEY_PREFIX] });
      toast({
        title: "Price Configuration Created",
        description: `"${newPrice.configDescription}" added successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to Create Price",
        description: error.message || "An unexpected error occurred.",
      });
    },
  });
}
