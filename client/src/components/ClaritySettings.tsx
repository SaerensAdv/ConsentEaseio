import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Eye, MousePointer2, Zap, CheckCircle2, Loader2, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ClaritySettingsProps {
  websiteId: string;
  domain: string;
  clarityProjectId: string | null;
}

export function ClaritySettings({ websiteId, domain, clarityProjectId }: ClaritySettingsProps) {
  const [projectId, setProjectId] = useState(clarityProjectId || '');
  const queryClient = useQueryClient();

  const updateClarity = useMutation({
    mutationFn: async (newProjectId: string) => {
      const res = await fetch(`/api/websites/${websiteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ clarityProjectId: newProjectId || null }),
      });
      if (!res.ok) throw new Error('Failed to update Clarity settings');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/websites'] });
    },
  });

  const isConfigured = !!clarityProjectId;
  const hasChanges = projectId !== (clarityProjectId || '');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#2F80ED"/>
                <path d="M2 17L12 22L22 17" stroke="#2F80ED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="#2F80ED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Microsoft Clarity
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>Microsoft Clarity provides free heatmaps and session recordings. Connect it to see exactly how visitors interact with your consent banner.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <CardDescription>
              Free analytics tool for session replays and heatmaps
            </CardDescription>
          </div>
          {isConfigured ? (
            <Badge className="bg-green-500/10 text-green-600 border-green-200">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge variant="outline">Not configured</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <Eye className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Session Replays</p>
              <p className="text-xs text-muted-foreground">Watch user interactions</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <MousePointer2 className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Heatmaps</p>
              <p className="text-xs text-muted-foreground">See click patterns</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <Zap className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Rage Clicks</p>
              <p className="text-xs text-muted-foreground">Detect frustration</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="clarity-project-id">Clarity Project ID</Label>
          <div className="flex gap-2">
            <Input
              id="clarity-project-id"
              placeholder="e.g., abcdefghij"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              data-testid="input-clarity-project-id"
            />
            <Button
              onClick={() => updateClarity.mutate(projectId)}
              disabled={!hasChanges || updateClarity.isPending}
              data-testid="button-save-clarity"
            >
              {updateClarity.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Save'
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Find your Project ID in{' '}
            <a 
              href="https://clarity.microsoft.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              clarity.microsoft.com
            </a>
            {' '}under Settings → Setup
          </p>
        </div>

        {isConfigured && (
          <div className="p-3 rounded-lg border bg-primary/5 border-primary/20">
            <p className="text-sm font-medium mb-1">Banner tracking enabled!</p>
            <p className="text-xs text-muted-foreground">
              Clarity will record how visitors interact with your consent banner on{' '}
              <span className="font-medium">{domain}</span> after they grant analytics consent. View recordings and heatmaps in your Clarity dashboard.
            </p>
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              GDPR/CCPA compliant: Only loads after user consents
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <p className="text-xs text-muted-foreground">
          100% free, unlimited data retention
        </p>
        <Button variant="ghost" size="sm" asChild>
          <a 
            href={isConfigured ? `https://clarity.microsoft.com/projects/${clarityProjectId}` : "https://clarity.microsoft.com"}
            target="_blank"
            rel="noopener noreferrer"
          >
            {isConfigured ? 'Open Dashboard' : 'Create Account'}
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
