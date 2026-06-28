import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Buildings, Users, Globe, Plus, Gear, ArrowSquareOut, Envelope, UserPlus, Trash, PencilSimple, DotsThree, PaperPlaneTilt, ChartBar, TrendUp, Eye, Check, X, Stack, Trophy, Copy, SlidersHorizontal } from "@phosphor-icons/react"
import { useLocation } from "wouter";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import DashboardLayout from "./layout";

interface Agency {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  contactEmail: string | null;
  heroText: string | null;
  isActive: boolean;
  isFeatured: boolean;
  clientCount: number;
  totalWebsites: number;
  createdAt: string;
}

interface AgencyClient {
  id: string;
  agencyId: string;
  userId: string;
  clientName: string;
  notes: string | null;
  status: string;
  relationshipType: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  websiteCount?: number;
}

interface ClientWebsite {
  id: string;
  domain: string;
  publicId: string;
  name: string | null;
  clientId: string;
  clientName: string;
  clientEmail: string;
}

interface AgencyAnalytics {
  totalImpressions: number;
  totalAccepts: number;
  totalRejects: number;
  totalCustomizes: number;
  acceptanceRate: number;
  websiteCount: number;
  clientCount: number;
  byClient: {
    clientId: string;
    clientName: string;
    websiteCount: number;
    impressions: number;
    accepts: number;
    rejects: number;
    acceptanceRate: number;
  }[];
}

interface AgencyInvite {
  id: string;
  agencyId: string;
  email: string;
  status: string;
  message: string | null;
  createdAt: string;
}

