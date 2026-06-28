import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Broadcast, CheckCircle, XCircle, Eye, Gear, Trash, WifiHigh, WifiSlash } from '@phosphor-icons/react';
import { useAnalyticsWebSocket } from '@/hooks/useAnalyticsWebSocket';

interface LiveEventFeedProps {
  websiteId: string | null;
}

const eventConfig: Record<string, { icon: React.ComponentType<{size?: number; className?: string}>; label: string; color: string }> = {
  banner_shown: { icon: Eye, label: 'Banner Shown', color: 'bg-blue-500' },
  accept: { icon: CheckCircle, label: 'Accepted', color: 'bg-green-500' },
  reject: { icon: XCircle, label: 'Rejected', color: 'bg-red-500' },
  preferences_saved: { icon: Gear, label: 'Preferences Saved', color: 'bg-purple-500' },
  consent_updated: { icon: Gear, label: 'Consent Updated', color: 'bg-amber-500' },
};

function formatTime(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false 
  });
}

function getCountryFlag(countryCode: string | null) {
  if (!countryCode || countryCode === 'XX') return '🌍';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function LiveEventFeed({ websiteId }: LiveEventFeedProps) {
  const { events, isConnected, connectionStatus, clearEvents } = useAnalyticsWebSocket(websiteId);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Broadcast size={16} className="text-primary animate-pulse" />
              Live Activity
            </CardTitle>
            <CardDescription>Real-time consent events from your website.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={isConnected ? "default" : "secondary"} 
              className={`flex items-center gap-1 ${isConnected ? 'bg-green-500/10 text-green-600 border-green-200' : ''}`}
            >
              {isConnected ? (
                <>
                  <WifiHigh size={12} />
                  Live
                </>
              ) : (
                <>
                  <WifiSlash size={12} />
                  {connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
                </>
              )}
            </Badge>
            {events.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearEvents}
                className="h-7 px-2"
              >
                <Trash size={12} />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <Broadcast size={32} className="text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                {isConnected 
                  ? "Waiting for consent events..." 
                  : "Connect to see live events"}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Events will appear here in real-time as visitors interact with your banner.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {events.map((event) => {
                  const config = eventConfig[event.eventType] || { 
                    icon: Eye, 
                    label: event.eventType, 
                    color: 'bg-gray-500' 
                  };
                  const Icon = config.icon;
                  
                  return (
                    <motion.div
                      key={event.id + event.timestamp}
                      initial={{ opacity: 0, x: -20, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: 'auto' }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      data-testid={`live-event-${event.id}`}
                    >
                      <div className={`w-8 h-8 rounded-full ${config.color}/10 flex items-center justify-center flex-shrink-0`}>
                        <Icon size={16} className={config.color.replace('bg-', 'text-')} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{config.label}</span>
                          <span className="text-lg" title={event.country || 'Unknown'}>
                            {getCountryFlag(event.country)}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(event.timestamp)}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {event.country || 'Unknown'}
                      </Badge>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
