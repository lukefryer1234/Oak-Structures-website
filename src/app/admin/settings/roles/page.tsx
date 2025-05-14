"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import FirebaseServices from '@/services/firebase';
import { useBatchUpdateUserRoles } from '@/hooks/users/use-batch-update-user-roles';

// UI Components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  Search,
  Users,
  UserCheck,
  Shield,
  ShieldAlert,
  AlertCircle,
  RefreshCw
} from "lucide-react";

// Define user roles
const USER_ROLES = [
  {
    id: "customer",
    name: "Customer",
    description: "Regular user with basic access",
  },
  {
    id: "manager",
    name: "Manager",
    description: "Can manage content and orders",
  },
  { id: "admin", name: "Admin", description: "Full administrative access" },
];

// User interface
interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
  lastLogin: string;
  modifiedRole?: boolean;
}

export default function UserRolesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { currentUser, isUserAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users with React Query
  const { 
    data: users = [], 
    isLoading,
    error: fetchError,
    refetch,
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const constraints = [
        FirebaseServices.firestore.constraints.orderBy('email', 'asc')
      ];
      
      const data = await FirebaseServices.firestore.getCollection<User>('users', {
        constraints
      });
      
      // Add the modifiedRole field to each user
      return data.map(user => ({
        ...user,
        displayName: user.displayName || "No Name",
        role: user.role || "customer",
        lastLogin: user.lastLogin || "Never",
        modifiedRole: false
      }));
    },
    staleTime: 60 * 1000, // 1 minute
  });
  
  // Filtered users based on search query
  const filteredUsers = searchQuery.trim() === ""
    ? users
    : users.filter(user => {
        const query = searchQuery.toLowerCase();
        return (
          user.email.toLowerCase().includes(query) ||
          (user.displayName?.toLowerCase() || "").includes(query)
        );
      });
  
  // Role update mutation using the new hook
  const { mutate: batchUpdateUserRoles, isPending } = useBatchUpdateUserRoles();

  // Handle role change
  const handleRoleChange = (userId: string, newRole: string) => {
    queryClient.setQueryData(['users'], (oldData: User[] | undefined) => {
      if (!oldData) return undefined;
      
      return oldData.map(user => 
        user.id === userId
          ? { ...user, role: newRole, modifiedRole: true }
          : user
      );
    });
  };

  // Save changes using the batch update API
  const saveChanges = () => {
    const modifiedUsers = users.filter(user => user.modifiedRole);
    
    if (modifiedUsers.length === 0) {
      toast({
        description: "No changes to save.",
      });
      return;
    }
    
    // Convert users to the format expected by the batch update hook
    const updates = modifiedUsers.map(user => ({
      userId: user.id,
      role: user.role,
    }));
    
    // Call the batch update hook
    batchUpdateUserRoles({ updates });
  };

  // Removed the useEffect for filtering as it's now handled directly in the component

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <ShieldAlert className="h-4 w-4 text-red-500" />;
      case "manager":
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <UserCheck className="h-4 w-4 text-green-500" />;
    }
  };

  // Check if current user is an admin
  if (!isUserAdmin()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to manage user roles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Only administrators can access this page.</p>
        </CardContent>
      </Card>
    );
  }
  
  // Handle error state
  if (fetchError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>Error Loading Users</span>
          </CardTitle>
          <CardDescription>
            There was a problem loading the user data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            {fetchError instanceof Error 
              ? fetchError.message 
              : "An unknown error occurred"}
          </p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Role Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage access permissions for users in your system
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span>Users</span>
          </CardTitle>
          <CardDescription>
            View and modify user roles. Changes will be saved when you click the
            "Save Changes" button.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by email or name..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-x-2">
              <Button
                onClick={() => refetch()}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button
                onClick={saveChanges}
                variant="default"
                size="sm"
                disabled={
                  !users.some((u) => u.modifiedRole) || isPending || isLoading
                }
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No users match your search." : "No users found."}
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className={user.modifiedRole ? "bg-muted/30" : ""}
                    >
                      <TableCell className="font-medium">
                        {user.displayName || "No Name"}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {getRoleIcon(user.role)}
                          <span className="capitalize">
                            {USER_ROLES.find((r) => r.id === user.role)?.name ||
                              user.role}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString()
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(value) =>
                            handleRoleChange(user.id, value)
                          }
                          disabled={
                            currentUser?.email === user.email || // Prevent changing own role
                            user.email === "luke@mcconversions.uk" // Protect super admin
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {USER_ROLES.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                <div className="flex items-center gap-2">
                                  {getRoleIcon(role.id)}
                                  <span>{role.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {users.some((u) => u.modifiedRole) && (
            <div className="mt-4 p-2 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">
                  {users.filter((u) => u.modifiedRole).length}
                </span>{" "}
                user(s) have unsaved changes. Click "Save Changes" to apply.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Descriptions</CardTitle>
          <CardDescription>
            Understanding the different role permissions in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {USER_ROLES.map((role) => (
              <div
                key={role.id}
                className="flex items-start gap-3 p-3 border rounded-md"
              >
                <div className="mt-0.5">{getRoleIcon(role.id)}</div>
                <div>
                  <h3 className="font-medium">{role.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {role.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
