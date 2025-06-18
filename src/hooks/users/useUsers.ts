// src/hooks/users/useUsers.ts
import { useQuery } from '@tanstack/react-query';
import { userService, type User, type GetUsersParams } from '@/services/domain/user-service';

export const USERS_QUERY_KEY_PREFIX = 'users';

export function useUsers(params: GetUsersParams = {}) {
  const queryKey = [USERS_QUERY_KEY_PREFIX, params];

  return useQuery<User[], Error>({
    queryKey: queryKey,
    queryFn: async () => {
      const result = await userService.getUsers(params);
      return result.users;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
}
