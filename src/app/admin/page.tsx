
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShoppingCart, FileText, Settings, Users, Truck, GalleryHorizontal } from 'lucide-react'; // Example icons, Added Truck and GalleryHorizontal

export default function AdminDashboardPage() {
  // Placeholder data - replace with actual data fetching
  const recentOrdersCount = 5;
  const pendingCustomRequests = 2;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Quick Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentOrdersCount}</div>
            <p className="text-xs text-muted-foreground">in the last 7 days</p>
             <Button variant="link" size="sm" className="px-0" asChild>
                <Link href="/admin/orders">View Orders</Link>
             </Button>
          </CardContent>
        </Card>
        <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Custom Inquiries</CardTitle>
             <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{pendingCustomRequests}</div>
             <p className="text-xs text-muted-foreground">awaiting response</p>
             {/* Link to where custom inquiries are managed (if applicable) */}
             {/* <Button variant="link" size="sm" className="px-0" asChild><Link href="/admin/custom-inquiries">View Inquiries</Link></Button> */}
           </CardContent>
        </Card>
         {/* Add more stat cards if needed (e.g., Total Revenue, New Users) */}
      </div>

      {/* Quick Links Section */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
           <CardDescription>Access common administrative tasks.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
           <Button variant="outline" asChild className="justify-start gap-2">
               <Link href="/admin/products/configurable-prices"><Settings className="h-4 w-4" /> Manage Config Prices</Link>
           </Button>
           <Button variant="outline" asChild className="justify-start gap-2">
                <Link href="/admin/content/gallery"><GalleryHorizontal className="h-4 w-4" /> Update Gallery</Link>
           </Button>
           <Button variant="outline" asChild className="justify-start gap-2">
                 <Link href="/admin/settings/delivery"><Truck className="h-4 w-4" /> Configure Delivery</Link>
           </Button>
            <Button variant="outline" asChild className="justify-start gap-2">
                 <Link href="/admin/users"><Users className="h-4 w-4" /> Manage Users</Link>
           </Button>
             {/* Add more relevant quick links */}
        </CardContent>
      </Card>

      {/* Placeholder for recent activity or other dashboard elements */}
       {/*
       <Card>
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardContent>
             <p className="text-muted-foreground">Recent order updates or user registrations could be listed here.</p>
          </CardContent>
       </Card>
       */}

    </div>
  );
}
