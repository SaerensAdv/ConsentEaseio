import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Building2, Users, Globe, Plus, Settings, ExternalLink, Mail, UserPlus, Trash2, Edit, MoreHorizontal } from "lucide-react";
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

export default function AgencyDashboard() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
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
          <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold mb-2">Set Up Your Agency</h1>
          <p className="text-muted-foreground mb-6">
            Create your agency profile to start managing client accounts and their consent banners from one central dashboard.
          </p>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" data-testid="button-create-agency">
                <Plus className="w-4 h-4 mr-2" />
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
          <div className="flex gap-2">
            <Button variant="outline" onClick={openEditDialog} data-testid="button-edit-agency">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-client">
                  <UserPlus className="w-4 h-4 mr-2" />
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
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-client-count">{clients.length}</div>
              <p className="text-xs text-muted-foreground">Active client accounts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Websites</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-website-count">{websites.length}</div>
              <p className="text-xs text-muted-foreground">Across all clients</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agency Status</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
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
                    <ExternalLink className="w-3 h-3" />
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
          </TabsList>

          <TabsContent value="clients" className="space-y-4">
            {clientsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : clients.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-1">No clients yet</h3>
                  <p className="text-muted-foreground mb-4">Add your first client to start managing their consent banners.</p>
                  <Button onClick={() => setIsAddClientDialogOpen(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
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
                              <Mail className="w-3 h-3" />
                              {client.user.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getRelationshipBadge(client.relationshipType)}
                          <Badge variant="outline">
                            <Globe className="w-3 h-3 mr-1" />
                            {client.websiteCount || 0} websites
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" data-testid={`button-client-menu-${client.id}`}>
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => toast.info("Client editing coming soon")}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Client
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => {
                                  if (confirm(`Remove ${client.clientName} from your agency?`)) {
                                    removeClientMutation.mutate(client.id);
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
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
                  <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-1">No websites yet</h3>
                  <p className="text-muted-foreground">Your clients haven't added any websites yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Domain</th>
                      <th className="text-left py-3 px-4 font-medium">Client</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {websites.map((website) => (
                      <tr key={website.id} className="border-b hover:bg-muted/50" data-testid={`row-website-${website.id}`}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-muted-foreground" />
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
    </DashboardLayout>
  );
}
