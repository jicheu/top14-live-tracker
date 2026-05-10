import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext.jsx';

const EVENT_ICON = {
  essai:          '🏉',
  transformation: '🎯',
  penalite:       '🥅',
  drop:           '💧',
  carton_jaune:   '🟨',
  carton_rouge:   '🟥',
};

// Only show these in the card summary (skip substitutions etc.)
const SUMMARY_TYPES = new Set(['essai', 'transformation', 'penalite', 'drop', 'carton_jaune', 'carton_rouge']);

function LiveSummary({ match }) {
  const { t } = useLanguage();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const resp = await fetch(`/api/matches/${match.id}`);
        const data = await resp.json();
        if (!cancelled) setEvents(data.events || []);
      } catch (_) {}
    }

    load();
    const interval = setInterval(load, 30_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [match.id]);

  const summaryEvents = events.filter(e => SUMMARY_TYPES.has(e.event_type));
  if (summaryEvents.length === 0) return null;

  const homeEvents = summaryEvents.filter(e => e.team_id === match.home_team_id);
  const awayEvents = summaryEvents.filter(e => e.team_id === match.away_team_id);

  const renderEvent = (e, i) => (
    <span key={i} className="live-event-item" title={`${t.eventType[e.event_type] || e.event_type} — ${e.player}`}>
      {EVENT_ICON[e.event_type] || '•'}
      <span className="live-event-minute">{e.minute}'</span>
      <span className="live-event-player">{e.player}</span>
    </span>
  );

  return (
    <div className="live-summary">
      <div className="live-summary-col live-summary-home">
        {homeEvents.map(renderEvent)}
      </div>
      <div className="live-summary-divider" />
      <div className="live-summary-col live-summary-away">
        {awayEvents.map(renderEvent)}
      </div>
    </div>
  );
}

export default function MatchCard({ match, onClick, isLive }) {
  const { t } = useLanguage();
  const statusLabel = t.status[match.status]
    || (match.status === 'Started' ? t.ui.liveNow
      : match.status === 'Match Finished' ? t.status.FT
      : match.status);
  const isFinished = match.status === 'FT' || match.status === 'Match Finished';

  return (
    <div
      className={`match-card ${isLive ? 'match-card--live' : ''} ${isFinished ? 'match-card--finished' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      {/* Status badge + live clock */}
      <div className={`match-status status--${match.status}`}>
        {isLive && <span className="live-dot-small"></span>}
        <span>{statusLabel}</span>
        {isLive && match.match_clock && match.match_clock !== 'HT' && (
          <span className="live-clock">{match.match_clock}</span>
        )}
        {match.status === 'NS' && match.round > 0 && (
          <span className="match-round-tag"> — {t.ui.roundShort}{match.round}</span>
        )}
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

      {/* Scoring timeline summary — live only */}
      {isLive && <LiveSummary match={match} />}

      {/* Venue */}
      {match.venue && (
        <div className="match-venue">{match.venue}</div>
      )}
    </div>
  );
}
