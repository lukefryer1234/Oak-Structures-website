
// src/app/admin/page.tsx
import { CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold">Admin Dashboard</h1>
      <CardDescription>This area is currently under construction and will be available soon.</CardDescription>
      {/* Test button to confirm if changes to this specific page are picked up */}
      {/* <Button variant="outline" className="mt-4">Hello Button Test on Admin Page</Button> */}
    </div>
  );
}
