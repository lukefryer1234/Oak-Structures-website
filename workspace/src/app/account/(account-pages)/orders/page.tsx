
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from 'next/link';

// Placeholder data - fetch user's orders
const orders = [
  { id: 'ORD12345', date: '2024-05-01', total: 21115.00, status: 'Processing', items: 3 },
  { id: 'ORD12300', date: '2024-03-15', total: 450.00, status: 'Delivered', items: 1 },
  { id: 'ORD11987', date: '2023-12-20', total: 9200.00, status: 'Delivered', items: 1 },
];

const getStatusVariant = (status: string): "default" | "secondary" | "outline" | "destructive" => {
   switch (status.toLowerCase()) {
        case 'delivered': return 'secondary';
        case 'processing': return 'default';
        case 'shipped': return 'outline';
        case 'cancelled': return 'destructive';
        default: return 'default';
   }
}


export default function OrdersPage() {
  return (
     <>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
        <CardDescription>View your past orders and their status.</CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-muted-foreground">You haven&apos;t placed any orders yet.</p>
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
              {orders.map((order) => (
                <TableRow key={order.id} className="border-border/50">
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">£{order.total.toFixed(2)}</TableCell>
                   <TableCell className="text-center">
                        <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                   </TableCell>
                  <TableCell className="text-right">
                     <Button variant="outline" size="sm" asChild>
                        <Link href={`/account/orders`}>View Details</Link>
                     </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
     </>
  );
}
