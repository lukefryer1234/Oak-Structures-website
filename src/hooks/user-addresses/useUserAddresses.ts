// src/hooks/user-addresses/useUserAddresses.ts
import { useQuery } from '@tanstack/react-query';
import { userService, type Address } from '@/services/domain/user-service'; // Adjust path if needed

export const USER_ADDRESSES_QUERY_KEY_PREFIX = 'userAddresses';

export function useUserAddresses(userId: string | undefined | null) {
  return useQuery<Address[], Error>({
    queryKey: [USER_ADDRESSES_QUERY_KEY_PREFIX, userId],
    queryFn: () => {
      if (!userId) return Promise.resolve([]); // Or throw error if userId is strictly required
      return userService.getUserAddresses(userId);
    },
    enabled: !!userId, // Only run query if userId is available
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
