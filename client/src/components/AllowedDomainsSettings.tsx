import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, Question, Globe, Lock } from "@phosphor-icons/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { Spinner } from "@/components/ui/spinner";

interface AllowedDomainsSettingsProps {
  websiteId: string;
  domain: string;
  allowedDomains: string[] | null;
  userPlan: string;
}

const MULTI_SITE_PLANS = ['pro', 'business', 'agency', 'agency_pro'];

export function AllowedDomainsSettings({ websiteId, domain, allowedDomains, userPlan }: AllowedDomainsSettingsProps) {
  const [domainsText, setDomainsText] = useState((allowedDomains || []).join('\n'));
  const queryClient = useQueryClient();
  const canAddDomains = MULTI_SITE_PLANS.includes(userPlan);

  const updateDomains = useMutation({
    mutationFn: async (newDomains: string[]) => {
      const res = await fetch(`/api/websites/${websiteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ allowedDomains: newDomains.length > 0 ? newDomains : null }),
      });
      if (!res.ok) throw new Error('Failed to update allowed domains');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/websites'] });
      toast.success('Allowed domains saved');
    },
    onError: () => {
      toast.error('Failed to save allowed domains');
    },
  });

  const currentDomains = domainsText.split('\n').map(d => d.trim().toLowerCase()).filter(d => d.length > 0);
  const originalDomains = allowedDomains || [];
  const hasChanges = JSON.stringify(currentDomains) !== JSON.stringify(originalDomains);
  const extraCount = currentDomains.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield size={20} className="text-primary" />
              Domain Authorization
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Question size={16} className="text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>Your consent banner will only appear on authorized domains. This prevents unauthorized use of your banner configuration and protects your analytics data from being polluted by other sites.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <CardDescription>
              Control which domains can display your consent banner
            </CardDescription>
          </div>
          <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
            <Shield size={12} className="mr-1" />
            Protected
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Label>Automatically Authorized</Label>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
              <Globe size={16} className="text-muted-foreground flex-shrink-0" />
              <code className="text-sm font-mono flex-1">{domain}</code>
              <Badge variant="secondary" className="text-xs">Primary</Badge>
            </div>
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
              <Globe size={16} className="text-muted-foreground flex-shrink-0" />
              <code className="text-sm font-mono flex-1">*.{domain}</code>
              <Badge variant="outline" className="text-xs">All Subdomains</Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Your primary domain and all its subdomains (e.g., blog.{domain}, shop.{domain}) are automatically authorized.
          </p>
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="allowed-domains">Additional Authorized Domains</Label>
            {extraCount > 0 && canAddDomains && (
              <Badge variant="outline" className="text-xs">
                {extraCount} extra {extraCount === 1 ? 'domain' : 'domains'}
              </Badge>
            )}
          </div>
          
          {canAddDomains ? (
            <>
              <Textarea
                id="allowed-domains"
                placeholder={`staging.otherdomain.com\ndev.internal-site.com\n*.partner-domain.com`}
                value={domainsText}
                onChange={(e) => setDomainsText(e.target.value)}
                rows={4}
                className="font-mono text-sm"
                data-testid="textarea-allowed-domains"
              />
              <p className="text-xs text-muted-foreground">
                Enter one domain per line. Supports wildcards:
              </p>
              <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1 ml-2">
                <li><code className="bg-muted px-1 rounded">staging.example.com</code> - Authorize a specific domain</li>
                <li><code className="bg-muted px-1 rounded">*.example.com</code> - Authorize all subdomains of a domain</li>
              </ul>
              <div className="flex justify-end">
                <Button
                  onClick={() => updateDomains.mutate(currentDomains)}
                  disabled={!hasChanges || updateDomains.isPending}
                  data-testid="button-save-allowed-domains"
                >
                  {updateDomains.isPending ? (
                    <Spinner size={16} className="mr-2" />
                  ) : null}
                  Save Domains
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-muted/30 border rounded-md">
              <Lock size={20} className="text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Available on Business plans</p>
                <p className="text-xs text-muted-foreground">
                  Upgrade to a Pro plan or higher to add extra authorized domains like staging or partner sites.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex border-t pt-4">
        <p className="text-xs text-muted-foreground">
          Requests from unauthorized domains will be blocked. Your banner will show a console warning if loaded on an unauthorized domain. Localhost and development environments are always allowed for testing.
        </p>
      </CardFooter>
    </Card>
  );
}
