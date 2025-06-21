// src/hooks/products/useUpdateConfigurablePrice.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService, type UpdateConfigurablePriceData, type ConfigurablePrice } from '@/services/domain/product-service';
import { CONFIGURABLE_PRICES_QUERY_KEY_PREFIX } from './useConfigurablePrices';
import { useToast } from '@/hooks/use-toast';

interface UpdateVariables {
  id: string;
  data: UpdateConfigurablePriceData;
}

export function useUpdateConfigurablePrice() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ConfigurablePrice, Error, UpdateVariables, unknown>({
    mutationFn: ({ id, data }: UpdateVariables) => productService.updateConfigurablePrice(id, data),
    onSuccess: (updatedPrice) => {
      queryClient.invalidateQueries({ queryKey: [CONFIGURABLE_PRICES_QUERY_KEY_PREFIX] });
      // Optionally update cache directly
      queryClient.setQueryData<ConfigurablePrice[]>([CONFIGURABLE_PRICES_QUERY_KEY_PREFIX], (oldData) =>
        oldData?.map(p => p.id === updatedPrice.id ? updatedPrice : p) ?? []
      );
      toast({
        title: "Price Configuration Updated",
        description: `"${updatedPrice.configDescription}" updated successfully.`,
      });
    },
    onError: (error: Error, variables) => {
      toast({
        variant: "destructive",
        title: "Failed to Update Price",
        description: `Error updating "${variables.data.configDescription || variables.id}": ${error.message}`,
      });
    },
  });
}
