"use client";

import React from "react";
import { withPermissionCheck } from "@/components/with-permission-check";
import { AdminSection, PermissionAction } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Activity Logs Page Component
 */
function ActivityLogsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Activity Logs</h1>
          <p className="text-muted-foreground">
            Track and monitor administrator activities
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Activity logs functionality is currently under maintenance.</p>
          <p>Please check back later.</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Export with permission check
export default withPermissionCheck(
  ActivityLogsPage,
  AdminSection.SETTINGS,
  PermissionAction.VIEW,
);
