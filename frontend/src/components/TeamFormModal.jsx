import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function TeamFormModal({ team, competition, onClose }) {
  const { t } = useLanguage();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchForm() {
      try {
        const resp = await fetch(
          `/api/team-form?teamId=${encodeURIComponent(team.id)}&competition=${encodeURIComponent(competition)}`
        );
        const data = await resp.json();
        setMatches(data.matches || []);
      } catch (err) {
        console.error('[TeamFormModal] fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchForm();
  }, [team.id, competition]);

  function getResult(match, teamId) {
    const isHome = match.home_team_id === teamId;
    const scored   = isHome ? match.score_home : match.score_away;
    const conceded = isHome ? match.score_away : match.score_home;
    if (scored > conceded) return 'W';
    if (scored < conceded) return 'L';
    return 'D';
  }

  function resultLabel(r) {
    if (r === 'W') return t.ui.formWin;
    if (r === 'D') return t.ui.formDraw;
    return t.ui.formLoss;
  }

  function resultClass(r) {
    if (r === 'W') return 'form-badge form-badge--win';
    if (r === 'D') return 'form-badge form-badge--draw';
    return 'form-badge form-badge--loss';
  }

  function formatMatchDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(t.ui.locale, { day: 'numeric', month: 'short' });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content team-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="team-form-header-info">
            {team.badge_url && (
              <img src={team.badge_url} alt="" className="team-form-badge" />
            )}
            <div>
              <h2>{team.name}</h2>
              <p className="team-form-subtitle">
                {loading ? t.ui.teamForm : t.ui.lastN(matches.length)}
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>{t.ui.close} ✕</button>
        </div>

        {loading ? (
          <p className="loading-text">{t.ui.loading}</p>
        ) : matches.length === 0 ? (
          <p className="no-matches">{t.ui.noRecentMatches}</p>
        ) : (
          <>
            {/* Sequential W/D/L pills — e.g. W L D W L */}
            <div className="team-form-pills">
              {matches.map((m, i) => {
                const r = getResult(m, team.id);
                return (
                  <span key={i} className={resultClass(r)}>{resultLabel(r)}</span>
                );
              })}
            </div>

            {/* Match bullets */}
            <div className="team-form-matches">
              {matches.map((m, i) => {
                const r = getResult(m, team.id);
                const isHome = m.home_team_id === team.id;
                const opponent      = isHome ? m.away_team_name : m.home_team_name;
                const opponentBadge = isHome ? m.away_team_badge : m.home_team_badge;
                const scoreStr = isHome
                  ? `${m.score_home} – ${m.score_away}`
                  : `${m.score_away} – ${m.score_home}`;

                return (
                  <div key={i} className={`team-form-row result-${r.toLowerCase()}`}>
                    <span className={resultClass(r)}>{resultLabel(r)}</span>
                    <div className="team-form-opponent">
                      {opponentBadge && (
                        <img src={opponentBadge} alt="" className="form-opp-badge"
                          onError={(e) => { e.target.style.display = 'none'; }} />
                      )}
                      <span>{opponent}</span>
                    </div>
                    <span className="team-form-score">{scoreStr}</span>
                    <span className="team-form-date">{formatMatchDate(m.match_date)}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
