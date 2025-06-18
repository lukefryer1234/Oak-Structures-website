"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Trash2, Edit, ShieldCheck, Search, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useUsers, USERS_QUERY_KEY_PREFIX } from '@/hooks/users/useUsers';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, type UserRole, type User } from '@/services/domain/user-service'; // Assuming User type is also from here

const getRoleVariant = (role: UserRole): "default" | "secondary" | "destructive" | "outline" => {
    switch (role) {
        case 'SuperAdmin': return 'destructive';
        case 'Manager': return 'default';
        case 'Customer': return 'secondary';
        default: return 'outline';
    }
}

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: usersData, isLoading, isError, error } = useUsers({ searchQuery: searchTerm });
  // Handle the case where usersData might be undefined initially by defaulting to an empty array for mapping
  const users = usersData || [];

  const { mutate: changeUserRole, isLoading: isChangingRole } = useMutation({
    mutationFn: async (data: { userId: string; newRole: UserRole }) => {
      return userService.updateUserRole(data.userId, data.newRole);
    },
    onSuccess: (updatedUser) => {
      toast({ title: "Role Updated", description: `User ${updatedUser.displayName || updatedUser.email}'s role updated to ${updatedUser.role}` });
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY_PREFIX] });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error Updating Role", description: error.message || 'Could not update user role.' });
    }
  });

  const { mutate: deleteUserFirestore, isLoading: isDeletingUser } = useMutation({
    mutationFn: async (userId: string) => {
      return userService.deleteUser(userId);
    },
    onSuccess: (success, userId) => { // `success` is the result from userService.deleteUser (true)
      if (success) {
        toast({ title: "User Deleted from Firestore", description: `User (ID: ${userId}) was successfully deleted.` });
        queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY_PREFIX] });
      }
    },
    onError: (error: any, userId) => {
      toast({ variant: "destructive", title: "Error Deleting User", description: error.message || `Could not delete user (ID: ${userId}).` });
    }
  });

  const filteredUsers = users.filter(user =>
     (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
     user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditUser = (userId: string) => {
      toast({ title: "Info", description: `Edit user ${userId} functionality not yet implemented. Manage profile via /account/profile for self-edit.`});
  };

  const handleDeleteUser = (userId: string, userName?: string) => {
     if (window.confirm(`Are you sure you want to delete user "${userName || userId}" from Firestore? This action does not remove the user from Firebase Authentication.`)) {
        deleteUserFirestore(userId);
     }
  };

   const handleChangeRole = (userId: string, newRole: UserRole) => {
       if (window.confirm(`Change role for user ${userId} to ${newRole}?`)) {
           changeUserRole({ userId, newRole });
       }
   };

  if (isError && error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-red-500">
        <p>Error loading users: {error.message}</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage user accounts and roles from Firestore.</CardDescription>
            </div>
            <div className="relative w-full sm:w-auto">
                 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                 <Input
                    type="search"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 sm:w-[250px] lg:w-[300px]"
                 />
            </div>
         </div>
      </CardHeader>
      <CardContent>
        {isLoading && users.length === 0 ? (
            <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
               <TableHead className="w-[50px]">Avatar</TableHead>
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
                          <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name ?? user.email}/>
                          <AvatarFallback>{user.name?.[0]?.toUpperCase() || user.email[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                   </TableCell>
                  <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-center">
                     <Badge variant={getRoleVariant(user.role)}>{user.role}</Badge>
                  </TableCell>
                   <TableCell>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}</TableCell>
                   <TableCell className="text-right">{user.orderCount ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isChangingRole || isDeletingUser || isLoading}>
                          {(isChangingRole || isDeletingUser) ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                          <span className="sr-only">User Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditUser(user.id)} disabled={isChangingRole || isDeletingUser}>
                           <Edit className="mr-2 h-4 w-4" /> Edit User (Placeholder)
                        </DropdownMenuItem>
                         <DropdownMenuSeparator />
                         <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                         <DropdownMenuItem onClick={() => handleChangeRole(user.id, 'Customer')} disabled={user.role === 'Customer' || isChangingRole}>
                            Set as Customer
                         </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleChangeRole(user.id, 'Manager')} disabled={user.role === 'Manager' || isChangingRole}>
                            Set as Manager
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleChangeRole(user.id, 'SuperAdmin')} disabled={user.role === 'SuperAdmin' || isChangingRole}>
                            <ShieldCheck className="mr-2 h-4 w-4"/>Set as SuperAdmin
                         </DropdownMenuItem>
                         <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteUser(user.id, user.name)} className="text-destructive focus:bg-destructive/10 focus:text-destructive" disabled={isDeletingUser}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete from Firestore
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  {searchTerm ? 'No users found matching your search.' : 'No users found in the database.'}
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
