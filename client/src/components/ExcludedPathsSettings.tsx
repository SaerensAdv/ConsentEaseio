import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { EyeSlash, Question, Shield } from "@phosphor-icons/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { Spinner } from "@/components/ui/spinner";

interface ExcludedPathsSettingsProps {
  websiteId: string;
  domain: string;
  excludedPaths: string[] | null;
}

export function ExcludedPathsSettings({ websiteId, domain, excludedPaths }: ExcludedPathsSettingsProps) {
  const [pathsText, setPathsText] = useState((excludedPaths || []).join('\n'));
  const queryClient = useQueryClient();

  const updatePaths = useMutation({
    mutationFn: async (newPaths: string[]) => {
      const res = await fetch(`/api/websites/${websiteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ excludedPaths: newPaths.length > 0 ? newPaths : null }),
      });
      if (!res.ok) throw new Error('Failed to update excluded paths');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/websites'] });
      toast.success('Excluded paths saved');
    },
    onError: () => {
      toast.error('Failed to save excluded paths');
    },
  });

  const currentPaths = pathsText.split('\n').map(p => p.trim()).filter(p => p.length > 0);
  const originalPaths = excludedPaths || [];
  const hasChanges = JSON.stringify(currentPaths) !== JSON.stringify(originalPaths);
  const pathCount = currentPaths.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <EyeSlash size={20} className="text-primary" />
              Excluded Pages
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Question size={16} className="text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>The consent banner, revisit button, and analytics tracking will all be hidden on these paths and subdomains. Useful for admin pages, staging environments, or internal pages.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <CardDescription>
              Hide the consent banner on specific paths and subdomains
            </CardDescription>
          </div>
          {pathCount > 0 ? (
            <Badge className="bg-primary/10 text-primary border-primary/20">
              <Shield size={12} className="mr-1" />
              {pathCount} {pathCount === 1 ? 'exclusion' : 'exclusions'} active
            </Badge>
          ) : (
            <Badge variant="outline">No exclusions</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="excluded-paths">Excluded Paths & Subdomains</Label>
          <Textarea
            id="excluded-paths"
            placeholder={`/admin\n/wp-admin\n/backend\nstaging.\ndev.`}
            value={pathsText}
            onChange={(e) => setPathsText(e.target.value)}
            rows={5}
            className="font-mono text-sm"
            data-testid="textarea-excluded-paths"
          />
          <p className="text-xs text-muted-foreground">
            Enter one path or subdomain per line. Examples:
          </p>
          <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1 ml-2">
            <li><code className="bg-muted px-1 rounded">/admin</code> - Excludes pages starting with /admin</li>
            <li><code className="bg-muted px-1 rounded">/wp-admin</code> - Excludes WordPress admin pages</li>
            <li><code className="bg-muted px-1 rounded">staging.</code> - Excludes staging.{domain}</li>
            <li><code className="bg-muted px-1 rounded">dev.</code> - Excludes dev.{domain}</li>
          </ul>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={() => updatePaths.mutate(currentPaths)}
            disabled={!hasChanges || updatePaths.isPending}
            data-testid="button-save-excluded-paths"
          >
            {updatePaths.isPending ? (
              <Spinner size={16} className="mr-2" />
            ) : null}
            Save Exclusions
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex border-t pt-4">
        <p className="text-xs text-muted-foreground">
          The consent banner, revisit button, and analytics will be completely hidden on excluded pages. Existing consent preferences are still applied for script blocking.
        </p>
      </CardFooter>
    </Card>
  );
}
