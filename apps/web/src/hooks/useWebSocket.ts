import { useCallback, useEffect, useRef, useState } from "react";

interface UseWebSocketOptions {
  url: string;
  enabled?: boolean;
  onMessage?: (data: unknown) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

type ConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export function useWebSocket(options: UseWebSocketOptions) {
  const { url, enabled = true, onMessage, onError, onOpen, onClose } = options;

  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("idle");
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const reconnectAttemptsRef = useRef(0);

  // Store callbacks in refs to avoid recreating connect function
  const onMessageRef = useRef(onMessage);
  const onErrorRef = useRef(onError);
  const onOpenRef = useRef(onOpen);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onMessageRef.current = onMessage;
    onErrorRef.current = onError;
    onOpenRef.current = onOpen;
    onCloseRef.current = onClose;
  }, [onMessage, onError, onOpen, onClose]);

  const connect = useCallback(() => {
    if (!enabled) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setConnectionStatus("connecting");

    const ws = new WebSocket(url);

    ws.onopen = () => {
      reconnectAttemptsRef.current = 0;
      setConnectionStatus("connected");
      onOpenRef.current?.();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessageRef.current?.(data);
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      setConnectionStatus("error");
      onErrorRef.current?.(error);
    };

    ws.onclose = () => {
      setConnectionStatus("disconnected");
      onCloseRef.current?.();

      const delay = Math.min(1000 * 2 ** reconnectAttemptsRef.current, 30000);
      reconnectAttemptsRef.current++;

      reconnectTimeoutRef.current = setTimeout(() => {
        if (enabled) {
          connect();
        }
      }, delay);
    };

    wsRef.current = ws;
  }, [enabled, url]);

  const sendMessage = useCallback((message: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    wsRef.current?.close();
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect, enabled]);

  return {
    connectionStatus,
    isConnected: connectionStatus === "connected",
    sendMessage,
    disconnect,
    reconnect: connect,
    ws: wsRef.current,
  };
}
