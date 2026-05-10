import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import TeamFormModal from './TeamFormModal.jsx';

export default function Standings({ competition }) {
  const { t } = useLanguage();
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    async function fetchStandings() {
      try {
        setLoading(true);
        setError(null);
        const resp = await fetch(`/api/standings?competition=${competition}`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        setStandings(data.standings || []);
      } catch (err) {
        console.error('Erreur chargement classement:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStandings();
  }, [competition]);

  if (loading) {
    return (
      <div className="loading-text">
        <p>{t.ui.connecting}</p>
      </div>
    );
  }

  if (error || standings.length === 0) {
    return (
      <div className="no-matches">
        <p>{t.ui.standingsNoData}</p>
      </div>
    );
  }

  // Determine whether we have bonus-point data (ESPN provides it)
  const hasBonusPoints = standings.some(team => (team.bonusPoints ?? 0) > 0 || (team.bonusOffensive ?? 0) > 0);

  return (
    <>
      <div className="standings-container">
        <div className="standings-header-info">
          <p className="standings-disclaimer">
            {t.ui.standingsDisclaimer}
          </p>
        </div>
        <table className="standings-table">
          <thead>
            <tr>
              <th className="th-rank">#</th>
              <th className="th-team">{t.ui.teamForm}</th>
              <th className="th-stat">J</th>
              <th className="th-stat">G</th>
              <th className="th-stat">N</th>
              <th className="th-stat">P</th>
              <th className="th-stat hidden-mobile">Pts +</th>
              <th className="th-stat hidden-mobile">Pts -</th>
              <th className="th-stat">Diff</th>
              {hasBonusPoints && <th className="th-stat hidden-mobile">Bonus</th>}
              <th className="th-pts">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team, index) => {
              const rank = team.rank ?? index + 1;
              return (
                <tr
                  key={team.id}
                  className={`standings-row${rank <= 6 ? ' rank-playoffs' : ''}`}
                  onClick={() => setSelectedTeam(team)}
                  title={t.ui.teamForm}
                >
                  <td className="td-rank">{rank}</td>
                  <td className="td-team">
                    <div className="standings-team-info">
                      {team.badge_url && (
                        <img src={team.badge_url} alt="" className="standings-badge" />
                      )}
                      <span className="standings-team-name">{team.name}</span>
                    </div>
                  </td>
                  <td className="td-stat">{team.played}</td>
                  <td className="td-stat">{team.won}</td>
                  <td className="td-stat">{team.drawn}</td>
                  <td className="td-stat">{team.lost}</td>
                  <td className="td-stat hidden-mobile">{team.pointsFor}</td>
                  <td className="td-stat hidden-mobile">{team.pointsAgainst}</td>
                  <td className={`td-stat ${team.diff > 0 ? 'text-success' : team.diff < 0 ? 'text-error' : ''}`}>
                    {team.diff > 0 ? `+${team.diff}` : team.diff}
                  </td>
                  {hasBonusPoints && (
                    <td className="td-stat hidden-mobile">{team.bonusPoints ?? 0}</td>
                  )}
                  <td className="td-pts">{team.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="standings-legend">
          <div className="legend-item">
            <span className="legend-dot rank-playoffs"></span>
            <span>{t.ui.playoffs}</span>
          </div>
        </div>
      </div>

      {selectedTeam && (
        <TeamFormModal
          team={selectedTeam}
          competition={competition}
          onClose={() => setSelectedTeam(null)}
        />
      )}
    </>
  );
}
