import React, { useState, useEffect, useCallback } from 'react';
import { socketService } from './services/socket.js';
import fr from './i18n/fr.js';
import MatchList from './components/MatchList.jsx';
import MatchDetailModal from './components/MatchDetailModal.jsx';

export default function App() {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  // Chargement initial via REST
  useEffect(() => {
    async function fetchInitial() {
      try {
        const resp = await fetch('/api/matches');
        const data = await resp.json();
        setMatches(data.matches || []);
      } catch (err) {
        console.error('Erreur chargement initial:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchInitial();
  }, []);

  // Connexion Socket.IO pour les mises à jour en temps réel
  useEffect(() => {
    socketService.onConnect(() => {
      setConnected(true);
      console.log('[Socket] Connecté');
    });

    socketService.onDisconnect(() => {
      setConnected(false);
      console.log('[Socket] Déconnecté');
    });

    socketService.onMatchesUpdate((data) => {
      setMatches(data.matches || []);

      // Mettre à jour le match sélectionné si ouvert
      if (selectedMatch) {
        const updated = (data.matches || []).find(m => m.id === selectedMatch.id);
        if (updated) setSelectedMatch(updated);
      }
    });

    return () => {
      socketService.removeAllListeners();
    };
  }, [selectedMatch]);

  const handleSelectMatch = useCallback((match) => {
    setSelectedMatch(match);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedMatch(null);
  }, []);

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <span className="title-icon">🏉</span>
            {fr.ui.title}
          </h1>
          <p className="app-subtitle">{fr.ui.subtitle}</p>
        </div>
        <div className={`connection-status ${connected ? 'status-connected' : 'status-disconnected'}`}>
          <span className="status-dot"></span>
          {connected ? fr.ui.connected : fr.ui.disconnected}
        </div>
      </header>

      {/* Main content */}
      <main className="app-main">
        {loading ? (
          <div className="loading">
            <p>{fr.ui.connecting}</p>
          </div>
        ) : (
          <MatchList matches={matches} onSelectMatch={handleSelectMatch} />
        )}
      </main>

      {/* Modal détail match */}
      {selectedMatch && (
        <MatchDetailModal match={selectedMatch} onClose={handleCloseModal} />
      )}
    </div>
  );
}
