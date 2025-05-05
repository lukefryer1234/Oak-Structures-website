
"use client"; // For state, potential actions

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Trash2, Edit, ShieldCheck } from 'lucide-react'; // Icons
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';

// --- Types and Placeholder Data ---

type UserRole = 'Customer' | 'Manager' | 'SuperAdmin';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  lastLogin?: string; // Optional: Date string or Date object
  orderCount?: number; // Optional: Number of orders placed
  avatarUrl?: string; // Optional
}

// Placeholder data - Fetch from backend
const initialUsers: User[] = [
  { id: 'usr1', name: 'Alice Smith', email: 'alice@example.com', role: 'Customer', lastLogin: '2024-05-01', orderCount: 3, avatarUrl: 'https://picsum.photos/seed/alice/40/40' },
  { id: 'usr2', name: 'Bob Johnson', email: 'bob@example.com', role: 'Customer', lastLogin: '2024-04-28', orderCount: 1 },
  { id: 'usr3', name: 'Admin User', email: 'admin@timberline.com', role: 'Manager', lastLogin: '2024-05-05' },
  { id: 'usr4', name: 'Luke McConversions', email: 'luke@mcconversions.uk', role: 'SuperAdmin', lastLogin: '2024-05-06', avatarUrl: 'https://picsum.photos/seed/luke/40/40' },
];

const getRoleVariant = (role: UserRole): "default" | "secondary" | "destructive" | "outline" => {
    switch (role) {
        case 'SuperAdmin': return 'destructive';
        case 'Manager': return 'default';
        case 'Customer': return 'secondary';
        default: return 'outline';
    }
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user =>
     user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Actions (Placeholders) ---
  const handleEditUser = (userId: string) => {
      // TODO: Implement edit user functionality (e.g., open modal/dialog)
      // This simple version only allows editing own profile via /account/profile
      alert(`Edit user ${userId} clicked (placeholder - use /account/profile for self-edit)`);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
      // IMPORTANT: Add confirmation and safeguards, especially for admin roles
     if (window.confirm(`Are you absolutely sure you want to delete user "${userName}" (${userId})? This action cannot be undone.`)) {
          setUsers(prev => prev.filter(u => u.id !== userId));
          // TODO: API call to delete user
          console.log(`Deleted user ${userId}`);
     }
  };

   const handleChangeRole = (userId: string, newRole: UserRole) => {
       // IMPORTANT: Add confirmation and authorization checks
       if (window.confirm(`Change role for user ${userId} to ${newRole}?`)) {
           setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
            // TODO: API call to update user role
           console.log(`Changed role for user ${userId} to ${newRole}`);
       }
   };


  return (
    <Card>
      <CardHeader>
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage user accounts and roles.</CardDescription>
            </div>
            {/* Search Input */}
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
                          <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name}/>
                          <AvatarFallback>{user.name[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                   </TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-center">
                     <Badge variant={getRoleVariant(user.role)}>{user.role}</Badge>
                  </TableCell>
                   <TableCell>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}</TableCell>
                   <TableCell className="text-right">{user.orderCount ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">User Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditUser(user.id)}>
                           <Edit className="mr-2 h-4 w-4" /> Edit User (Placeholder)
                        </DropdownMenuItem>
                         <DropdownMenuSeparator />
                         <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                         {/* Prevent changing own role or superadmin role easily */}
                         <DropdownMenuItem onClick={() => handleChangeRole(user.id, 'Customer')} disabled={user.role === 'Customer'}>
                            Set as Customer
                         </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleChangeRole(user.id, 'Manager')} disabled={user.role === 'Manager'}>
                            Set as Manager
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleChangeRole(user.id, 'SuperAdmin')} disabled={user.role === 'SuperAdmin'}>
                            <ShieldCheck className="mr-2 h-4 w-4"/>Set as SuperAdmin
                         </DropdownMenuItem>
                         <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteUser(user.id, user.name)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No users found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
         {/* TODO: Add Pagination if needed */}
      </CardContent>
    </Card>
  );
}
