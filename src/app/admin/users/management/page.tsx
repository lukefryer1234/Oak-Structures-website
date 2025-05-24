"use client";

import React from "react";
import { withPermissionCheck } from "@/components/with-permission-check";
import { AdminSection, PermissionAction } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * User Management Page Component
 */
function UserManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p>User management functionality is currently under maintenance.</p>
          <p>Please check back later.</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Export with permission check
export default withPermissionCheck(
  UserManagementPage,
  AdminSection.USERS,
  PermissionAction.VIEW,
);
