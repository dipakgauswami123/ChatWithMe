// hooks/useSocket.js — Socket.IO connection management hook

import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

/**
 * Custom hook that manages a Socket.IO connection and
 * exposes the socket ref along with derived state.
 */
export function useSocket() {
  const socketRef = useRef(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('online_count', ({ count }) => setOnlineCount(count));

    return () => {
      socket.disconnect();
    };
  }, []);

  /**
   * Emit an event. Safe to call even before socket is ready.
   */
  const emit = useCallback((event, data) => {
    socketRef.current?.emit(event, data);
  }, []);

  /**
   * Register an event listener. Returns a cleanup function.
   */
  const on = useCallback((event, handler) => {
    socketRef.current?.on(event, handler);
    return () => socketRef.current?.off(event, handler);
  }, []);

  return { socketRef, onlineCount, isConnected, emit, on };
}
