import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';

const GameContext = createContext(null);
export function useGame() { return useContext(GameContext); }

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export function GameProvider({ gameId, children }) {
  const { token, user } = useAuth();
  const [gameState, setGameState] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const wsRef = useRef(null);
  const reconnectRef = useRef(null);
  const notificationTimersRef = useRef(new Map());
  const nextNotificationIdRef = useRef(1);

  const pushNotification = useCallback((message, isError = false) => {
    const id = nextNotificationIdRef.current++;
    setNotifications(prev => [...prev.slice(-9), { id, message, isError }]);
    const timeout = setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
      notificationTimersRef.current.delete(id);
    }, 6000);
    notificationTimersRef.current.set(id, timeout);
  }, []);

  const connect = useCallback(() => {
    if (!gameId || !token) return;
    const wsUrl = BACKEND_URL.replace('https://', 'wss://').replace('http://', 'ws://');
    const ws = new WebSocket(`${wsUrl}/api/ws/${gameId}?token=${token}`);

    ws.onopen = () => {
      setConnected(true);
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'game_state') {
          setGameState(msg.state);
        } else if (msg.type === 'notification') {
          pushNotification(msg.message);
        } else if (msg.type === 'action_result' && msg.success) {
          if (
            msg.message?.startsWith('Scout used|') ||
            msg.message?.startsWith('Scorpion spy|') ||
            msg.message?.startsWith('territory_card|')
          ) {
            pushNotification(msg.message);
          }
        } else if (msg.type === 'action_result' && !msg.success) {
          pushNotification(msg.message, true);
        }
      } catch (e) {
        console.error('WS parse error:', e);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      reconnectRef.current = setTimeout(() => connect(), 3000);
    };

    ws.onerror = () => { ws.close(); };

    wsRef.current = ws;
  }, [gameId, token, pushNotification]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      notificationTimersRef.current.forEach((timeout) => clearTimeout(timeout));
      notificationTimersRef.current.clear();
    };
  }, [connect]);

  const sendAction = useCallback((action) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(action));
    }
  }, []);

  const dismissNotification = useCallback((id) => {
    const timeout = notificationTimersRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      notificationTimersRef.current.delete(id);
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <GameContext.Provider value={{ gameState, connected, sendAction, notifications, dismissNotification, user }}>
      {children}
    </GameContext.Provider>
  );
}
