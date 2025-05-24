"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation"; // Removed useRouter
import {
  Card,
  CardContent,
  // CardDescription, // Unused
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator"; // Unused
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getLeadAction, updateLeadAction } from "../../actions";
import Link from "next/link";

// Interface for the lead object
interface Lead {
  id: string;
  name: string;
  email: string;
  source: string;
  status: string;
  createdAt: string;
  notes?: string;
  collection?: string;
}

export default function LeadDetailPage() {
  const params = useParams();
  const leadId = params.id as string;
  // const router = useRouter(); // Unused
  const { toast } = useToast();

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const leadData = await getLeadAction(leadId);
        setLead(leadData);
        setStatus(leadData.status);
        setNotes(leadData.notes || "");
      } catch (_error) { // error prop unused: Renamed to _error (catch block convention)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load lead details",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [leadId, toast]);

  const handleUpdateLead = async () => {
    setIsSaving(true);
    try {
      const result = await updateLeadAction(leadId, {
        status,
        notes,
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Lead updated successfully",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update lead",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Lead not found</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/admin/crm">Back to CRM</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" className="mr-2" asChild>
          <Link href="/admin/crm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Lead: {lead.name}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Lead Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{lead.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{lead.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Source</p>
                <p className="font-medium">{lead.source}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lead Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Current Status
              </p>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Qualified">Qualified</SelectItem>
                  <SelectItem value="Proposal">Proposal</SelectItem>
                  <SelectItem value="Converted">Converted</SelectItem>
                  <SelectItem value="Lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Notes</p>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this lead"
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleUpdateLead}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Lead
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
