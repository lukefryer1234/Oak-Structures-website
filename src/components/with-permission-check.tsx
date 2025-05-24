"use client";

import React from "react";
import { AdminSection, PermissionAction } from "@/lib/permissions";
import { PermissionCheck } from "@/components/permission-check";
import { useRouter } from "next/navigation";

/**
 * Higher Order Component (HOC) that wraps a page component with permission checking
 * @param Component The component to wrap
 * @param section The admin section this component belongs to
 * @param action The permission action required (defaults to VIEW)
 * @param redirectOnDenied Optional path to redirect to on permission denied
 * @returns A new component that includes permission checking
 */
export function withPermissionCheck<P extends object>(
  Component: React.ComponentType<P>,
  section: AdminSection,
  action: PermissionAction = PermissionAction.VIEW,
  redirectOnDenied?: string,
) {
  // Return a new component that wraps the provided component
  const WithPermissionCheck = (props: P) => {
    const router = useRouter();

    // Custom fallback that redirects if specified
    const handleDenied = () => {
      if (redirectOnDenied) {
        // Use setTimeout to prevent "Cannot update a component while rendering a different component" error
        setTimeout(() => {
          router.push(redirectOnDenied);
        }, 0);
        return null; // Return null while redirecting
      }

      // Default fallback
      return (
        <div className="p-6 max-w-xl mx-auto">
          <PermissionCheck section={section} action={action}>
            {/* This will never be shown due to permission check */}
            <div />
          </PermissionCheck>
        </div>
      );
    };

    return (
      <PermissionCheck
        section={section}
        action={action}
        fallback={handleDenied()}
      >
        <Component {...props} />
      </PermissionCheck>
    );
  };

  // Set display name for debugging
  const componentName = Component.displayName || Component.name || "Component";
  WithPermissionCheck.displayName = `WithPermissionCheck(${componentName})`;

  return WithPermissionCheck;
}

/**
 * Example usage:
 *
 * const ProductsPage = () => {
 *   return <div>Products page content</div>
 * };
 *
 * export default withPermissionCheck(
 *   ProductsPage,
 *   AdminSection.PRODUCTS,
 *   PermissionAction.VIEW,
 *   '/admin' // Redirect to admin dashboard if access denied
 * );
 */
