
"use client"; // For potential state like filtering, sorting, actions

import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Search, Filter } from 'lucide-react'; // Icons

// Placeholder data - replace with actual data fetching and type definition
interface Order {
  id: string;
  customerName: string;
  date: string;
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  itemCount: number;
}

const placeholderOrders: Order[] = [
  { id: 'ORD12345', customerName: 'Alice Smith', date: '2024-05-01', total: 21115.00, status: 'Processing', itemCount: 3 },
  { id: 'ORD12346', customerName: 'Bob Johnson', date: '2024-05-03', total: 450.00, status: 'Delivered', itemCount: 1 },
  { id: 'ORD12347', customerName: 'Charlie Brown', date: '2024-05-04', total: 9200.00, status: 'Shipped', itemCount: 1 },
  { id: 'ORD12348', customerName: 'Diana Prince', date: '2024-05-05', total: 150.00, status: 'Pending', itemCount: 2 },
  { id: 'ORD12349', customerName: 'Ethan Hunt', date: '2024-05-06', total: 3200.00, status: 'Cancelled', itemCount: 1 },
];

// Helper function to get badge variant based on status
const getStatusVariant = (status: Order['status']): "default" | "secondary" | "outline" | "destructive" => {
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
  const [orders, setOrders] = useState<Order[]>(placeholderOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<Order['status'] | 'all'>('all');

  // --- Filtering Logic ---
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // --- Actions (Placeholders) ---
  const viewOrderDetails = (orderId: string) => {
    // Navigate to a detailed order view page or open a modal
    alert(`View details for order ${orderId}`);
    // Example navigation: router.push(`/admin/orders/${orderId}`);
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    // TODO: Add API call to update status in the backend
    alert(`Updated status for order ${orderId} to ${newStatus}`);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };


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
                         <DropdownMenuItem onClick={() => setFilterStatus('Pending')}>Pending</DropdownMenuItem>
                         <DropdownMenuItem onClick={() => setFilterStatus('Processing')}>Processing</DropdownMenuItem>
                         <DropdownMenuItem onClick={() => setFilterStatus('Shipped')}>Shipped</DropdownMenuItem>
                         <DropdownMenuItem onClick={() => setFilterStatus('Delivered')}>Delivered</DropdownMenuItem>
                         <DropdownMenuItem onClick={() => setFilterStatus('Cancelled')}>Cancelled</DropdownMenuItem>
                     </DropdownMenuContent>
                 </DropdownMenu>
             </div>
        </div>
      </CardHeader>
      <CardContent>
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
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">£{order.total.toFixed(2)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
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
                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'Processing')} disabled={order.status === 'Processing'}>
                           Mark as Processing
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'Shipped')} disabled={order.status === 'Shipped'}>
                           Mark as Shipped
                        </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'Delivered')} disabled={order.status === 'Delivered'}>
                           Mark as Delivered
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'Cancelled')} className="text-destructive" disabled={order.status === 'Cancelled'}>
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
                  No orders found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
         {/* TODO: Add Pagination Controls here if needed */}
         {/* Example:
         <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm" >Previous</Button>
            <Button variant="outline" size="sm" >Next</Button>
          </div>
         */}
      </CardContent>
    </Card>
  );
}
