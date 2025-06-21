// src/hooks/user-addresses/useSetDefaultAddress.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/domain/user-service'; // Adjust path if needed
import { USER_ADDRESSES_QUERY_KEY_PREFIX } from './useUserAddresses';
import { useToast } from '@/hooks/use-toast';

// The mutation function will only take addressId
export function useSetDefaultAddress(userId: string | undefined | null) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, string, unknown>( // string is addressId
    (addressId: string) => {
      if (!userId) throw new Error("User ID is required to set a default address.");
      return userService.setDefaultAddress(userId, addressId);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [USER_ADDRESSES_QUERY_KEY_PREFIX, userId] });
        toast({ title: "Default Address Updated", description: "Your default address has been set." });
      },
      onError: (error: Error) => {
        toast({ variant: "destructive", title: "Update Failed", description: error.message });
      },
    }
  );
}
