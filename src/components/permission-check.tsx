"use client";

import React from "react";
import { useAuth } from "@/context/auth-context";
import {
  AdminSection,
  PermissionAction,
  canViewSection,
  getEffectiveRole,
  hasPermission,
} from "@/lib/permissions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

interface PermissionCheckProps {
  section: AdminSection;
  action?: PermissionAction;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Component that conditionally renders children based on user permissions
 */
export const PermissionCheck: React.FC<PermissionCheckProps> = ({
  section,
  action = PermissionAction.VIEW,
  fallback,
  children,
}) => {
  const { currentUser } = useAuth();

  // Get the user's role from database or context
  // For now, just using email-based lookup until we implement Firestore role retrieval
  const userRole = getEffectiveRole(
    currentUser?.email || null,
    currentUser?.role || null,
  );

  // Check permission
  const permitted = hasPermission(userRole, section, action);

  // If user has permission, render children
  if (permitted) {
    return <>{children}</>;
  }

  // If fallback is provided, render it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default permission denied UI
  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center text-destructive gap-2">
          <ShieldAlert className="h-5 w-5" />
          <span>Access Denied</span>
        </CardTitle>
        <CardDescription>
          You don't have permission to {action} in this section
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Please contact an administrator if you believe this is an error.</p>
      </CardContent>
    </Card>
  );
};
