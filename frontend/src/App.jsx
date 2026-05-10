import React, { useState, useEffect, useCallback } from 'react';
import { socketService } from './services/socket.js';
import { useLanguage } from './i18n/LanguageContext.jsx';
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
  const { t } = useLanguage();
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

  // Apply theme
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

  // Initial REST fetch
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

  // Socket.IO for real-time updates
  useEffect(() => {
    socketService.onConnect(() => {
      setConnected(true);
    });

    socketService.onDisconnect(() => {
      setConnected(false);
    });

    socketService.onMatchesUpdate((data) => {
      const filteredMatches = (data.matches || []).filter(m => 
        m.competition === currentCompetition && 
        (currentView === 'live' || !currentRound || m.round === currentRound)
      );
      setMatches(filteredMatches);

      if (selectedMatch) {
        const updated = filteredMatches.find(m => m.id === selectedMatch.id);
        if (updated) setSelectedMatch(updated);
      }
    });

    socketService.onScoreEvent((_event) => {});

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
          <button className="burger-menu" onClick={toggleSidebar} aria-label={t.ui.menu}>
            <div className="burger-line"></div>
            <div className="burger-line"></div>
            <div className="burger-line"></div>
          </button>
          <div className="header-content">
            <h1 className="app-title">
              <span className="title-icon">🏉</span>
              {t.competitions[currentCompetition]}
            </h1>
            <p className="app-subtitle">{t.ui.subtitle}</p>
          </div>
        </div>
        <div className="header-right">
          <div className={`connection-status ${connected ? 'status-connected' : 'status-disconnected'}`}>
            <span className="status-dot"></span>
            {connected ? t.ui.connected : t.ui.disconnected}
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
            <p>{t.ui.connecting}</p>
          </div>
        ) : UNSUPPORTED_COMPETITIONS.has(currentCompetition) ? (
          <div className="coming-soon">
            <div className="coming-soon-icon">🚧</div>
            <h2 className="coming-soon-title">{t.ui.comingSoon}</h2>
            <p className="coming-soon-detail">{t.ui.comingSoonDetail}</p>
          </div>
        ) : (
          <>
            {currentView === 'live' && (() => {
              const liveMatches = matches.filter(m => ['1H', 'HT', '2H', 'Started'].includes(m.status));
              
              if (liveMatches.length > 0) {
                return (
                  <MatchList 
                    matches={liveMatches} 
                    onSelectMatch={handleSelectMatch} 
                    emptyMessage={t.ui.noLiveMatches}
                  />
                );
              }
              
              // No live matches — show next upcoming day (today or future only)
              const today = new Date().toISOString().split('T')[0];
              const upcomingMatches = matches
                .filter(m => m.status === 'NS' && m.match_date && m.match_date >= today)
                .sort((a, b) => {
                  const dateCompare = a.match_date.localeCompare(b.match_date);
                  if (dateCompare !== 0) return dateCompare;
                  return (a.match_time || '').localeCompare(b.match_time || '');
                });
              
              if (upcomingMatches.length > 0) {
                const nextDate = upcomingMatches[0].match_date;
                const nextDayMatches = upcomingMatches.filter(m => m.match_date === nextDate);
                
                const dateObj = new Date(nextDate + 'T00:00:00');
                const formattedDate = dateObj.toLocaleDateString(t.ui.locale, { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                });
                
                return (
                  <div className="upcoming-forecast">
                    <h2 className="section-title forecast-title">
                      {t.ui.upcomingMatches} — {formattedDate}
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
                  <p>{t.ui.noLiveMatches}</p>
                </div>
              );
            })()}
            {currentView === 'results' && (
              <MatchList 
                matches={matches.filter(m => !['1H', 'HT', '2H', 'Started'].includes(m.status))} 
                onSelectMatch={handleSelectMatch} 
                emptyMessage={t.ui.noMatchesForDay}
              />
            )}
            {currentView === 'standings' && (
              <Standings competition={currentCompetition} />
            )}
          </>
        )}
      </main>

      {/* Match detail modal */}
      {selectedMatch && (
        <MatchDetailModal match={selectedMatch} onClose={handleCloseModal} />
      )}
    </div>
  );
}
