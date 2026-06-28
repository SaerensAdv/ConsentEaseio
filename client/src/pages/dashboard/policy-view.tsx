import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import DashboardLayout from "./layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, Copy, Check, DownloadSimple, ArrowSquareOut, Eye, Code, FileText, Globe, Pencil, CheckCircle } from "@phosphor-icons/react";
import { toast } from "sonner";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Spinner } from "@/components/ui/spinner";

interface Policy {
  id: string;
  websiteId: string;
  userId: string;
  type: "privacy" | "cookie";
  status: "draft" | "published";
  language: string;
  jurisdiction: string;
  businessName: string;
  businessAddress: string | null;
  businessCountry: string | null;
  businessEmail: string;
  businessPhone: string | null;
  businessWebsite: string | null;
  vatNumber: string | null;
  dpoName: string | null;
  dpoEmail: string | null;
  dataCollected: string | null;
  dataUsagePurposes: string | null;
  thirdPartyServices: string | null;
  dataRetentionPeriod: string | null;
  allowsDataExport: boolean | null;
  allowsDataDeletion: boolean | null;
  hasMinors: boolean | null;
  sellsData: boolean | null;
  content: string | null;
  contentMarkdown: string | null;
  templateVersion: string;
  version: number;
  generatedAt: string | null;
  publishedAt: string | null;
  lastEditedAt: string | null;
  createdAt: string;
}

interface Website {
  id: string;
  domain: string;
  publicId: string;
}

export default function PolicyView() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/dashboard/policy/:id");
  const policyId = params?.id;
  const [activeTab, setActiveTab] = useState("preview");
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const { data: policy, isLoading: policyLoading, error: policyError } = useQuery<Policy>({
    queryKey: ["/api/policy", policyId],
    queryFn: async () => {
      const res = await fetch(`/api/policy/${policyId}`, { credentials: "include" });
      if (res.status === 401) {
        setLocation("/login");
        throw new Error("Unauthorized");
      }
      if (!res.ok) throw new Error("Failed to fetch policy");
      return res.json();
    },
    enabled: !!policyId,
  });

  const { data: websites = [] } = useQuery<Website[]>({
    queryKey: ["/api/websites"],
    enabled: !!policy,
  });

  const website = websites.find(w => w.id === policy?.websiteId);
  const productionDomain = "https://consentease.io";
  const hostedUrl = website && policy 
    ? `${productionDomain}/api/policies/hosted/${website.publicId}/${policy.type}`
    : "";

  const publishMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/policies/${policyId}/publish`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/policy", policyId] });
      toast.success("Policy published successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to publish policy");
    },
  });

  const handleCopyHtml = () => {
    if (policy?.content) {
      navigator.clipboard.writeText(policy.content);
      setCopiedHtml(true);
      toast.success("HTML copied to clipboard!");
      setTimeout(() => setCopiedHtml(false), 2000);
    }
  };

  const handleCopyMarkdown = () => {
    if (policy?.contentMarkdown) {
      navigator.clipboard.writeText(policy.contentMarkdown);
      setCopiedMarkdown(true);
      toast.success("Markdown copied to clipboard!");
      setTimeout(() => setCopiedMarkdown(false), 2000);
    }
  };

  const handleDownloadHtml = () => {
    if (policy?.content) {
      const fullHtml = `<!DOCTYPE html>
<html lang="${policy.language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${policy.type === "privacy" ? "Privacy Policy" : "Cookie Policy"} - ${policy.businessName}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; color: #333; }
    h1 { font-size: 2rem; margin-bottom: 1.5rem; }
    h2 { font-size: 1.5rem; margin-top: 2rem; margin-bottom: 1rem; }
    p { margin-bottom: 1rem; }
    ul { margin-bottom: 1rem; padding-left: 1.5rem; }
    li { margin-bottom: 0.5rem; }
  </style>
