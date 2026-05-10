import React, { useState, useEffect, useCallback } from 'react';
import { socketService } from './services/socket.js';
import fr from './i18n/fr.js';
import MatchList from './components/MatchList.jsx';
import MatchDetailModal from './components/MatchDetailModal.jsx';
import Sidebar from './components/Sidebar.jsx';
import RoundNavigator from './components/RoundNavigator.jsx';
import ViewToggle from './components/ViewToggle.jsx';
import Standings from './components/Standings.jsx';

// Competitions with no data source yet
const UNSUPPORTED_COMPETITIONS = new Set([
  'prod2',
  'mlr',
  'english_championship',
  'irish_championship',
  'six_nations_female',
  'european_championship',
]);

export default function App() {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentCompetition, setCurrentCompetition] = useState('top14');
  const [currentRound, setCurrentRound] = useState(null);
  const [availableRounds, setAvailableRounds] = useState([]);
  const [currentDate, setCurrentDate] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'auto');
  const [currentView, setCurrentView] = useState('results'); // 'live', 'results', 'standings'

  // Appliquer le thème
  useEffect(() => {
    const applyTheme = (t) => {
      let activeTheme = t;
      if (t === 'auto') {
        activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', activeTheme);
    };

    applyTheme(theme);
    localStorage.setItem('theme', theme);

    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme('auto');
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  // Chargement initial via REST
  useEffect(() => {
    if (UNSUPPORTED_COMPETITIONS.has(currentCompetition)) {
      setMatches([]);
      setAvailableRounds([]);
      setAvailableDates([]);
      setLoading(false);
      return;
    }
    async function fetchInitial() {
      try {
        setLoading(true);
        let url = `/api/matches?competition=${currentCompetition}`;

        // Determine navigation mode from what we already know about this competition.
        // availableRounds is populated after the first fetch; before that, default to
        // round-based for top14 (the only round-based competition).
        const isRoundBased = availableRounds.some(r => r > 0) || currentCompetition === 'top14';

        if (currentView === 'results') {
          if (isRoundBased && currentRound) url += `&round=${currentRound}`;
          if (!isRoundBased && currentDate)  url += `&date=${currentDate}`;
        }

        const resp = await fetch(url);
        const data = await resp.json();

        setMatches(data.matches || []);
        setAvailableRounds(data.availableRounds || []);
        setAvailableDates(data.availableDates || []);

        if (currentView === 'results') {
          const newIsRoundBased = (data.availableRounds || []).some(r => r > 0);
          if (newIsRoundBased && data.currentRound) setCurrentRound(data.currentRound);
          if (!newIsRoundBased && data.currentDate)  setCurrentDate(data.currentDate);
        }
      } catch (err) {
        console.error('Erreur chargement initial:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchInitial();
  }, [currentCompetition, currentRound, currentDate, currentView]);

  // Reset navigation when competition changes
  const handleSelectCompetition = useCallback((id) => {
    setCurrentCompetition(id);
    setCurrentRound(null);
    setCurrentDate(null);
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
      // Filtrer les matchs pour la compétition et le round actuels
      // En vue "live", on ignore le filtre de round
      const filteredMatches = (data.matches || []).filter(m => 
        m.competition === currentCompetition && 
        (currentView === 'live' || !currentRound || m.round === currentRound)
      );
      setMatches(filteredMatches);

      // Mettre à jour le match sélectionné si ouvert et s'il appartient à cette compétition/round
      if (selectedMatch) {
        const updated = filteredMatches.find(m => m.id === selectedMatch.id);
        if (updated) setSelectedMatch(updated);
      }
    });

    socketService.onScoreEvent((event) => {
      // Optionnel: On pourrait filtrer les événements ici si on veut
      // console.log('[Socket] Event reçu:', event);
    });

    return () => {
      socketService.removeAllListeners();
    };
  }, [selectedMatch, currentCompetition, currentRound, currentView]);

  const handleSelectMatch = useCallback((match) => {
    setSelectedMatch(match);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedMatch(null);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  return (
    <div className="app">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        currentCompetition={currentCompetition}
        onSelectCompetition={handleSelectCompetition}
        theme={theme}
        onThemeChange={setTheme}
        unsupportedCompetitions={UNSUPPORTED_COMPETITIONS}
      />

      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <button className="burger-menu" onClick={toggleSidebar} aria-label={fr.ui.menu}>
            <div className="burger-line"></div>
            <div className="burger-line"></div>
            <div className="burger-line"></div>
          </button>
          <div className="header-content">
            <h1 className="app-title">
              <span className="title-icon">🏉</span>
              {fr.competitions[currentCompetition]}
            </h1>
            <p className="app-subtitle">{fr.ui.subtitle}</p>
          </div>
        </div>
        <div className="header-right">
          <div className={`connection-status ${connected ? 'status-connected' : 'status-disconnected'}`}>
            <span className="status-dot"></span>
            {connected ? fr.ui.connected : fr.ui.disconnected}
          </div>
        </div>
      </header>

      {/* View Toggle */}
      <ViewToggle currentView={currentView} onToggle={setCurrentView} />

      {/* Round / Day Navigation — only in Results view */}
      {currentView === 'results' && availableRounds.some(r => r > 0) && (
        <RoundNavigator
          mode="round"
          currentRound={currentRound}
          availableRounds={availableRounds}
          onRoundChange={setCurrentRound}
        />
      )}
      {currentView === 'results' && !availableRounds.some(r => r > 0) && (
        <RoundNavigator
          mode="date"
          currentDate={currentDate}
          availableDates={availableDates}
          onDateChange={setCurrentDate}
        />
      )}

      {/* Main content */}
      <main className="app-main">
        {loading ? (
          <div className="loading">
            <p>{fr.ui.connecting}</p>
          </div>
        ) : UNSUPPORTED_COMPETITIONS.has(currentCompetition) ? (
          <div className="coming-soon">
            <div className="coming-soon-icon">🚧</div>
            <h2 className="coming-soon-title">{fr.ui.comingSoon}</h2>
            <p className="coming-soon-detail">{fr.ui.comingSoonDetail}</p>
          </div>
        ) : (
          <>
            {currentView === 'live' && (() => {
              const liveMatches = matches.filter(m => ['1H', 'HT', '2H', 'Started'].includes(m.status));
              
              if (liveMatches.length > 0) {
                // Show live matches
                return (
                  <MatchList 
                    matches={liveMatches} 
                    onSelectMatch={handleSelectMatch} 
                    emptyMessage={fr.ui.noLiveMatches}
                  />
                );
              }
              
              // No live matches - show next upcoming day (today or future only)
              const today = new Date().toISOString().split('T')[0];
              const upcomingMatches = matches
                .filter(m => m.status === 'NS' && m.match_date && m.match_date >= today)
                .sort((a, b) => {
                  // Sort by date first, then time
                  const dateCompare = a.match_date.localeCompare(b.match_date);
                  if (dateCompare !== 0) return dateCompare;
                  return (a.match_time || '').localeCompare(b.match_time || '');
                });
              
              if (upcomingMatches.length > 0) {
                // Get matches for the earliest upcoming date only
                const nextDate = upcomingMatches[0].match_date;
                const nextDayMatches = upcomingMatches.filter(m => m.match_date === nextDate);
                
                // Format date nicely
                const dateObj = new Date(nextDate + 'T00:00:00');
                const formattedDate = dateObj.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                });
                
                return (
                  <div className="upcoming-forecast">
                    <h2 className="section-title forecast-title">
                      Prochains matchs — {formattedDate}
                    </h2>
                    <MatchList 
                      matches={nextDayMatches} 
                      onSelectMatch={handleSelectMatch}
                      emptyMessage=""
                    />
                  </div>
                );
              }

              // No matches at all
              return (
                <div className="no-matches">
                  <p>{fr.ui.noLiveMatches}</p>
                </div>
              );
            })()}
            {currentView === 'results' && (
              <MatchList 
                matches={matches} 
                onSelectMatch={handleSelectMatch} 
                emptyMessage="Aucun match trouvé pour cette journée"
              />
            )}
            {currentView === 'standings' && (
              <Standings competition={currentCompetition} />
            )}
          </>
        )}
      </main>

      {/* Modal détail match */}
      {selectedMatch && (
        <MatchDetailModal match={selectedMatch} onClose={handleCloseModal} />
      )}
    </div>
  );
}