function PartnerBadgeSection({ agencySlug, agencyName }: { agencySlug: string; agencyName: string }) {
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>('light');
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [selectedAspect, setSelectedAspect] = useState<'wide' | 'square'>('wide');
  const [embedType, setEmbedType] = useState<'script' | 'image'>('script');
  
  const baseUrl = window.location.origin;
  
  const getEmbedCode = () => {
    if (embedType === 'script') {
      return `<!-- ConsentEase Partner Badge -->
<div id="consentease-partner-badge">
  <script src="${baseUrl}/api/partner-badge/${agencySlug}/script.js" data-theme="${selectedTheme}" data-size="${selectedSize}" data-aspect="${selectedAspect}"></script>
</div>`;
    } else {
      return `<!-- ConsentEase Partner Badge -->
<a href="${baseUrl}/partner/${agencySlug}" target="_blank" rel="noopener noreferrer" title="ConsentEase Verified Partner">
  <img src="${baseUrl}/api/partner-badge/${agencySlug}/badge.svg?theme=${selectedTheme}&size=${selectedSize}&aspect=${selectedAspect}" alt="ConsentEase Partner Badge" />
</a>`;
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(getEmbedCode());
    toast.success("Embed code copied to clipboard!");
  };
  
  const badgePreviewUrl = `${baseUrl}/api/partner-badge/${agencySlug}/badge.svg?theme=${selectedTheme}&size=${selectedSize}&aspect=${selectedAspect}`;
  
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy size={20} className="text-primary" />
            Partner Badge
          </CardTitle>
          <CardDescription>
            Display your ConsentEase Partner status on your website. This badge verifies your partnership and links to your partner profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <div className="flex gap-2">
                <Button
                  variant={selectedTheme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTheme('light')}
                  data-testid="button-theme-light"
                >
                  Light
                </Button>
                <Button
                  variant={selectedTheme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTheme('dark')}
                  data-testid="button-theme-dark"
                >
                  Dark
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Aspect Ratio</Label>
              <div className="flex gap-2">
                <Button
                  variant={selectedAspect === 'wide' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedAspect('wide')}
                  data-testid="button-aspect-wide"
                >
                  16:9 Wide
                </Button>
                <Button
                  variant={selectedAspect === 'square' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedAspect('square')}
                  data-testid="button-aspect-square"
                >
                  1:1 Square
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedAspect === 'wide' 
                  ? "Horizontal badge, ideal for footers and headers."
                  : "Compact square badge, ideal for sidebars."}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Size</Label>
              <div className="flex gap-2">
                <Button
                  variant={selectedSize === 'small' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSize('small')}
                  data-testid="button-size-small"
                >
                  Small
                </Button>
                <Button
                  variant={selectedSize === 'medium' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSize('medium')}
                  data-testid="button-size-medium"
                >
                  Medium
                </Button>
                <Button
                  variant={selectedSize === 'large' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSize('large')}
                  data-testid="button-size-large"
                >
                  Large
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Embed Type</Label>
              <div className="flex gap-2">
                <Button
                  variant={embedType === 'script' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEmbedType('script')}
                  data-testid="button-embed-script"
                >
                  Script (Recommended)
                </Button>
                <Button
                  variant={embedType === 'image' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEmbedType('image')}
                  data-testid="button-embed-image"
                >
                  Image Only
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {embedType === 'script' 
                  ? "Script embed auto-verifies your partner status and stays up to date."
                  : "Image embed is simpler but won't auto-update if your status changes."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Preview & Embed Code</CardTitle>
          <CardDescription>
            Copy the code below and paste it into your website.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Badge Preview</Label>
            <div className={`p-6 rounded-lg border flex items-center justify-center ${selectedTheme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
              <img 
                src={badgePreviewUrl} 
                alt="Partner Badge Preview" 
                data-testid="img-badge-preview"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Embed Code</Label>
            <div className="relative">
              <Textarea
                value={getEmbedCode()}
                readOnly
                className="font-mono text-xs h-32 resize-none"
                data-testid="textarea-embed-code"
              />
              <Button
                size="sm"
                className="absolute top-2 right-2"
                onClick={copyToClipboard}
                data-testid="button-copy-embed"
              >
                <Copy size={16} className="mr-1" />
                Copy
              </Button>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Installation Instructions</h4>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Copy the embed code above</li>
              <li>Paste it in your website's footer or sidebar</li>
              <li>The badge will automatically link to your partner profile</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AgencyDashboard() {
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isBulkActionDialogOpen, setIsBulkActionDialogOpen] = useState(false);
  const [selectedWebsites, setSelectedWebsites] = useState<string[]>([]);
  const [removingClient, setRemovingClient] = useState<{ id: string; name: string } | null>(null);
  
  const [agencyForm, setAgencyForm] = useState({
    name: "",
    slug: "",
    description: "",
    logoUrl: "",
    websiteUrl: "",
    contactEmail: "",
    heroText: "",
  });

  const [clientForm, setClientForm] = useState({
    email: "",
    clientName: "",
    notes: "",
    relationshipType: "managed",
  });

  const [inviteForm, setInviteForm] = useState({
    email: "",
    message: "",
  });

  const [bulkUpdates, setBulkUpdates] = useState({
    position: "",
    theme: "",
  });

  const { data: agency, isLoading: agencyLoading } = useQuery<Agency>({
    queryKey: ["/api/agency"],
    queryFn: async () => {
      const res = await fetch("/api/agency", { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch agency");
      return res.json();
    },
  });

  const { data: clients = [], isLoading: clientsLoading } = useQuery<AgencyClient[]>({
    queryKey: ["/api/agency/clients"],
    queryFn: async () => {
      const res = await fetch("/api/agency/clients", { credentials: "include" });
      if (res.status === 404) return [];
      if (!res.ok) throw new Error("Failed to fetch clients");
      return res.json();
    },
    enabled: !!agency,
  });

  const { data: websites = [] } = useQuery<ClientWebsite[]>({
    queryKey: ["/api/agency/websites"],
    queryFn: async () => {
      const res = await fetch("/api/agency/websites", { credentials: "include" });
      if (res.status === 404) return [];
      if (!res.ok) throw new Error("Failed to fetch websites");
      return res.json();
    },
    enabled: !!agency,
  });

  const { data: analytics } = useQuery<AgencyAnalytics>({
    queryKey: ["/api/agency/analytics"],
    queryFn: async () => {
      const res = await fetch("/api/agency/analytics", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
    enabled: !!agency,
  });

  const { data: invites = [] } = useQuery<AgencyInvite[]>({
    queryKey: ["/api/agency/invites"],
    queryFn: async () => {
      const res = await fetch("/api/agency/invites", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!agency,
  });

  const createAgencyMutation = useMutation({
    mutationFn: async (data: typeof agencyForm) => {
      const res = await fetch("/api/agency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create agency");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agency"] });
      setIsCreateDialogOpen(false);
      toast.success("Agency created successfully!");
      setAgencyForm({ name: "", slug: "", description: "", logoUrl: "", websiteUrl: "", contactEmail: "", heroText: "" });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateAgencyMutation = useMutation({
    mutationFn: async (data: Partial<typeof agencyForm>) => {
      const res = await fetch("/api/agency", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update agency");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agency"] });
      setIsEditDialogOpen(false);
      toast.success("Agency updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const addClientMutation = useMutation({
    mutationFn: async (data: typeof clientForm) => {
      const res = await fetch("/api/agency/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add client");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agency/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/agency"] });
      setIsAddClientDialogOpen(false);
      toast.success("Client added successfully!");
      setClientForm({ email: "", clientName: "", notes: "", relationshipType: "managed" });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const removeClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      const res = await fetch(`/api/agency/clients/${clientId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to remove client");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agency/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/agency/websites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/agency"] });
      toast.success("Client removed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const sendInviteMutation = useMutation({
    mutationFn: async (data: typeof inviteForm) => {
      const res = await fetch("/api/agency/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to send invite");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agency/invites"] });
      setIsInviteDialogOpen(false);
      toast.success("Invitation sent successfully!");
      setInviteForm({ email: "", message: "" });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async (data: { websiteIds: string[]; updates: Record<string, any> }) => {
      const res = await fetch("/api/agency/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update websites");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/agency/websites"] });
      setIsBulkActionDialogOpen(false);
      setSelectedWebsites([]);
      toast.success(`Updated ${data.updated} websites successfully!`);
      setBulkUpdates({ position: "", theme: "" });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleCreateAgency = (e: React.FormEvent) => {
    e.preventDefault();
    createAgencyMutation.mutate(agencyForm);
  };

  const handleEditAgency = (e: React.FormEvent) => {
    e.preventDefault();
    updateAgencyMutation.mutate(agencyForm);
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    addClientMutation.mutate(clientForm);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    sendInviteMutation.mutate(inviteForm);
  };

  const handleBulkUpdate = () => {
    const updates: Record<string, any> = {};
    if (bulkUpdates.position) updates.position = bulkUpdates.position;
    if (bulkUpdates.theme) updates.theme = bulkUpdates.theme;
    
    if (Object.keys(updates).length === 0) {
      toast.error("Please select at least one setting to update");
      return;
    }
    
    bulkUpdateMutation.mutate({ websiteIds: selectedWebsites, updates });
  };

  const toggleWebsiteSelection = (websiteId: string) => {
    setSelectedWebsites(prev => 
      prev.includes(websiteId) 
        ? prev.filter(id => id !== websiteId)
        : [...prev, websiteId]
    );
  };

  const selectAllWebsites = () => {
    if (selectedWebsites.length === websites.length) {
      setSelectedWebsites([]);
    } else {
      setSelectedWebsites(websites.map(w => w.id));
    }
  };

  const openEditDialog = () => {
    if (agency) {
      setAgencyForm({
        name: agency.name,
        slug: agency.slug,
        description: agency.description || "",
        logoUrl: agency.logoUrl || "",
        websiteUrl: agency.websiteUrl || "",
        contactEmail: agency.contactEmail || "",
        heroText: agency.heroText || "",
      });
      setIsEditDialogOpen(true);
    }
  };

  const getRelationshipBadge = (type: string) => {
    switch (type) {
      case "managed":
        return <Badge variant="default">Managed</Badge>;
      case "lifetime":
        return <Badge variant="secondary">Lifetime Deal</Badge>;
      case "referred":
        return <Badge variant="outline">Referred</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (agencyLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!agency) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <Buildings size={64} className="text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold mb-2">Set Up Your Agency</h1>
          <p className="text-muted-foreground mb-6">
            Create your agency profile to start managing client accounts and their consent banners from one central dashboard.
          </p>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" data-testid="button-create-agency">
                <Plus size={16} className="mr-2" />
                Create Agency
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Your Agency</DialogTitle>
                <DialogDescription>
                  Set up your agency profile. This will be visible to your clients.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAgency} className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Agency Name *</Label>
                    <Input
                      id="name"
                      placeholder="My Digital Agency"
                      value={agencyForm.name}
                      onChange={(e) => setAgencyForm({ ...agencyForm, name: e.target.value })}
                      required
                      data-testid="input-agency-name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="slug">URL Slug *</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">consentease.io/agency/</span>
                      <Input
                        id="slug"
                        placeholder="my-agency"
                        value={agencyForm.slug}
                        onChange={(e) => setAgencyForm({ ...agencyForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                        required
                        className="flex-1"
                        data-testid="input-agency-slug"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="websiteUrl">Website URL</Label>
                    <Input
                      id="websiteUrl"
                      type="url"
                      placeholder="https://myagency.com"
                      value={agencyForm.websiteUrl}
                      onChange={(e) => setAgencyForm({ ...agencyForm, websiteUrl: e.target.value })}
                      data-testid="input-agency-website"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="contact@myagency.com"
                      value={agencyForm.contactEmail}
                      onChange={(e) => setAgencyForm({ ...agencyForm, contactEmail: e.target.value })}
                      data-testid="input-agency-email"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="We help businesses achieve GDPR compliance..."
                      value={agencyForm.description}
                      onChange={(e) => setAgencyForm({ ...agencyForm, description: e.target.value })}
                      rows={3}
                      data-testid="input-agency-description"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createAgencyMutation.isPending} data-testid="button-submit-agency">
                    {createAgencyMutation.isPending ? "Creating..." : "Create Agency"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">{agency.name}</h1>
            <p className="text-muted-foreground">Manage your agency clients and their consent banners</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={openEditDialog} data-testid="button-edit-agency">
              <Gear size={16} className="mr-2" />
              Settings
            </Button>
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="button-invite-client">
                  <PaperPlaneTilt size={16} className="mr-2" />
                  Invite
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite New Client</DialogTitle>
                  <DialogDescription>
                    Send an email invitation to a potential client. They'll receive a link to sign up through your agency.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSendInvite} className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="inviteEmail">Email Address *</Label>
                      <Input
                        id="inviteEmail"
                        type="email"
                        placeholder="prospect@company.com"
                        value={inviteForm.email}
                        onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                        required
                        data-testid="input-invite-email"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="inviteMessage">Personal Message (optional)</Label>
                      <Textarea
                        id="inviteMessage"
                        placeholder="Hi! I'd like to help you get compliant with GDPR..."
                        value={inviteForm.message}
                        onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                        rows={3}
                        data-testid="input-invite-message"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={sendInviteMutation.isPending} data-testid="button-send-invite">
                      <PaperPlaneTilt size={16} className="mr-2" />
                      {sendInviteMutation.isPending ? "Sending..." : "Send Invitation"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-client">
                  <UserPlus size={16} className="mr-2" />
                  Add Client
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Client</DialogTitle>
                  <DialogDescription>
                    Link an existing ConsentEase account to your agency. The client must already have an account.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddClient} className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="clientEmail">Client Email *</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        placeholder="client@company.com"
                        value={clientForm.email}
                        onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                        required
                        data-testid="input-client-email"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="clientName">Display Name</Label>
                      <Input
                        id="clientName"
                        placeholder="Client Company Name"
                        value={clientForm.clientName}
                        onChange={(e) => setClientForm({ ...clientForm, clientName: e.target.value })}
                        data-testid="input-client-name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="relationshipType">Relationship Type</Label>
                      <Select
                        value={clientForm.relationshipType}
                        onValueChange={(value) => setClientForm({ ...clientForm, relationshipType: value })}
                      >
                        <SelectTrigger data-testid="select-relationship-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="managed">Managed (Agency-managed account)</SelectItem>
                          <SelectItem value="lifetime">Lifetime Deal (Self-created, linked)</SelectItem>
                          <SelectItem value="referred">Referred (Referral relationship)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="clientNotes">Notes</Label>
                      <Textarea
                        id="clientNotes"
                        placeholder="Internal notes about this client..."
                        value={clientForm.notes}
                        onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                        rows={2}
                        data-testid="input-client-notes"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddClientDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={addClientMutation.isPending} data-testid="button-submit-client">
                      {addClientMutation.isPending ? "Adding..." : "Add Client"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users size={16} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-client-count">{clients.length}</div>
              <p className="text-xs text-muted-foreground">Active client accounts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Websites</CardTitle>
              <Globe size={16} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-website-count">{websites.length}</div>
              <p className="text-xs text-muted-foreground">Across all clients</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agency Status</CardTitle>
              <Buildings size={16} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant={agency.isActive ? "default" : "secondary"}>
                  {agency.isActive ? "Active" : "Inactive"}
                </Badge>
                {agency.isFeatured && <Badge variant="outline">Featured</Badge>}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {agency.websiteUrl && (
                  <a href={agency.websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                    {agency.websiteUrl.replace(/^https?:\/\//, '')}
                    <ArrowSquareOut size={12} />
                  </a>
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="clients" className="space-y-4">
          <TabsList>
            <TabsTrigger value="clients" data-testid="tab-clients">Clients</TabsTrigger>
            <TabsTrigger value="websites" data-testid="tab-websites">All Websites</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
            <TabsTrigger value="invites" data-testid="tab-invites">Invites</TabsTrigger>
            <TabsTrigger value="badge" data-testid="tab-badge">Partner Badge</TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="space-y-4">
            {clientsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 animate-spin rounded-full border-b-2 border-primary"></div>
              </div>
            ) : clients.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Users size={48} className="text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-1">No clients yet</h3>
                  <p className="text-muted-foreground mb-4">Add your first client to start managing their consent banners.</p>
                  <Button onClick={() => setIsAddClientDialogOpen(true)}>
                    <UserPlus size={16} className="mr-2" />
                    Add Your First Client
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {clients.map((client) => (
                  <Card key={client.id} data-testid={`card-client-${client.id}`}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-medium">
                              {client.clientName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium">{client.clientName}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Envelope size={12} />
                              {client.user.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getRelationshipBadge(client.relationshipType)}
                          <Badge variant="outline">
                            <Globe size={12} className="mr-1" />
                            {client.websiteCount || 0} websites
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" data-testid={`button-client-menu-${client.id}`}>
                                <DotsThree size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => toast.info("Client editing coming soon")}>
                                <PencilSimple size={16} className="mr-2" />
                                Edit Client
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => setRemovingClient({ id: client.id, name: client.clientName })}
                              >
                                <Trash size={16} className="mr-2" />
                                Remove Client
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      {client.notes && (
                        <p className="text-sm text-muted-foreground mt-2 ml-14">{client.notes}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="websites" className="space-y-4">
            {websites.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Globe size={48} className="text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-1">No websites yet</h3>
                  <p className="text-muted-foreground">Your clients haven't added any websites yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {selectedWebsites.length > 0 && (
                  <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <span className="text-sm font-medium">{selectedWebsites.length} websites selected</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedWebsites([])}>
                        Clear
                      </Button>
                      <Dialog open={isBulkActionDialogOpen} onOpenChange={setIsBulkActionDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" data-testid="button-bulk-actions">
                            <Stack size={16} className="mr-2" />
                            Bulk Update
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Bulk Update Banner Settings</DialogTitle>
                            <DialogDescription>
                              Update settings for {selectedWebsites.length} selected websites.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid gap-2">
                              <Label>Banner Position</Label>
                              <Select
                                value={bulkUpdates.position}
                                onValueChange={(value) => setBulkUpdates({ ...bulkUpdates, position: value })}
                              >
                                <SelectTrigger data-testid="select-bulk-position">
                                  <SelectValue placeholder="Leave unchanged" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="">Leave unchanged</SelectItem>
                                  <SelectItem value="bottom">Bottom</SelectItem>
                                  <SelectItem value="top">Top</SelectItem>
                                  <SelectItem value="center">Center Modal</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <Label>Theme</Label>
                              <Select
                                value={bulkUpdates.theme}
                                onValueChange={(value) => setBulkUpdates({ ...bulkUpdates, theme: value })}
                              >
                                <SelectTrigger data-testid="select-bulk-theme">
                                  <SelectValue placeholder="Leave unchanged" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="">Leave unchanged</SelectItem>
                                  <SelectItem value="light">Light</SelectItem>
                                  <SelectItem value="dark">Dark</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsBulkActionDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleBulkUpdate} 
                              disabled={bulkUpdateMutation.isPending}
                              data-testid="button-apply-bulk"
                            >
                              {bulkUpdateMutation.isPending ? "Updating..." : "Apply Changes"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium w-10">
                          <Checkbox 
                            checked={selectedWebsites.length === websites.length && websites.length > 0}
                            onCheckedChange={selectAllWebsites}
                            data-testid="checkbox-select-all"
                          />
                        </th>
                        <th className="text-left py-3 px-4 font-medium">Domain</th>
                        <th className="text-left py-3 px-4 font-medium">Client</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {websites.map((website) => (
                        <tr key={website.id} className="border-b hover:bg-muted/50" data-testid={`row-website-${website.id}`}>
                          <td className="py-3 px-4">
                            <Checkbox 
                              checked={selectedWebsites.includes(website.id)}
                              onCheckedChange={() => toggleWebsiteSelection(website.id)}
                              data-testid={`checkbox-website-${website.id}`}
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Globe size={16} className="text-muted-foreground" />
                              <span className="font-medium">{website.domain}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{website.clientName}</p>
                              <p className="text-sm text-muted-foreground">{website.clientEmail}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="default">Active</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/dashboard/banner?websiteId=${website.id}`)}
                              data-testid={`button-manage-banner-${website.id}`}
                            >
                              <SlidersHorizontal size={14} className="mr-1.5" />
                              Manage Banner
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            {analytics ? (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
                      <Eye size={16} className="text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.totalImpressions.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">Banner views across all clients</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Accepted</CardTitle>
                      <Check size={16} className="text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{analytics.totalAccepts.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">Consents given</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                      <X size={16} className="text-red-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">{analytics.totalRejects.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">Consents declined</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
                      <TrendUp size={16} className="text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary">{analytics.acceptanceRate}%</div>
                      <p className="text-xs text-muted-foreground">Overall conversion</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Analytics by Client</CardTitle>
                    <CardDescription>Performance breakdown for each client</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analytics.byClient.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No analytics data yet</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4 font-medium">Client</th>
                              <th className="text-right py-3 px-4 font-medium">Websites</th>
                              <th className="text-right py-3 px-4 font-medium">Impressions</th>
                              <th className="text-right py-3 px-4 font-medium">Accepts</th>
                              <th className="text-right py-3 px-4 font-medium">Rejects</th>
                              <th className="text-right py-3 px-4 font-medium">Rate</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analytics.byClient.map((client) => (
                              <tr key={client.clientId} className="border-b">
                                <td className="py-3 px-4 font-medium">{client.clientName}</td>
                                <td className="py-3 px-4 text-right">{client.websiteCount}</td>
                                <td className="py-3 px-4 text-right">{client.impressions.toLocaleString()}</td>
                                <td className="py-3 px-4 text-right text-green-600">{client.accepts.toLocaleString()}</td>
                                <td className="py-3 px-4 text-right text-red-600">{client.rejects.toLocaleString()}</td>
                                <td className="py-3 px-4 text-right">
                                  <Badge variant={client.acceptanceRate >= 50 ? "default" : "secondary"}>
                                    {client.acceptanceRate}%
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 animate-spin rounded-full border-b-2 border-primary"></div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="invites" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Invitations</CardTitle>
                <CardDescription>Track invitations you've sent to potential clients</CardDescription>
              </CardHeader>
              <CardContent>
                {invites.length === 0 ? (
                  <div className="text-center py-8">
                    <Envelope size={48} className="text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-1">No invitations sent</h3>
                    <p className="text-muted-foreground mb-4">Send invitations to potential clients to help them get started with ConsentEase.</p>
                    <Button onClick={() => setIsInviteDialogOpen(true)}>
                      <PaperPlaneTilt size={16} className="mr-2" />
                      Send First Invitation
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Email</th>
                          <th className="text-left py-3 px-4 font-medium">Status</th>
                          <th className="text-left py-3 px-4 font-medium">Sent</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invites.map((invite) => (
                          <tr key={invite.id} className="border-b">
                            <td className="py-3 px-4">{invite.email}</td>
                            <td className="py-3 px-4">
                              <Badge variant={invite.status === 'accepted' ? 'default' : invite.status === 'pending' ? 'secondary' : 'outline'}>
                                {invite.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {new Date(invite.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="badge" className="space-y-4">
            <PartnerBadgeSection agencySlug={agency.slug} agencyName={agency.name} />
          </TabsContent>
        </Tabs>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Agency Settings</DialogTitle>
              <DialogDescription>
                Update your agency profile information.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditAgency} className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editName">Agency Name</Label>
                  <Input
                    id="editName"
                    value={agencyForm.name}
                    onChange={(e) => setAgencyForm({ ...agencyForm, name: e.target.value })}
                    required
                    data-testid="input-edit-agency-name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editWebsiteUrl">Website URL</Label>
                  <Input
                    id="editWebsiteUrl"
                    type="url"
                    value={agencyForm.websiteUrl}
                    onChange={(e) => setAgencyForm({ ...agencyForm, websiteUrl: e.target.value })}
                    data-testid="input-edit-agency-website"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editContactEmail">Contact Email</Label>
                  <Input
                    id="editContactEmail"
                    type="email"
                    value={agencyForm.contactEmail}
                    onChange={(e) => setAgencyForm({ ...agencyForm, contactEmail: e.target.value })}
                    data-testid="input-edit-agency-email"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editDescription">Description</Label>
                  <Textarea
                    id="editDescription"
                    value={agencyForm.description}
                    onChange={(e) => setAgencyForm({ ...agencyForm, description: e.target.value })}
                    rows={3}
                    data-testid="input-edit-agency-description"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editHeroText">Hero Text (for featured display)</Label>
                  <Input
                    id="editHeroText"
                    placeholder="Your trusted GDPR compliance partner"
                    value={agencyForm.heroText}
                    onChange={(e) => setAgencyForm({ ...agencyForm, heroText: e.target.value })}
                    data-testid="input-edit-agency-hero"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateAgencyMutation.isPending} data-testid="button-save-agency">
                  {updateAgencyMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <AlertDialog open={!!removingClient} onOpenChange={(open) => { if (!open) setRemovingClient(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{removingClient?.name}</strong> from your agency? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-remove-client">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (removingClient) {
                  removeClientMutation.mutate(removingClient.id);
                  setRemovingClient(null);
                }
              }}
              data-testid="button-confirm-remove-client"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
