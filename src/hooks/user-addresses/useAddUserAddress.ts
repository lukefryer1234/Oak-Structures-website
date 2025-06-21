// src/hooks/user-addresses/useAddUserAddress.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, type CreateAddressData, type Address } from '@/services/domain/user-service';
import { USER_ADDRESSES_QUERY_KEY_PREFIX } from './useUserAddresses';
import { useToast } from '@/hooks/use-toast';

export function useAddUserAddress(userId: string | undefined | null) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<Address, Error, CreateAddressData, unknown>({
    mutationFn: (addressData: CreateAddressData) => {
      if (!userId) throw new Error("User ID is required to add an address.");
      return userService.addUserAddress(userId, addressData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_ADDRESSES_QUERY_KEY_PREFIX, userId] });
      toast({ title: "Address Added", description: "New address saved successfully." });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Failed to Add Address", description: error.message });
    },
  });
}
