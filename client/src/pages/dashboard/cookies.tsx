import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import DashboardLayout from "./layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Cookie, Shield, BarChart3, Megaphone, Wrench, Loader2, Globe, Lock, Info, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Website {
  id: string;
  domain: string;
  publicId: string;
  status: string;
  lastScan: string | null;
  cookiesFound: number | null;
}

interface CookieCategory {
  id: string;
  websiteId: string;
  name: string;
  displayName: string;
  description: string;
  isRequired: boolean;
  isEnabled: boolean;
  sortOrder: number;
}

interface CookieItem {
  id: string;
  websiteId: string;
  categoryId: string;
  name: string;
  provider: string | null;
  purpose: string;
  expiry: string | null;
  type: string;
  isAutoDetected: boolean;
}

const categoryIcons: Record<string, React.ReactNode> = {
  necessary: <Shield className="w-4 h-4" />,
  functional: <Wrench className="w-4 h-4" />,
  analytics: <BarChart3 className="w-4 h-4" />,
  marketing: <Megaphone className="w-4 h-4" />,
};

export default function CookiesPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(null);
  const [isAddCookieOpen, setIsAddCookieOpen] = useState(false);
  const [isEditCookieOpen, setIsEditCookieOpen] = useState(false);
  const [editingCookie, setEditingCookie] = useState<CookieItem | null>(null);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CookieCategory | null>(null);

  const [newCookie, setNewCookie] = useState({
    name: "",
    provider: "",
    purpose: "",
    expiry: "",
    type: "first-party",
    categoryId: "",
  });

  const { data: websites = [], isLoading: websitesLoading } = useQuery<Website[]>({
    queryKey: ["/api/websites"],
    queryFn: async () => {
      const res = await fetch("/api/websites", { credentials: "include" });
      if (res.status === 401) {
        setLocation("/login");
        throw new Error("Unauthorized");
      }
      if (!res.ok) throw new Error("Failed to fetch websites");
      return res.json();
    },
    refetchInterval: (query) => {
      const data = query.state.data as Website[] | undefined;
      if (data?.some(w => w.status === 'scanning')) {
        return 3000;
      }
      return false;
    },
  });

  const activeWebsiteId = selectedWebsiteId || websites[0]?.id;
  const activeWebsite = websites.find(w => w.id === activeWebsiteId);
  const isScanning = activeWebsite?.status === 'scanning';

  const rescanMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/websites/${id}/scan`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to start scan");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
      toast.success("Scanning for cookies...");
    },
    onError: () => {
      toast.error("Failed to start scan");
    },
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<CookieCategory[]>({
    queryKey: ["/api/websites", activeWebsiteId, "cookie-categories"],
    queryFn: async () => {
      if (!activeWebsiteId) return [];
      const res = await fetch(`/api/websites/${activeWebsiteId}/cookie-categories`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
    enabled: !!activeWebsiteId,
  });

  const { data: cookies = [], isLoading: cookiesLoading } = useQuery<CookieItem[]>({
    queryKey: ["/api/websites", activeWebsiteId, "cookies"],
    queryFn: async () => {
      if (!activeWebsiteId) return [];
      const res = await fetch(`/api/websites/${activeWebsiteId}/cookies`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch cookies");
      return res.json();
    },
    enabled: !!activeWebsiteId,
    refetchInterval: isScanning ? 3000 : false,
  });

  const createCookieMutation = useMutation({
    mutationFn: async (data: typeof newCookie) => {
      const res = await fetch(`/api/websites/${activeWebsiteId}/cookies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create cookie");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites", activeWebsiteId, "cookies"] });
      setIsAddCookieOpen(false);
      setNewCookie({ name: "", provider: "", purpose: "", expiry: "", type: "first-party", categoryId: "" });
      toast.success("Cookie added successfully");
    },
    onError: () => {
      toast.error("Failed to add cookie");
    },
  });

  const updateCookieMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<CookieItem> & { id: string }) => {
      const res = await fetch(`/api/cookies/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update cookie");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites", activeWebsiteId, "cookies"] });
      setIsEditCookieOpen(false);
      setEditingCookie(null);
      toast.success("Cookie updated successfully");
    },
    onError: () => {
      toast.error("Failed to update cookie");
    },
  });

  const deleteCookieMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/cookies/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete cookie");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites", activeWebsiteId, "cookies"] });
      toast.success("Cookie deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete cookie");
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<CookieCategory> & { id: string }) => {
      const res = await fetch(`/api/cookie-categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update category");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites", activeWebsiteId, "cookie-categories"] });
      setIsEditCategoryOpen(false);
      setEditingCategory(null);
      toast.success("Category updated successfully");
    },
    onError: () => {
      toast.error("Failed to update category");
    },
  });

  const handleAddCookie = () => {
    if (!newCookie.name || !newCookie.purpose || !newCookie.categoryId) {
      toast.error("Please fill in all required fields");
      return;
    }
    createCookieMutation.mutate(newCookie);
  };

  const handleUpdateCookie = () => {
    if (!editingCookie) return;
    updateCookieMutation.mutate(editingCookie);
  };

  const handleUpdateCategory = () => {
    if (!editingCategory) return;
    updateCategoryMutation.mutate(editingCategory);
  };

  const getCookiesForCategory = (categoryId: string) => {
    return cookies.filter((c) => c.categoryId === categoryId);
  };

  if (websitesLoading || categoriesLoading || cookiesLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (websites.length === 0) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No websites yet</h2>
          <p className="text-muted-foreground mb-4">Add a website first to manage its cookies.</p>
          <Button onClick={() => setLocation("/dashboard")} data-testid="button-go-to-websites">
            Go to Websites
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6" data-tour="cookie-categories">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold" data-testid="text-page-title">Cookie Management</h1>
            <p className="text-muted-foreground">
              Manage cookie categories and individual cookies for your consent banner.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={activeWebsiteId || ""} onValueChange={setSelectedWebsiteId}>
              <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-website">
                <SelectValue placeholder="Select website" />
              </SelectTrigger>
              <SelectContent>
                {websites.map((site) => (
                  <SelectItem key={site.id} value={site.id} data-testid={`option-website-${site.id}`}>
                    {site.domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => activeWebsiteId && rescanMutation.mutate(activeWebsiteId)}
              disabled={isScanning || !activeWebsiteId}
              data-testid="button-rescan-cookies"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Scanning...' : 'Scan Cookies'}
            </Button>

            <Dialog open={isAddCookieOpen} onOpenChange={setIsAddCookieOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-cookie">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Cookie
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Cookie</DialogTitle>
                  <DialogDescription>
                    Add a cookie that your website uses. This will be shown to visitors in the consent preferences.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select
                      value={newCookie.categoryId}
                      onValueChange={(v) => setNewCookie({ ...newCookie, categoryId: v })}
                    >
                      <SelectTrigger data-testid="select-cookie-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Cookie Name *</Label>
                    <Input
                      placeholder="e.g., _ga"
                      value={newCookie.name}
                      onChange={(e) => setNewCookie({ ...newCookie, name: e.target.value })}
                      data-testid="input-cookie-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <Input
                      placeholder="e.g., Google Analytics"
                      value={newCookie.provider}
                      onChange={(e) => setNewCookie({ ...newCookie, provider: e.target.value })}
                      data-testid="input-cookie-provider"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Purpose *</Label>
                    <Textarea
                      placeholder="Describe what this cookie is used for..."
                      value={newCookie.purpose}
                      onChange={(e) => setNewCookie({ ...newCookie, purpose: e.target.value })}
                      data-testid="input-cookie-purpose"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Expiry</Label>
                      <Input
                        placeholder="e.g., 2 years"
                        value={newCookie.expiry}
                        onChange={(e) => setNewCookie({ ...newCookie, expiry: e.target.value })}
                        data-testid="input-cookie-expiry"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={newCookie.type}
                        onValueChange={(v) => setNewCookie({ ...newCookie, type: v })}
                      >
                        <SelectTrigger data-testid="select-cookie-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="first-party">First-party</SelectItem>
                          <SelectItem value="third-party">Third-party</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddCookieOpen(false)}
                    data-testid="button-cancel-cookie"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddCookie}
                    disabled={createCookieMutation.isPending}
                    data-testid="button-save-cookie"
                  >
                    {createCookieMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Add Cookie
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cookie className="w-5 h-5" />
              Cookie Categories
            </CardTitle>
            <CardDescription>
              Configure which cookie categories are shown to visitors and customize their descriptions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="space-y-2">
              {categories.map((category) => {
                const categoryCookies = getCookiesForCategory(category.id);
                return (
                  <AccordionItem
                    key={category.id}
                    value={category.id}
                    className="border rounded-lg px-4"
                  >
                    <div className="flex items-center py-4">
                      <AccordionTrigger className="hover:no-underline flex-1 [&>svg]:ml-2">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            {categoryIcons[category.name] || <Cookie className="w-4 h-4" />}
                          </div>
                          <div className="text-left flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{category.displayName}</span>
                              {category.isRequired && (
                                <Badge variant="secondary" className="text-xs">
                                  <Lock className="w-3 h-3 mr-1" />
                                  Required
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {categoryCookies.length} cookie{categoryCookies.length !== 1 ? "s" : ""}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {category.description}
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <div className="flex items-center gap-2 ml-4">
                        <Switch
                          checked={category.isEnabled}
                          disabled={category.isRequired}
                          onCheckedChange={(checked) => {
                            updateCategoryMutation.mutate({ id: category.id, isEnabled: checked });
                          }}
                          data-testid={`switch-category-${category.id}`}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingCategory(category);
                            setIsEditCategoryOpen(true);
                          }}
                          data-testid={`button-edit-category-${category.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <AccordionContent>
                      <div className="pt-2 pb-4 space-y-3">
                        {categoryCookies.length === 0 ? (
                          <div className="text-center py-6 text-muted-foreground">
                            <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No cookies in this category yet.</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => {
                                setNewCookie({ ...newCookie, categoryId: category.id });
                                setIsAddCookieOpen(true);
                              }}
                              data-testid={`button-add-cookie-to-${category.id}`}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add Cookie
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {categoryCookies.map((cookie) => (
                              <div
                                key={cookie.id}
                                className="flex items-start justify-between p-3 bg-secondary/50 rounded-lg"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <code className="text-sm font-mono bg-background px-2 py-0.5 rounded">
                                      {cookie.name}
                                    </code>
                                    {cookie.provider && (
                                      <span className="text-xs text-muted-foreground">
                                        by {cookie.provider}
                                      </span>
                                    )}
                                    <Badge variant="outline" className="text-xs">
                                      {cookie.type}
                                    </Badge>
                                    {cookie.expiry && (
                                      <span className="text-xs text-muted-foreground">
                                        {cookie.expiry}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">{cookie.purpose}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setEditingCookie(cookie);
                                      setIsEditCookieOpen(true);
                                    }}
                                    data-testid={`button-edit-cookie-${cookie.id}`}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      if (confirm("Are you sure you want to delete this cookie?")) {
                                        deleteCookieMutation.mutate(cookie.id);
                                      }
                                    }}
                                    data-testid={`button-delete-cookie-${cookie.id}`}
                                  >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Customize how this category appears to your website visitors.
            </DialogDescription>
          </DialogHeader>
          {editingCategory && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input
                  value={editingCategory.displayName}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, displayName: e.target.value })
                  }
                  data-testid="input-category-display-name"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingCategory.description}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, description: e.target.value })
                  }
                  data-testid="input-category-description"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditCategoryOpen(false)}
              data-testid="button-cancel-category"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateCategory}
              disabled={updateCategoryMutation.isPending}
              data-testid="button-save-category"
            >
              {updateCategoryMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditCookieOpen} onOpenChange={setIsEditCookieOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Cookie</DialogTitle>
            <DialogDescription>
              Update the cookie information.
            </DialogDescription>
          </DialogHeader>
          {editingCookie && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={editingCookie.categoryId}
                  onValueChange={(v) => setEditingCookie({ ...editingCookie, categoryId: v })}
                >
                  <SelectTrigger data-testid="select-edit-cookie-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cookie Name</Label>
                <Input
                  value={editingCookie.name}
                  onChange={(e) => setEditingCookie({ ...editingCookie, name: e.target.value })}
                  data-testid="input-edit-cookie-name"
                />
              </div>

              <div className="space-y-2">
                <Label>Provider</Label>
                <Input
                  value={editingCookie.provider || ""}
                  onChange={(e) => setEditingCookie({ ...editingCookie, provider: e.target.value })}
                  data-testid="input-edit-cookie-provider"
                />
              </div>

              <div className="space-y-2">
                <Label>Purpose</Label>
                <Textarea
                  value={editingCookie.purpose}
                  onChange={(e) => setEditingCookie({ ...editingCookie, purpose: e.target.value })}
                  data-testid="input-edit-cookie-purpose"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Expiry</Label>
                  <Input
                    value={editingCookie.expiry || ""}
                    onChange={(e) => setEditingCookie({ ...editingCookie, expiry: e.target.value })}
                    data-testid="input-edit-cookie-expiry"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={editingCookie.type}
                    onValueChange={(v) => setEditingCookie({ ...editingCookie, type: v })}
                  >
                    <SelectTrigger data-testid="select-edit-cookie-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="first-party">First-party</SelectItem>
                      <SelectItem value="third-party">Third-party</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditCookieOpen(false)}
              data-testid="button-cancel-edit-cookie"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateCookie}
              disabled={updateCookieMutation.isPending}
              data-testid="button-save-edit-cookie"
            >
              {updateCookieMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
