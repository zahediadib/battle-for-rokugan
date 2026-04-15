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
          setNotifications(prev => [...prev.slice(-9), { id: Date.now(), message: msg.message }]);
        } else if (msg.type === 'action_result' && !msg.success) {
          setNotifications(prev => [...prev.slice(-9), { id: Date.now(), message: msg.message, isError: true }]);
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
  }, [gameId, token]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };
  }, [connect]);

  const sendAction = useCallback((action) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(action));
    }
  }, []);

  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <GameContext.Provider value={{ gameState, connected, sendAction, notifications, dismissNotification, user }}>
      {children}
    </GameContext.Provider>
  );
}
