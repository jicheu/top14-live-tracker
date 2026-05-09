import React from 'react';
import fr from '../i18n/fr.js';

export default function MatchCard({ match, onClick, isLive }) {
  const statusLabel = fr.status[match.status] || match.status;

  return (
    <div
      className={`match-card ${isLive ? 'match-card--live' : ''} ${match.status === 'FT' ? 'match-card--finished' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      {/* Status badge */}
      <div className={`match-status status--${match.status}`}>
        {isLive && <span className="live-dot-small"></span>}
        {statusLabel}
      </div>

      {/* Teams and scores */}
      <div className="match-teams">
        {/* Home team */}
        <div className="team team--home">
          <img
            className="team-badge"
            src={match.home_team_badge}
            alt={match.home_team_name}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span className="team-name">{match.home_team_name}</span>
        </div>

        {/* Score */}
        <div className="match-score">
          {match.status === 'NS' ? (
            <span className="match-time-display">{match.match_time?.substring(0, 5)}</span>
          ) : (
            <>
              <span className="score-home">{match.score_home}</span>
              <span className="score-separator">-</span>
              <span className="score-away">{match.score_away}</span>
            </>
          )}
        </div>

        {/* Away team */}
        <div className="team team--away">
          <img
            className="team-badge"
            src={match.away_team_badge}
            alt={match.away_team_name}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span className="team-name">{match.away_team_name}</span>
        </div>
      </div>

      {/* Venue */}
      {match.venue && (
        <div className="match-venue">{match.venue}</div>
      )}
    </div>
  );
}
