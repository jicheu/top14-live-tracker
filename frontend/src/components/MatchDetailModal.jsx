import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import ScoreEvent from './ScoreEvent.jsx';
import YouTubeLink from './YouTubeLink.jsx';

export default function MatchDetailModal({ match, onClose }) {
  const { t } = useLanguage();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const resp = await fetch(`/api/matches/${match.id}`);
        const data = await resp.json();
        setEvents(data.events || []);
      } catch (err) {
        console.error('Erreur chargement événements:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [match.id]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const resp = await fetch(`/api/matches/${match.id}`);
        const data = await resp.json();
        setEvents(data.events || []);
      } catch (err) {
        // Silently retry
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [match.id]);

  const statusLabel = t.status[match.status] || match.status;
  const isLive = ['1H', 'HT', '2H'].includes(match.status);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>{t.ui.matchDetail}</h2>
          <button className="modal-close" onClick={onClose}>{t.ui.close} ✕</button>
        </div>

        {/* Match info */}
        <div className="modal-match-info">
          <div className={`modal-status status--${match.status}`}>
            {isLive && <span className="live-dot-small"></span>}
            {statusLabel}
          </div>

          <div className="modal-teams">
            <div className="modal-team">
              <img
                className="modal-badge"
                src={match.home_team_badge}
                alt={match.home_team_name}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <span className="modal-team-name">{match.home_team_name}</span>
            </div>

            <div className="modal-score-block">
              <div className="modal-score-main">
                <span>{match.score_home}</span>
                <span className="score-separator">-</span>
                <span>{match.score_away}</span>
              </div>

              {match.status !== 'NS' && (
                <div className="modal-half-scores">
                  <div className="half-score">
                    <span className="half-label">{t.ui.firstHalf}</span>
                    <span>{match.home_1h} - {match.away_1h}</span>
                  </div>
                  {(match.status === '2H' || match.status === 'FT') && (
                    <div className="half-score">
                      <span className="half-label">{t.ui.secondHalf}</span>
                      <span>{match.home_2h} - {match.away_2h}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-team">
              <img
                className="modal-badge"
                src={match.away_team_badge}
                alt={match.away_team_name}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <span className="modal-team-name">{match.away_team_name}</span>
            </div>
          </div>

          {match.venue && (
            <div className="modal-venue">{t.ui.venue} : {match.venue}</div>
          )}

          <YouTubeLink matchId={match.id} isFinished={['FT', 'Match Finished'].includes(match.status)} />
        </div>

        {/* Score timeline */}
        <div className="modal-timeline">
          <h3>{t.ui.scoreTimeline}</h3>
          {loading ? (
            <p className="loading-text">{t.ui.loading}</p>
          ) : events.length > 0 ? (
            <div className="timeline-list">
              {events.map((event, i) => (
                <ScoreEvent key={i} event={event} />
              ))}
            </div>
          ) : (
            <p className="no-events">{t.ui.noEvents}</p>
          )}
        </div>
      </div>
    </div>
  );
}
