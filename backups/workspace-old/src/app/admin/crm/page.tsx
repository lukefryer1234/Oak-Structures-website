
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Loader2, UserPlus } from 'lucide-react';
import { fetchCustomerSummaryAction } from './actions'; // Removed unused actions
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

// Type Definitions for CRM dashboard
interface CustomerSummary {
  totalCustomers: number;
  totalLeads: number;
  openInquiries: number;
  averageConversionRate: number;
}

export default function CrmDashboardPage() {
  const [summary, setSummary] = useState<CustomerSummary>({
    totalCustomers: 0,
    totalLeads: 0,
    openInquiries: 0,
    averageConversionRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const summaryData = await fetchCustomerSummaryAction();
        setSummary(summaryData);
      } catch (error: unknown) {
        console.error("Error loading CRM data:", error);
        let message = "There was an error loading the dashboard data. Please try again.";
        if (error instanceof Error) {
            message = error.message;
        }
        toast({
          variant: "destructive",
          title: "Failed to load CRM data",
          description: message
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
        {/* Additional summary cards can be added here, e.g., Total Leads, Open Inquiries, Conversion Rate */}
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin inline-block" /> : summary.totalLeads}
            </div>
            <p className="text-xs text-muted-foreground">From contacts & inquiries</p>
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
                <CardDescription>Latest activities (Placeholder - fetch and display actual data)</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center h-20">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <p className="text-muted-foreground">Recent contact/lead data will appear here.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="leads">
          <div className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Lead Pipeline</CardTitle>
                <CardDescription>Track leads through different stages (Placeholder - fetch and display actual data)</CardDescription>
              </CardHeader>
              <CardContent>
                 {isLoading ? (
                    <div className="flex justify-center items-center h-20">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <p className="text-muted-foreground">Lead data organized by status will appear here.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
