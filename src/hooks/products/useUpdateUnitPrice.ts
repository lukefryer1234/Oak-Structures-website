// src/hooks/products/useUpdateUnitPrice.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService, type UpdateUnitPriceData, type UnitPrice } from '@/services/domain/product-service'; // Adjust path
import { UNIT_PRICES_QUERY_KEY_PREFIX } from './useUnitPrices'; // For cache invalidation
import { useToast } from '@/hooks/use-toast';

interface UpdateVariables {
  unitPriceId: string;
  data: UpdateUnitPriceData;
}

export function useUpdateUnitPrice() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<UnitPrice, Error, UpdateVariables, unknown>({
    mutationFn: ({ unitPriceId, data }: UpdateVariables) => {
      return productService.updateUnitPrice(unitPriceId, data);
    },
    onSuccess: (updatedUnitPrice) => {
      queryClient.invalidateQueries({ queryKey: [UNIT_PRICES_QUERY_KEY_PREFIX] });
      // Optionally, update the specific item in the cache for immediate UI update
      queryClient.setQueryData<UnitPrice[]>([UNIT_PRICES_QUERY_KEY_PREFIX], (oldPrices) =>
        oldPrices?.map(p => p.id === updatedUnitPrice.id ? updatedUnitPrice : p) ?? []
      );
      toast({
        title: "Unit Price Updated",
        description: `Price for ${updatedUnitPrice.productType} - ${updatedUnitPrice.oakType} updated to £${updatedUnitPrice.price.toFixed(2)}.`,
      });
    },
    onError: (error: Error, variables) => {
      toast({
        variant: "destructive",
        title: "Failed to Update Unit Price",
        description: `Error updating unit price (ID: ${variables.unitPriceId}): ${error.message}`,
      });
    },
  });
}
