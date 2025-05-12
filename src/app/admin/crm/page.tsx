"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  BarChart3, 
  Mail, 
  Phone, 
  User, 
  FileText, 
  Clock, 
  ShoppingCart, 
  ChevronRight, 
  Loader2, 
  MoreHorizontal,
  UserPlus 
} from 'lucide-react';
import { fetchRecentLeadsAction, fetchRecentContactsAction, fetchCustomerSummaryAction } from './actions';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

// Type Definitions for CRM dashboard
interface CustomerSummary {
  totalCustomers: number;
  totalLeads: number;
  openInquiries: number;
  averageConversionRate: number;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  source: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Converted' | 'Lost';
  createdAt: string;
  notes?: string;
}

interface Contact {
  id: string;
  contactType: 'Contact Form' | 'Custom Order' | 'Email' | 'Phone';
  customerName: string;
  customerEmail: string;
  subject?: string;
  date: string;
  status: 'New' | 'Replied' | 'Closed';
}

// Helper function to get badge variant based on status
const getStatusVariant = (status: string): "default" | "secondary" | "outline" | "destructive" => {
  switch (status) {
    case 'New': return 'default';
    case 'Contacted': return 'secondary';
    case 'Qualified': return 'secondary'; 
    case 'Proposal': return 'outline';
    case 'Converted': return 'default';
    case 'Lost': return 'destructive';
    case 'Replied': return 'secondary';
    case 'Closed': return 'outline';
    default: return 'default';
  }
};

export default function CrmDashboardPage() {
  const [summary, setSummary] = useState<CustomerSummary>({
    totalCustomers: 0,
    totalLeads: 0,
    openInquiries: 0,
    averageConversionRate: 0
  });
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [recentContacts, setRecentContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [summaryData, leadsData, contactsData] = await Promise.all([
          fetchCustomerSummaryAction(),
          fetchRecentLeadsAction(),
          fetchRecentContactsAction()
        ]);
        
        setSummary(summaryData);
        setRecentLeads(leadsData);
        setRecentContacts(contactsData);
      } catch (error) {
        console.error("Error loading CRM data:", error);
        toast({
          variant: "destructive",
          title: "Failed to load CRM data",
          description: "There was an error loading the dashboard data. Please try again."
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">CRM Dashboard</h1>
        <Button asChild>
          <Link href="/admin/crm/leads">
            <UserPlus className="mr-2 h-4 w-4" /> Add New Lead
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin inline-block" /> : summary.totalCustomers}
            </div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent">
        <TabsList>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="leads">Lead Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent">
          <div className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Interactions</CardTitle>
                <CardDescription>Latest activities</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Loading data...</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="leads">
          <div className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Lead Pipeline</CardTitle>
                <CardDescription>Track leads</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Lead data will appear here</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
