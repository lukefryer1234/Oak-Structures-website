"use client";

import React from "react";
import { withPermissionCheck } from "@/components/with-permission-check";
import { AdminSection, PermissionAction } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Data Exports Page Component
 */
function ExportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Data Exports</h1>
          <p className="text-muted-foreground">
            Export data from your system for backup or analysis
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Exports</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Data export functionality is currently under maintenance.</p>
          <p>Please check back later.</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Export with permission check
export default withPermissionCheck(
  ExportsPage,
  AdminSection.TOOLS,
  PermissionAction.VIEW,
);
