"use client"; // For potential state like filtering, sorting, actions

import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Search, Filter, Loader2 } from 'lucide-react'; // Added Loader2
import { useOrders, ORDERS_QUERY_KEY_PREFIX } from '@/hooks/orders/useOrders';
import { useUpdateOrderStatus } from '@/hooks/orders/useUpdateOrderStatus';
import type { Order, OrderStatus } from '@/services/domain/order-service'; // Import Order type

// Helper function to get badge variant based on status
const getStatusVariant = (status: OrderStatus): "default" | "secondary" | "outline" | "destructive" => {
   switch (status) {
        case 'Delivered': return 'secondary';
        case 'Processing': return 'default';
        case 'Shipped': return 'outline';
        case 'Cancelled': return 'destructive';
        case 'Pending': return 'default'; // Or another variant for pending
        default: return 'default';
   }
}

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const {
    orders: fetchedOrders, // Rename to avoid conflict if local client-side filtering is kept
    isLoading,
    isError,
    error,
  } = useOrders({
    searchQuery: searchTerm,
    status: filterStatus === 'all' ? undefined : filterStatus as OrderStatus, // Cast to OrderStatus
    // limit: 20 // Example: can be added or made dynamic
  });
  const { mutate: updateStatusMutation, isLoading: isUpdatingStatus } = useUpdateOrderStatus();

  // Use fetchedOrders directly if client-side filtering is removed, or apply client-filter to it
  const orders = fetchedOrders; // Use data from hook directly

  // --- Actions (Placeholders) ---
  const viewOrderDetails = (orderId: string) => {
    // Navigate to a detailed order view page or open a modal
    alert(`View details for order ${orderId}`);
    // Example navigation: router.push(`/admin/orders/${orderId}`);
  };
  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    if (window.confirm(`Change status of order ${orderId} to ${newStatus}?`)) {
      updateStatusMutation({ orderId, status: newStatus });
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  if (isError && error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-red-500">
        <p>Error loading orders: {error.message}</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
             <div>
                 <CardTitle>Manage Orders</CardTitle>
                 <CardDescription>View, search, and update customer orders.</CardDescription>
             </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                 {/* Search Input */}
                 <div className="relative flex-grow sm:flex-grow-0">
                     <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                     <Input
                        type="search"
                        placeholder="Search by Order ID or Customer..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="pl-8 sm:w-[250px] lg:w-[300px]"
                     />
                 </div>
                 {/* Status Filter Dropdown */}
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                         <Button variant="outline" className="flex-shrink-0">
                           <Filter className="mr-2 h-4 w-4" />
                            {filterStatus === 'all' ? 'Filter Status' : filterStatus}
                         </Button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="end">
                         <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                         <DropdownMenuSeparator />
                         <DropdownMenuItem onClick={() => setFilterStatus('all')}>All Statuses</DropdownMenuItem>
                         <DropdownMenuItem onClick={() => setFilterStatus('Pending' as OrderStatus)}>Pending</DropdownMenuItem>
                         <DropdownMenuItem onClick={() => setFilterStatus('Processing' as OrderStatus)}>Processing</DropdownMenuItem>
                         <DropdownMenuItem onClick={() => setFilterStatus('Shipped' as OrderStatus)}>Shipped</DropdownMenuItem>
                         <DropdownMenuItem onClick={() => setFilterStatus('Delivered' as OrderStatus)}>Delivered</DropdownMenuItem>
                         <DropdownMenuItem onClick={() => setFilterStatus('Cancelled' as OrderStatus)}>Cancelled</DropdownMenuItem>
                     </DropdownMenuContent>
                 </DropdownMenu>
             </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
               <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customerName || 'N/A'}</TableCell>
                  <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">£{order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isLoading || isUpdatingStatus}>
                          {isUpdatingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                           <span className="sr-only">Order Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => viewOrderDetails(order.id)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                         <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                         {/* Example Status Update Actions */}
                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'Processing')} disabled={order.status === 'Processing' || isUpdatingStatus}>
                           Mark as Processing
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'Shipped')} disabled={order.status === 'Shipped' || isUpdatingStatus}>
                           Mark as Shipped
                        </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'Delivered')} disabled={order.status === 'Delivered' || isUpdatingStatus}>
                           Mark as Delivered
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'Cancelled')} className="text-destructive" disabled={order.status === 'Cancelled' || isUpdatingStatus}>
                           Mark as Cancelled
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {searchTerm || (filterStatus !== "all") ? "No orders found matching your criteria." : "No orders found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        )}
      </CardContent>
    </Card>
  );
}
