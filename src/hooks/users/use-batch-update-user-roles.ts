import { useSafeMutation } from "../use-safe-query";
import { useQueryClient } from "@tanstack/react-query";
import { UserRole } from "@/services/domain/user-service";

type UserRoleUpdate = {
  userId: string;
  role: UserRole;
};

type BatchUpdateUserRolesInput = {
  updates: UserRoleUpdate[];
};

type BatchUpdateUserRolesResponse = {
  users: Array<{
    id: string;
    role: UserRole;
    [key: string]: any; // Additional user properties
  }>;
};

/**
 * Hook for batch updating user roles
 */
export const useBatchUpdateUserRoles = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<
    BatchUpdateUserRolesResponse,
    Error,
    BatchUpdateUserRolesInput
  >(
    async (data) => {
      const response = await fetch("/api/users/batch-update-roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update user roles");
      }

      return response.json();
    },
    {
      context: "batchUpdateUserRoles",
      showErrorToast: true,
      showSuccessToast: true,
      errorToastTitle: "Role Update Failed",
      successToastTitle: "Roles Updated",
      successToastMessage: "User roles were updated successfully",
      mutationOptions: {
        onSuccess: () => {
          // Invalidate users queries to refetch updated data
          queryClient.invalidateQueries(["users"]);
        },
      }
    }
  );
};

/**
 * Convenience hook for updating a single user role
 * Uses the batch update endpoint under the hood
 */
export const useUpdateUserRole = () => {
  const batchUpdateMutation = useBatchUpdateUserRoles();
  
  return {
    ...batchUpdateMutation,
    updateRole: (userId: string, role: UserRole) => {
      return batchUpdateMutation.mutate({
        updates: [{ userId, role }]
      });
    },
    updateRoleAsync: async (userId: string, role: UserRole) => {
      return batchUpdateMutation.mutateAsync({
        updates: [{ userId, role }]
      });
    }
  };
};

