import { useEffect, useState, useCallback, useRef } from 'react';

interface AnalyticsEvent {
  id: string;
  eventType: string;
  country: string | null;
  timestamp: string;
}

interface UseAnalyticsWebSocketReturn {
  events: AnalyticsEvent[];
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  clearEvents: () => void;
}

export function useAnalyticsWebSocket(websiteId: string | null): UseAnalyticsWebSocketReturn {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  useEffect(() => {
    if (!websiteId) {
      setConnectionStatus('disconnected');
      return;
    }

    const connect = () => {
      setConnectionStatus('connecting');

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/analytics?websiteId=${websiteId}`;

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('Analytics WebSocket connected');
          setConnectionStatus('connected');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'analytics_event') {
              setEvents(prev => {
                const newEvents = [data.data, ...prev];
                return newEvents.slice(0, 50);
              });
            }
          } catch (e) {
            console.error('Failed to parse WebSocket message:', e);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setConnectionStatus('error');
        };

        ws.onclose = () => {
          console.log('Analytics WebSocket closed');
          setConnectionStatus('disconnected');
          reconnectTimeoutRef.current = setTimeout(connect, 5000);
        };
      } catch (error) {
        console.error('Failed to create WebSocket:', error);
        setConnectionStatus('error');
      }
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [websiteId]);

  return {
    events,
    isConnected: connectionStatus === 'connected',
    connectionStatus,
    clearEvents,
  };
}
