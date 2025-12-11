import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Hook para conectarse al WebSocket del scanner-app local.
 * 
 * El scanner-app corre en la PC del usuario y recibe códigos del móvil.
 * Este hook conecta el browser al scanner-app para recibir los códigos
 * directamente sin simular teclado.
 * 
 * @param onScan - Callback cuando se recibe un código de barras
 * @param options - Opciones de configuración
 */

interface UseScannerWebSocketOptions {
    /** URL del WebSocket (default: ws://localhost:8001/ws/scanner) */
    url?: string;
    /** Si está habilitado */
    enabled?: boolean;
    /** Intervalo de reconexión en ms */
    reconnectInterval?: number;
}

interface ConnectionState {
    isConnected: boolean;
    isConnecting: boolean;
    error: string | null;
}

export function useScannerWebSocket(
    onScan: (barcode: string) => void,
    options: UseScannerWebSocketOptions = {}
) {
    const {
        url = 'ws://localhost:8001/ws/scanner',
        enabled = true,
        reconnectInterval = 3000,
    } = options;

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const onScanRef = useRef(onScan);
    
    const [connectionState, setConnectionState] = useState<ConnectionState>({
        isConnected: false,
        isConnecting: false,
        error: null,
    });

    // Mantener referencia actualizada del callback
    useEffect(() => {
        onScanRef.current = onScan;
    }, [onScan]);

    const connect = useCallback(() => {
        if (!enabled) return;
        if (wsRef.current?.readyState === WebSocket.OPEN) return;
        if (wsRef.current?.readyState === WebSocket.CONNECTING) return;

        setConnectionState(prev => ({ ...prev, isConnecting: true, error: null }));
        console.log('Conectando al scanner-app...');

        try {
            const ws = new WebSocket(url);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('Conectado al scanner-app');
                setConnectionState({
                    isConnected: true,
                    isConnecting: false,
                    error: null,
                });
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'scan' && data.barcode) {
                        console.log('Código recibido:', data.barcode);
                        onScanRef.current(data.barcode);
                    }
                } catch (e) {
                    // Ignorar mensajes que no son JSON (como pong)
                }
            };

            ws.onclose = () => {
                console.log('Desconectado del scanner-app');
                setConnectionState({
                    isConnected: false,
                    isConnecting: false,
                    error: null,
                });
                wsRef.current = null;

                // Reconectar automáticamente
                if (enabled) {
                    reconnectTimeoutRef.current = setTimeout(() => {
                        connect();
                    }, reconnectInterval);
                }
            };

            ws.onerror = (error) => {
                console.log('Error de conexión con scanner-app (¿está corriendo?)');
                setConnectionState({
                    isConnected: false,
                    isConnecting: false,
                    error: 'No se pudo conectar al scanner-app',
                });
            };

            // Ping para mantener conexión viva
            const pingInterval = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send('ping');
                }
            }, 30000);

            ws.addEventListener('close', () => {
                clearInterval(pingInterval);
            });

        } catch (error) {
            setConnectionState({
                isConnected: false,
                isConnecting: false,
                error: 'Error al crear conexión WebSocket',
            });
        }
    }, [url, enabled, reconnectInterval]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (enabled) {
            connect();
        } else {
            disconnect();
        }

        return () => {
            disconnect();
        };
    }, [enabled, connect, disconnect]);

    return {
        ...connectionState,
        reconnect: connect,
    };
}
