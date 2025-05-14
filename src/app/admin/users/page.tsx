"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Trash2,
  Edit,
  ShieldCheck,
  Search,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  useUsers,
  useUpdateUserRole,
  useToggleUserDisabled,
  useDeleteUser,
  type User,
  type UserRole,
} from "./hooks";

const getRoleVariant = (
  role: UserRole,
): "default" | "secondary" | "destructive" | "outline" => {
  switch (role) {
    case "SuperAdmin":
      return "destructive";
    case "Manager":
      return "default";
    case "Customer":
      return "secondary";
    default:
      return "outline";
  }
};

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  
  // React Query hooks
  const { 
    data: users = [], 
    isLoading, 
    isError, 
    error,
    refetch
  } = useUsers();
  
  const { mutate: updateUserRole, isPending: isRoleUpdating } = useUpdateUserRole();
  const { mutate: toggleUserDisabled, isPending: isDisableToggling } = useToggleUserDisabled();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

  // This now filters on the client side for instant feedback while typing
  const filteredUsers = users.filter(
    (user) =>
      (user.name &&
        user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleEditUser = (userId: string) => {
    toast({
      title: "Info",
      description: `Edit user ${userId} functionality not yet implemented. Manage profile via /account/profile for self-edit.`,
    });
  };

  const handleDeleteUser = async (userId: string, userName?: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete user "${userName || userId}" from Firestore? This action does not remove the user from Firebase Authentication.`,
      )
    ) {
      deleteUser(userId);
    }
  };

  const handleChangeRole = async (userId: string, newRole: UserRole) => {
    if (window.confirm(`Change role for user ${userId} to ${newRole}?`)) {
      updateUserRole({ userId, role: newRole });
    }
  };
  
  // Check if any mutation is in progress
  const isMutating = isRoleUpdating || isDisableToggling || isDeleting;

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Manage user accounts, roles, and permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search input */}
        <div className="flex items-center mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users by name or email..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Error handling */}
        {isError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error instanceof Error 
                ? error.message 
                : "Failed to load users. Please try again later."}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-center">Role</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user.avatarUrl ?? undefined}
                          alt={user.name ?? user.email}
                        />
                        <AvatarFallback>
                          {user.name?.[0]?.toUpperCase() ||
                            user.email[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      {user.name || "N/A"}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getRoleVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      {user.orderCount ?? 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                            <span className="sr-only">User Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEditUser(user.id)}
                            disabled={isLoading}
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit User
                            (Placeholder)
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() =>
                              handleChangeRole(user.id, "Customer")
                            }
                            disabled={user.role === "Customer" || isLoading}
                          >
                            Set as Customer
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleChangeRole(user.id, "Manager")}
                            disabled={user.role === "Manager" || isLoading}
                          >
                            Set as Manager
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleChangeRole(user.id, "SuperAdmin")
                            }
                            disabled={user.role === "SuperAdmin" || isLoading}
                          >
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Set as SuperAdmin
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                            disabled={isLoading}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete from
                            Firestore
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    {searchTerm
                      ? "No users found matching your search."
                      : "No users found in the database."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
