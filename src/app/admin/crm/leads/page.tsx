"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  // CardFooter, // Unused
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Search,
  // Plus, // Unused
  Filter,
  ArrowUpDown,
  ArrowLeft,
} from "lucide-react";
import { fetchRecentLeadsAction } from "../actions";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface Lead {
  id: string;
  name: string;
  email: string;
  source: string;
  status: string;
  createdAt: string;
  notes?: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sortField, setSortField] = useState<"name" | "createdAt">("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const { toast } = useToast();

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const leadsData = await fetchRecentLeadsAction();
        setLeads(leadsData);
        setFilteredLeads(leadsData);
      } catch (_error) { // error prop unused: Renamed to _error (catch block convention)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load leads",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [toast]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...leads];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (lead) =>
          lead.name.toLowerCase().includes(term) ||
          lead.email.toLowerCase().includes(term),
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((lead) => lead.status === statusFilter);
    }

    // Apply source filter
    if (sourceFilter !== "all") {
      result = result.filter((lead) => lead.source === sourceFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortField === "name") {
        return sortDirection === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        return sortDirection === "asc"
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setFilteredLeads(result);
  }, [leads, searchTerm, statusFilter, sourceFilter, sortField, sortDirection]);

  const toggleSort = (field: "name" | "createdAt") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 justify-between items-start sm:items-center">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="mr-2" asChild>
            <Link href="/admin/crm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Lead Management</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Leads</CardTitle>
          <CardDescription>Manage and track all your leads</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex items-center w-full max-w-sm">
              <Search className="mr-2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Contacted">Contacted</SelectItem>
                    <SelectItem value="Qualified">Qualified</SelectItem>
                    <SelectItem value="Proposal">Proposal</SelectItem>
                    <SelectItem value="Converted">Converted</SelectItem>
                    <SelectItem value="Lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center">
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="Contact Form">Contact Form</SelectItem>
                    <SelectItem value="Custom Order">Custom Order</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No leads found matching your filters.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => toggleSort("name")}
                    >
                      <div className="flex items-center">
                        Name
                        {sortField === "name" && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => toggleSort("createdAt")}
                    >
                      <div className="flex items-center">
                        Date
                        {sortField === "createdAt" && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.source}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            lead.status === "Converted"
                              ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                              : lead.status === "Lost"
                                ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                                : ""
                          }
                        >
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/crm/lead/${lead.id}`}>
                            View & Edit
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
