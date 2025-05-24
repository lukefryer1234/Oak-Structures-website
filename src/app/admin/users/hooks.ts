"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export type UserRole = "Customer" | "Manager" | "SuperAdmin";

export interface User {
  id: string;
  name?: string;
  email: string;
  role: UserRole;
  lastLogin?: string;
  orderCount?: number;
  avatarUrl?: string;
  disabled?: boolean;
}

interface QueryParams {
  role?: string;
  limit?: number;
  startAfter?: string;
  disabled?: boolean;
  search?: string;
}

// Hook for fetching users
export function useUsers(params: QueryParams = {}) {
  const { toast } = useToast();

  return useQuery({
    queryKey: ["users", params],
    queryFn: async () => {
      try {
        // Build query string from params
        const queryParams = new URLSearchParams();
        if (params.role) queryParams.set("role", params.role);
        if (params.limit) queryParams.set("limit", params.limit.toString());
        if (params.startAfter) queryParams.set("startAfter", params.startAfter);
        if (params.disabled !== undefined) queryParams.set("disabled", params.disabled.toString());
        if (params.search) queryParams.set("search", params.search);

        const queryString = queryParams.toString();
        const url = `/api/users${queryString ? `?${queryString}` : ""}`;

        const response = await fetch(url);
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to fetch users");
        }

        const data = await response.json();
        return data.users as User[];
      } catch (err) {
        console.error("Error fetching users:", err);
        throw err;
      }
    },
  });
}

// Hook for updating user role
export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update user role");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Role Updated",
        description: `User role has been updated to ${data.role}`,
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user role",
      });
    },
  });
}

// Hook for toggling user disabled status
export function useToggleUserDisabled() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, disabled }: { userId: string; disabled: boolean }) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ disabled }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update user status");
      }

      return await response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "User Status Updated",
        description: `User has been ${variables.disabled ? "disabled" : "enabled"}`,
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user status",
      });
    },
  });
}

// Hook for deleting a user
export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete user");
      }

      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "User Deleted",
        description: "User has been deleted from Firestore",
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user",
      });
    },
  });
}

