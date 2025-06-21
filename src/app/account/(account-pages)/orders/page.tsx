"use client";

import React from 'react';
import { useAuth } from '@/context/auth-context';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useOrders } from '@/hooks/orders/useOrders'; // Verify path if needed
import { type Order } from '@/services/domain/order-service'; // Verify path if needed

const getStatusVariant = (status?: string): "default" | "secondary" | "outline" | "destructive" => {
   if (!status) return "default";
   switch (status.toLowerCase()) {
        case 'delivered':
        case 'completed':
            return 'secondary';
        case 'processing':
        case 'pending':
            return 'default';
        case 'shipped':
            return 'outline';
        case 'cancelled':
        case 'failed':
            return 'destructive';
        default:
            return 'default';
   }
}

export default function OrdersPage() {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;

  // Pass userId to the useOrders hook.
  // The hook's GetOrdersParams allows for userId.
  const { data: ordersData, isLoading, isError, error } = useOrders({ userId: userId });
  const orders = ordersData?.orders || []; // Assuming useOrders returns { orders: Order[], ... }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (isError && error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Failed to load your orders: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
     <>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
        <CardDescription>View your past orders and their status.</CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-muted-foreground">You haven't placed any orders yet.</p>
        ) : (
           <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order: Order) => ( // Explicitly type order
                <TableRow key={order.id} className="border-border/50">
                  <TableCell className="font-medium">
                    <Link href={`/account/orders/${order.id}`} className="hover:underline text-primary">
                      #{order.id.substring(0, 8)}...
                    </Link>
                  </TableCell>
                  <TableCell>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell className="text-right">£{(order.totalAmount / 100).toFixed(2)}</TableCell> {/* Assuming totalAmount is in pence */}
                  <TableCell className="text-center">
                    <Badge variant={getStatusVariant(order.status)}>{order.status || 'Unknown'}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                     <Button variant="outline" size="sm" asChild>
                        <Link href={`/account/orders/${order.id}`}>View Details</Link>
                     </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      {/* Future: Add pagination if useOrders hook supports it */}
     </>
  );
}
