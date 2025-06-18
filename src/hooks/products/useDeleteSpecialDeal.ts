// src/hooks/products/useDeleteSpecialDeal.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/domain/product-service'; // Adjust path
import { SPECIAL_DEALS_QUERY_KEY_PREFIX } from './useSpecialDeals'; // For cache invalidation
import { useToast } from '@/hooks/use-toast';

export function useDeleteSpecialDeal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, string, unknown>({ // string is dealId
    mutationFn: (dealId: string) => {
      return productService.deleteSpecialDeal(dealId);
    },
    onSuccess: (data, dealId) => {
      queryClient.invalidateQueries({ queryKey: [SPECIAL_DEALS_QUERY_KEY_PREFIX] });
      // Optimistically remove from cache:
      // queryClient.setQueryData<SpecialDeal[]>([SPECIAL_DEALS_QUERY_KEY_PREFIX], (oldDeals) =>
      //   oldDeals?.filter(deal => deal.id !== dealId) ?? []
      // );
      toast({
        title: "Special Deal Deleted",
        description: `Deal (ID: ${dealId}) has been successfully deleted.`,
      });
    },
    onError: (error: Error, dealId) => {
      toast({
        variant: "destructive",
        title: "Failed to Delete Deal",
        description: `Error deleting deal (ID: ${dealId}): ${error.message}`,
      });
    },
  });
}
