// src/hooks/user-addresses/useDeleteUserAddress.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/domain/user-service';
import { USER_ADDRESSES_QUERY_KEY_PREFIX } from './useUserAddresses';
import { useToast } from '@/hooks/use-toast';

export function useDeleteUserAddress(userId: string | undefined | null) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, string, unknown>({ // string is addressId
    mutationFn: (addressId: string) => {
      if (!userId) throw new Error("User ID is required to delete an address.");
      return userService.deleteUserAddress(userId, addressId);
    },
    onSuccess: (data, addressId) => {
      queryClient.invalidateQueries({ queryKey: [USER_ADDRESSES_QUERY_KEY_PREFIX, userId] });
      toast({ title: "Address Deleted", description: "Address removed successfully." });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Failed to Delete Address", description: error.message });
    },
  });
}
