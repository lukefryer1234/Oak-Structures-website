// src/hooks/products/useUpdateSpecialDeal.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService, type UpdateSpecialDealData, type SpecialDeal } from '@/services/domain/product-service'; // Adjust path
import { SPECIAL_DEALS_QUERY_KEY_PREFIX } from './useSpecialDeals'; // For cache invalidation
import { useToast } from '@/hooks/use-toast';

interface UpdateVariables {
  dealId: string;
  dealData: UpdateSpecialDealData;
}

export function useUpdateSpecialDeal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<SpecialDeal, Error, UpdateVariables, unknown>({
    mutationFn: ({ dealId, dealData }: UpdateVariables) => {
      return productService.updateSpecialDeal(dealId, dealData);
    },
    onSuccess: (updatedDeal) => {
      queryClient.invalidateQueries({ queryKey: [SPECIAL_DEALS_QUERY_KEY_PREFIX] });
      // Optionally, update the specific item in the cache for immediate UI update
      // queryClient.setQueryData<SpecialDeal[]>([SPECIAL_DEALS_QUERY_KEY_PREFIX], (oldDeals) =>
      //   oldDeals?.map(deal => deal.id === updatedDeal.id ? updatedDeal : deal) ?? []
      // );
      toast({
        title: "Special Deal Updated",
        description: `"${updatedDeal.name}" has been successfully updated.`,
      });
    },
    onError: (error: Error, variables) => {
      toast({
        variant: "destructive",
        title: "Failed to Update Deal",
        description: `Error updating "${variables.dealData.name || variables.dealId}": ${error.message}`,
      });
    },
  });
}
