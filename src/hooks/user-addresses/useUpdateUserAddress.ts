// src/hooks/user-addresses/useUpdateUserAddress.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, type UpdateAddressData, type Address } from '@/services/domain/user-service';
import { USER_ADDRESSES_QUERY_KEY_PREFIX } from './useUserAddresses';
import { useToast } from '@/hooks/use-toast';

interface UpdateVariables { addressId: string; addressData: UpdateAddressData; }

export function useUpdateUserAddress(userId: string | undefined | null) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<Address, Error, UpdateVariables, unknown>({
    mutationFn: ({ addressId, addressData }: UpdateVariables) => {
      if (!userId) throw new Error("User ID is required to update an address.");
      return userService.updateUserAddress(userId, addressId, addressData);
    },
    onSuccess: (updatedAddress) => {
      queryClient.invalidateQueries({ queryKey: [USER_ADDRESSES_QUERY_KEY_PREFIX, userId] });
      // Optionally update cache directly
      queryClient.setQueryData<Address[]>([USER_ADDRESSES_QUERY_KEY_PREFIX, userId], (oldData) =>
        oldData?.map(addr => addr.id === updatedAddress.id ? updatedAddress : addr) ?? []
      );
      toast({ title: "Address Updated", description: "Address updated successfully." });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Failed to Update Address", description: error.message });
    },
  });
}
