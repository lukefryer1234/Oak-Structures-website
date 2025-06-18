// src/hooks/products/useCreateSpecialDeal.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService, type CreateSpecialDealData, type SpecialDeal } from '@/services/domain/product-service'; // Adjust path
import { SPECIAL_DEALS_QUERY_KEY_PREFIX } from './useSpecialDeals'; // For cache invalidation
import { useToast } from '@/hooks/use-toast';

export function useCreateSpecialDeal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<SpecialDeal, Error, CreateSpecialDealData, unknown>({
    mutationFn: (dealData: CreateSpecialDealData) => {
      return productService.createSpecialDeal(dealData);
    },
    onSuccess: (newDeal) => {
      queryClient.invalidateQueries({ queryKey: [SPECIAL_DEALS_QUERY_KEY_PREFIX] });
      // Optionally, optimistically update the cache:
      // queryClient.setQueryData<SpecialDeal[]>([SPECIAL_DEALS_QUERY_KEY_PREFIX], (oldDeals) =>
      //   oldDeals ? [...oldDeals, newDeal] : [newDeal]
      // );
      toast({
        title: "Special Deal Created",
        description: `"${newDeal.name}" has been successfully added.`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to Create Deal",
        description: error.message || "An unexpected error occurred.",
      });
    },
  });
}
