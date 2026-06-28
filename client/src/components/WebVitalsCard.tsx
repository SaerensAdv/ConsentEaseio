import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Heartbeat, Lightning, ArrowsOutCardinal, Clock, Timer, Gauge, Question } from '@phosphor-icons/react';

interface WebVitalsCardProps {
  websiteId: string | null;
}

interface VitalsSummary {
  avgLcp: number | null;
  avgCls: number | null;
  avgInp: number | null;
  avgFcp: number | null;
  avgTtfb: number | null;
  avgBannerDelay: number | null;
  totalSamples: number;
  p75Lcp: number | null;
  p75Cls: number | null;
  p75Inp: number | null;
}

const vitalThresholds = {
  lcp: { good: 2500, needsImprovement: 4000 },
  cls: { good: 0.1, needsImprovement: 0.25 },
  inp: { good: 200, needsImprovement: 500 },
  fcp: { good: 1800, needsImprovement: 3000 },
  ttfb: { good: 800, needsImprovement: 1800 },
};

function getScoreColor(value: number | null | undefined, metric: keyof typeof vitalThresholds): string {
  if (value === null || value === undefined) return 'text-muted-foreground';
  const threshold = vitalThresholds[metric];
  if (value <= threshold.good) return 'text-green-500';
  if (value <= threshold.needsImprovement) return 'text-amber-500';
  return 'text-red-500';
}

function getScoreBadge(value: number | null | undefined, metric: keyof typeof vitalThresholds): { label: string; variant: 'default' | 'secondary' | 'destructive' } {
  if (value === null || value === undefined) return { label: 'No data', variant: 'secondary' };
  const threshold = vitalThresholds[metric];
  if (value <= threshold.good) return { label: 'Good', variant: 'default' };
  if (value <= threshold.needsImprovement) return { label: 'Needs improvement', variant: 'secondary' };
  return { label: 'Poor', variant: 'destructive' };
}

function formatValue(value: number | null | undefined, unit: string): string {
  if (value === null || value === undefined) return '—';
  if (unit === 's') return (value / 1000).toFixed(2) + 's';
  if (unit === 'ms') return value + 'ms';
  return value.toFixed(3);
}

export function WebVitalsCard({ websiteId }: WebVitalsCardProps) {
  const { data: vitals, isLoading } = useQuery<VitalsSummary>({
    queryKey: ['/api/websites', websiteId, 'vitals'],
    queryFn: async () => {
      if (!websiteId) return null;
      const res = await fetch(`/api/websites/${websiteId}/vitals`);
      if (!res.ok) throw new Error('Failed to fetch vitals');
      return res.json();
    },
    enabled: !!websiteId,
    refetchInterval: 30000,
  });

  const metrics = [
    {
      name: 'LCP',
      fullName: 'Largest Contentful Paint',
      description: 'Time until the largest content element is visible. Measures loading performance.',
      value: vitals?.p75Lcp,
      icon: Lightning,
      unit: 's',
      threshold: 'lcp' as const,
    },
    {
      name: 'CLS',
      fullName: 'Cumulative Layout Shift',
      description: 'Measures visual stability. Lower is better - your banner should not cause layout shifts.',
      value: vitals?.p75Cls,
      icon: ArrowsOutCardinal,
      unit: '',
      threshold: 'cls' as const,
    },
    {
      name: 'INP',
      fullName: 'Interaction to Next Paint',
      description: 'Time from user interaction to visual response. Measures responsiveness.',
      value: vitals?.p75Inp,
      icon: Heartbeat,
      unit: 'ms',
      threshold: 'inp' as const,
    },
    {
      name: 'FCP',
      fullName: 'First Contentful Paint',
      description: 'Time until first content is painted. Measures initial load speed.',
      value: vitals?.avgFcp,
      icon: Clock,
      unit: 's',
      threshold: 'fcp' as const,
    },
    {
      name: 'TTFB',
      fullName: 'Time to First Byte',
      description: 'Time until the server starts responding. Measures server/network performance.',
      value: vitals?.avgTtfb,
      icon: Timer,
      unit: 'ms',
      threshold: 'ttfb' as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Gauge size={20} className="text-primary" />
              Core Web Vitals
            </CardTitle>
            <CardDescription>
              Track how your consent banner affects page performance
            </CardDescription>
          </div>
          {vitals && vitals.totalSamples > 0 && (
            <Badge variant="outline" className="text-xs">
              {vitals.totalSamples} samples (7d)
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : !vitals || vitals.totalSamples === 0 ? (
          <div className="text-center py-8">
            <Gauge size={40} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No performance data yet
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Metrics will appear as visitors interact with your banner.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {metrics.map((metric) => {
                const score = getScoreBadge(metric.value, metric.threshold);
                const Icon = metric.icon;
                
                return (
                  <TooltipProvider key={metric.name}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-help"
                          data-testid={`vital-${metric.name.toLowerCase()}`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <Icon size={14} className="text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">{metric.name}</span>
                            <Question size={12} className="text-muted-foreground/50" />
                          </div>
                          <div className={`text-xl font-bold ${getScoreColor(metric.value, metric.threshold)}`}>
                            {formatValue(metric.value, metric.unit)}
                          </div>
                          <Badge 
                            variant={score.variant}
                            className="text-[10px] h-4 mt-1"
                          >
                            {score.label}
                          </Badge>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs">
                        <p className="font-medium">{metric.fullName}</p>
                        <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
            
            {vitals.avgBannerDelay !== null && (
              <div className="mt-4 p-3 rounded-lg border bg-primary/5 border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Banner Interaction Time</p>
                    <p className="text-xs text-muted-foreground">
                      Average time from banner shown to user decision
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {(vitals.avgBannerDelay / 1000).toFixed(1)}s
                    </p>
                    <p className="text-xs text-muted-foreground">average</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
