import { io } from 'socket.io-client';

// Connect to the same origin that served the page.
// - In dev (Vite proxy): window.location is localhost:5173, proxy forwards to localhost:3001
// - In snap/production: window.location is localhost:3002 (served directly by Express)
// Using window.location.origin handles both cases without hardcoding a port.
const SOCKET_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';

const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 2000,
  reconnectionAttempts: 10,
});

export const socketService = {
  socket,

  onConnect(callback) {
    socket.on('connect', callback);
  },

  onDisconnect(callback) {
    socket.on('disconnect', callback);
  },

  /**
   * Écoute les mises à jour de tous les matchs.
   */
  onMatchesUpdate(callback) {
    socket.on('matches:update', callback);
  },

  /**
   * Écoute les nouveaux événements de score.
   */
  onScoreEvent(callback) {
    socket.on('match:event', callback);
  },

  /**
   * Supprime tous les listeners.
   */
  removeAllListeners() {
    socket.off('matches:update');
    socket.off('match:event');
    socket.off('connect');
    socket.off('disconnect');
  },

  disconnect() {
    socket.disconnect();
  },
};
