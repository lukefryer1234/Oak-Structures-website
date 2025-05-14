"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ShoppingCart,
  FileText,
  Settings,
  Users,
  Truck,
  GalleryHorizontal,
  // BarChart3, // Unused
  Loader2,
  // CalendarClock, // Unused
  UserPlus,
} from "lucide-react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Unused
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Types for dashboard data
interface DashboardStats {
  recentOrdersCount: number;
  pendingCustomRequests: number;
  newUsers: number;
}

interface RecentOrder {
  id: string;
  customerName: string;
  orderDate: Date;
  total: number;
  status: string;
}

interface RecentActivity {
  id: string;
  type: "order" | "user" | "inquiry";
  title: string;
  description: string;
  timestamp: Date;
  avatar?: string;
}

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    recentOrdersCount: 0,
    pendingCustomRequests: 0,
    newUsers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  // const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]); // recentActivity is written to but never read
  const { toast } = useToast();

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get recent orders
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const ordersQuery = query(
        collection(db, "orders"),
        where("orderDate", ">=", Timestamp.fromDate(oneWeekAgo)),
        orderBy("orderDate", "desc"),
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      const recentOrdersCount = ordersSnapshot.size;

      // Get pending custom inquiries
      const inquiriesQuery = query(
        collection(db, "customOrderInquiries"),
        where("status", "==", "New"),
        limit(10),
      );
      const inquiriesSnapshot = await getDocs(inquiriesQuery);
      const pendingCustomRequests = inquiriesSnapshot.size;

      // Get new users in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const usersQuery = query(
        collection(db, "users"),
        where("createdAt", ">=", Timestamp.fromDate(thirtyDaysAgo)),
      );
      const usersSnapshot = await getDocs(usersQuery);
      const newUsers = usersSnapshot.size;

      // Set dashboard stats
      setStats({
        recentOrdersCount,
        pendingCustomRequests,
        newUsers,
      });

      // Get recent order details for table
      const recentOrdersData: RecentOrder[] = [];
      ordersSnapshot.forEach((doc) => {
        const data = doc.data();
        recentOrdersData.push({
          id: doc.id,
          customerName: data.customerName || "Unknown Customer",
          orderDate: data.orderDate.toDate(),
          total: data.total || 0,
          status: data.status || "Processing",
        });
      });
      setRecentOrders(recentOrdersData.slice(0, 5));

      // Combine recent activity from orders, users, and inquiries
      const activityItems: RecentActivity[] = [];

      // Add recent orders to activity
      recentOrdersData.slice(0, 3).forEach((order) => {
        activityItems.push({
          id: `order-${order.id}`,
          type: "order",
          title: "New Order Placed",
          description: `${order.customerName} placed an order for £${order.total.toFixed(2)}`,
          timestamp: order.orderDate,
        });
      });

      // Add recent user registrations to activity
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        activityItems.push({
          id: `user-${doc.id}`,
          type: "user",
          title: "New User Registration",
          description: `${data.displayName || data.email} created an account`,
          timestamp: data.createdAt.toDate(),
          avatar: data.photoURL,
        });
      });

      // Add recent inquiries to activity
      inquiriesSnapshot.forEach((doc) => {
        const data = doc.data();
        activityItems.push({
          id: `inquiry-${doc.id}`,
          type: "inquiry",
          title: "New Custom Order Inquiry",
          description: `${data.fullName || "A customer"} submitted a custom order request`,
          timestamp: data.submittedAt.toDate(),
        });
      });

      // Sort all activity by timestamp (newest first) and limit to 10 items
      activityItems.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
      );
      // setRecentActivity(activityItems.slice(0, 10)); // recentActivity is not used
      // For now, just log it to console if needed, or remove if truly unused
      console.log("Recent activity items (currently not displayed):", activityItems.slice(0, 10));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        variant: "destructive",
        title: "Failed to load dashboard data",
        description:
          "There was an error loading the dashboard. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, setIsLoading, setStats, setRecentOrders]); // Add state setters used by fetchDashboardData to useCallback deps for clarity

  // Helper function to determine status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Quick Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin inline-block" />
              ) : (
                stats.recentOrdersCount
              )}
            </div>
            <p className="text-xs text-muted-foreground">in the last 7 days</p>
            <Button variant="link" size="sm" className="px-0" asChild>
              <Link href="/admin/orders">View Orders</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Custom Inquiries
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin inline-block" />
              ) : (
                stats.pendingCustomRequests
              )}
            </div>
            <p className="text-xs text-muted-foreground">awaiting response</p>
            <Button variant="link" size="sm" className="px-0" asChild>
              <Link href="/admin/crm">View in CRM</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin inline-block" />
              ) : (
                stats.newUsers
              )}
            </div>
            <p className="text-xs text-muted-foreground">in the last 30 days</p>
            <Button variant="link" size="sm" className="px-0" asChild>
              <Link href="/admin/users">Manage Users</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links Section */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>Access common administrative tasks.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button variant="outline" asChild className="justify-start gap-2">
            <Link href="/admin/products/configurable-prices">
              <Settings className="h-4 w-4" /> Manage Config Prices
            </Link>
          </Button>
          <Button variant="outline" asChild className="justify-start gap-2">
            <Link href="/admin/content/gallery">
              <GalleryHorizontal className="h-4 w-4" /> Update Gallery
            </Link>
          </Button>
          <Button variant="outline" asChild className="justify-start gap-2">
            <Link href="/admin/settings/delivery">
              <Truck className="h-4 w-4" /> Configure Delivery
            </Link>
          </Button>
          <Button variant="outline" asChild className="justify-start gap-2">
            <Link href="/admin/users">
              <Users className="h-4 w-4" /> Manage Users
            </Link>
          </Button>
          {/* Add more relevant quick links */}
        </CardContent>
      </Card>

      {/* Recent Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>
            Latest customer orders placed on your store
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : recentOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.id.substring(0, 8)}
                    </TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>
                      {formatDistanceToNow(order.orderDate, {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      ${order.total.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">
              No recent orders found.
            </p>
          )}
          <div className="mt-4">
            <Button variant="outline" asChild>
              <Link href="/admin/orders">View All Orders</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
