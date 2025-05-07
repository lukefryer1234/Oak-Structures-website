"use client";

import React, { useState, useEffect, startTransition } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Trash2, Edit, ShieldCheck, Search, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { fetchUsersAction, updateUserRoleAction, deleteUserAction, type UserData, type UserRole } from './actions';

const getRoleVariant = (role: UserRole): "default" | "secondary" | "destructive" | "outline" => {
    switch (role) {
        case 'SuperAdmin': return 'destructive';
        case 'Manager': return 'default';
        case 'Customer': return 'secondary';
        default: return 'outline';
    }
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const loadUsers = async () => {
    setIsLoading(true);
    const fetchedUsers = await fetchUsersAction();
    setUsers(fetchedUsers);
    setIsLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter(user =>
     (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
     user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditUser = (userId: string) => {
      toast({ title: "Info", description: `Edit user ${userId} functionality not yet implemented. Manage profile via /account/profile for self-edit.`});
  };

  const handleDeleteUser = async (userId: string, userName?: string) => {
     if (window.confirm(`Are you sure you want to delete user "${userName || userId}" from Firestore? This action does not remove the user from Firebase Authentication.`)) {
        setIsLoading(true); // Indicate loading for the specific action
        const result = await deleteUserAction(userId);
        if (result.success) {
          toast({ title: "User Deleted from Firestore", description: result.message });
          startTransition(() => { // use startTransition to batch state updates
            loadUsers();
          });
        } else {
          toast({ variant: "destructive", title: "Error", description: result.message });
        }
        setIsLoading(false); // Reset loading after action
     }
  };

   const handleChangeRole = async (userId: string, newRole: UserRole) => {
       if (window.confirm(`Change role for user ${userId} to ${newRole}?`)) {
           setIsLoading(true); // Indicate loading for the specific action
           const result = await updateUserRoleAction(userId, newRole);
           if (result.success) {
               toast({ title: "Role Updated", description: result.message });
               startTransition(() => {
                 loadUsers();
               });
           } else {
               toast({ variant: "destructive", title: "Error", description: result.message });
           }
           setIsLoading(false); // Reset loading after action
       }
   };


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
                        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isLoading}>
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                          <span className="sr-only">User Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditUser(user.id)} disabled={isLoading}>
                           <Edit className="mr-2 h-4 w-4" /> Edit User (Placeholder)
                        </DropdownMenuItem>
                         <DropdownMenuSeparator />
                         <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                         <DropdownMenuItem onClick={() => handleChangeRole(user.id, 'Customer')} disabled={user.role === 'Customer' || isLoading}>
                            Set as Customer
                         </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleChangeRole(user.id, 'Manager')} disabled={user.role === 'Manager' || isLoading}>
                            Set as Manager
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleChangeRole(user.id, 'SuperAdmin')} disabled={user.role === 'SuperAdmin' || isLoading}>
                            <ShieldCheck className="mr-2 h-4 w-4"/>Set as SuperAdmin
                         </DropdownMenuItem>
                         <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteUser(user.id, user.name)} className="text-destructive focus:bg-destructive/10 focus:text-destructive" disabled={isLoading}>
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
