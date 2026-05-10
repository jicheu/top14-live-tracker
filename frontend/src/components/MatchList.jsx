import React from 'react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import MatchCard from './MatchCard.jsx';

export default function MatchList({ matches, onSelectMatch, emptyMessage }) {
  const { t } = useLanguage();
  const liveMatches = matches.filter(m => ['1H', 'HT', '2H', 'Started'].includes(m.status));
  const upcomingMatches = matches.filter(m => m.status === 'NS');
  const finishedMatches = matches.filter(m => ['FT', 'Match Finished'].includes(m.status));

  const hasSections = liveMatches.length > 0 && (upcomingMatches.length > 0 || finishedMatches.length > 0);

  return (
    <div className="match-list">
      {/* Live matches */}
      {liveMatches.length > 0 && (
        <section className="match-section">
          {hasSections && (
            <h2 className="section-title live-title">
              <span className="live-dot"></span>
              {t.ui.liveNow}
            </h2>
          )}
          <div className="match-grid">
            {liveMatches.map(match => (
              <MatchCard key={match.id} match={match} onClick={() => onSelectMatch(match)} isLive />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming matches */}
      {upcomingMatches.length > 0 && (
        <section className="match-section">
          {hasSections && <h2 className="section-title">{t.ui.allMatches} — {t.status.NS}</h2>}
          <div className="match-grid">
            {upcomingMatches.map(match => (
              <MatchCard key={match.id} match={match} onClick={() => onSelectMatch(match)} />
            ))}
          </div>
        </section>
      )}

      {/* Finished matches */}
      {finishedMatches.length > 0 && (
        <section className="match-section">
          {hasSections && <h2 className="section-title">{t.status.FT}</h2>}
          <div className="match-grid">
            {finishedMatches.map(match => (
              <MatchCard key={match.id} match={match} onClick={() => onSelectMatch(match)} />
            ))}
          </div>
        </section>
      )}

      {matches.length === 0 && (
        <div className="no-matches">
          <p>{emptyMessage || t.ui.noLiveMatches}</p>
        </div>
      )}
    </div>
  );
}
