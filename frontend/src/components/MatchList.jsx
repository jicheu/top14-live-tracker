import React from 'react';
import fr from '../i18n/fr.js';
import MatchCard from './MatchCard.jsx';

export default function MatchList({ matches, onSelectMatch, emptyMessage }) {
  const liveMatches = matches.filter(m => ['1H', 'HT', '2H', 'Started'].includes(m.status));
  const upcomingMatches = matches.filter(m => m.status === 'NS');
  const finishedMatches = matches.filter(m => ['FT', 'Match Finished'].includes(m.status));

  const hasSections = liveMatches.length > 0 && (upcomingMatches.length > 0 || finishedMatches.length > 0);

  return (
    <div className="match-list">
      {/* Matchs en direct */}
      {liveMatches.length > 0 && (
        <section className="match-section">
          {hasSections && (
            <h2 className="section-title live-title">
              <span className="live-dot"></span>
              {fr.ui.liveNow}
            </h2>
          )}
          <div className="match-grid">
            {liveMatches.map(match => (
              <MatchCard key={match.id} match={match} onClick={() => onSelectMatch(match)} isLive />
            ))}
          </div>
        </section>
      )}

      {/* Matchs à venir */}
      {upcomingMatches.length > 0 && (
        <section className="match-section">
          {hasSections && <h2 className="section-title">{fr.ui.allMatches} — {fr.status.NS}</h2>}
          <div className="match-grid">
            {upcomingMatches.map(match => (
              <MatchCard key={match.id} match={match} onClick={() => onSelectMatch(match)} />
            ))}
          </div>
        </section>
      )}

      {/* Matchs terminés */}
      {finishedMatches.length > 0 && (
        <section className="match-section">
          {hasSections && <h2 className="section-title">{fr.status.FT}</h2>}
          <div className="match-grid">
            {finishedMatches.map(match => (
              <MatchCard key={match.id} match={match} onClick={() => onSelectMatch(match)} />
            ))}
          </div>
        </section>
      )}

      {matches.length === 0 && (
        <div className="no-matches">
          <p>{emptyMessage || fr.ui.noLiveMatches}</p>
        </div>
      )}
    </div>
  );
}