</head>
<body>
${policy.content}
</body>
</html>`;
      const blob = new Blob([fullHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${policy.type}-policy.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("HTML file downloaded!");
    }
  };

  const handleViewHostedUrl = () => {
    if (hostedUrl && policy?.status === "published") {
      window.open(hostedUrl, "_blank");
    } else {
      toast.error("Please publish the policy first to view the hosted URL");
    }
  };

  const embedIframeCode = `<iframe src="${hostedUrl}" width="100%" height="600" style="border:none;"></iframe>`;
  const embedLinkCode = `<a href="${hostedUrl}">${policy?.type === "privacy" ? "Privacy Policy" : "Cookie Policy"}</a>`;

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedIframeCode);
    setCopiedEmbed(true);
    toast.success("Embed code copied!");
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(embedLinkCode);
    setCopiedLink(true);
    toast.success("Link code copied!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (policyLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Spinner size={32} className="text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (policyError || !policy) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <FileText size={48} className="text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Policy Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The policy you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => setLocation("/dashboard/policy")} data-testid="button-back-to-policies">
            <ArrowLeft size={16} className="mr-2" />
            Back to Policy Generator
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const policyTitle = policy.type === "privacy" ? "Privacy Policy" : "Cookie Policy";
  const formattedPublishDate = policy.publishedAt 
    ? new Date(policy.publishedAt).toLocaleDateString("en-US", { 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      })
    : null;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation("/dashboard/policy")}
            data-testid="button-back"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div>
              <h1 className="text-2xl font-display font-bold" data-testid="text-policy-title">
                {policyTitle}
              </h1>
              {website && (
                <p className="text-sm text-muted-foreground flex items-center gap-1" data-testid="text-website-domain">
                  <Globe size={12} />
                  {website.domain}
                </p>
              )}
            </div>
            <Badge 
              variant={policy.status === "published" ? "default" : "secondary"}
              className={policy.status === "published" ? "bg-green-500 hover:bg-green-600" : ""}
              data-testid="badge-status"
            >
              {policy.status === "published" ? "Published" : "Draft"}
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="preview" className="gap-2" data-testid="tab-preview">
              <Eye size={16} />
              Preview
            </TabsTrigger>
            <TabsTrigger value="html" className="gap-2" data-testid="tab-html">
              <Code size={16} />
              HTML
            </TabsTrigger>
            <TabsTrigger value="markdown" className="gap-2" data-testid="tab-markdown">
              <FileText size={16} />
              Markdown
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div 
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: policy.content || "" }}
                  data-testid="policy-preview-content"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="html" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
                <div>
                  <CardTitle className="text-lg">HTML Code</CardTitle>
                  <CardDescription>Copy the HTML to embed in your website</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCopyHtml}
                  data-testid="button-copy-html"
                >
                  {copiedHtml ? (
                    <>
                      <Check size={16} className="mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={16} className="mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap" data-testid="code-html">
                    {policy.content || ""}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="markdown" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
                <div>
                  <CardTitle className="text-lg">Markdown Code</CardTitle>
                  <CardDescription>Copy the Markdown for documentation or CMS</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCopyMarkdown}
                  data-testid="button-copy-markdown"
                >
                  {copiedMarkdown ? (
                    <>
                      <Check size={16} className="mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={16} className="mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap" data-testid="code-markdown">
                    {policy.contentMarkdown || ""}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DownloadSimple size={20} className="text-primary" />
                Export Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={handleCopyHtml}
                data-testid="button-export-copy-html"
              >
                <Copy size={16} className="mr-2" />
                Copy HTML
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={handleCopyMarkdown}
                data-testid="button-export-copy-markdown"
              >
                <Copy size={16} className="mr-2" />
                Copy Markdown
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={handleDownloadHtml}
                data-testid="button-download-html"
              >
                <DownloadSimple size={16} className="mr-2" />
                Download HTML File
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={handleViewHostedUrl}
                    disabled={policy.status !== "published"}
                    data-testid="button-view-hosted"
                  >
                    <ArrowSquareOut size={16} className="mr-2" />
                    View Hosted URL
                  </Button>
                </TooltipTrigger>
                {policy.status !== "published" && (
                  <TooltipContent>
                    Publish the policy first to view the hosted URL
                  </TooltipContent>
                )}
              </Tooltip>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {policy.status === "published" ? (
                  <CheckCircle size={20} className="text-green-500" />
                ) : (
                  <Globe size={20} className="text-primary" />
                )}
                Publish Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {policy.status === "published" ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle size={16} />
                    <span className="font-medium" data-testid="text-published-date">
                      Published on {formattedPublishDate}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your policy is now publicly available at the hosted URL and can be embedded on your website.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Publishing makes your policy publicly available at a hosted URL. You can embed this URL on your website or link to it directly.
                  </p>
                  <Button 
                    className="w-full" 
                    onClick={() => publishMutation.mutate()}
                    disabled={publishMutation.isPending}
                    data-testid="button-publish"
                  >
                    {publishMutation.isPending ? (
                      <>
                        <Spinner size={16} className="mr-2" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Globe size={16} className="mr-2" />
                        Publish Policy
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Pencil size={20} className="text-primary" />
              Edit Policy
            </CardTitle>
            <CardDescription>
              Make changes to your policy's business information or data practices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              onClick={() => setLocation("/dashboard/policy")}
              data-testid="button-edit-policy"
            >
              <Pencil size={16} className="mr-2" />
              Edit Policy Details
            </Button>
          </CardContent>
        </Card>

        {policy.status === "published" && website && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Code size={20} className="text-primary" />
                Embed Code
              </CardTitle>
              <CardDescription>
                Add your policy to your website using one of these methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between gap-4 mb-2">
                  <h4 className="font-medium text-sm">iFrame Embed</h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleCopyEmbed}
                    data-testid="button-copy-embed-iframe"
                  >
                    {copiedEmbed ? (
                      <>
                        <Check size={16} className="mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={16} className="mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <div className="bg-slate-900 rounded-lg p-3 overflow-x-auto">
                  <code className="text-green-400 text-sm font-mono" data-testid="code-embed-iframe">
                    {embedIframeCode}
                  </code>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-4 mb-2">
                  <h4 className="font-medium text-sm">Link Tag</h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleCopyLink}
                    data-testid="button-copy-embed-link"
                  >
                    {copiedLink ? (
                      <>
                        <Check size={16} className="mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={16} className="mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <div className="bg-slate-900 rounded-lg p-3 overflow-x-auto">
                  <code className="text-green-400 text-sm font-mono" data-testid="code-embed-link">
                    {embedLinkCode}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Version {policy.version} | Template v{policy.templateVersion}
            {policy.lastEditedAt && (
              <> | Last edited: {new Date(policy.lastEditedAt).toLocaleDateString()}</>
            )}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
