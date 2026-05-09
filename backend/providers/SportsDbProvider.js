import axios from 'axios';
import { DataProvider } from './DataProvider.js';

const BASE_URL_V1 = 'https://www.thesportsdb.com/api/v1/json';
const LEAGUE_ID = '4430'; // French Top 14

/**
 * SportsDbProvider - Implémentation pour TheSportsDB API.
 * Utilise l'API v1 (gratuite) avec possibilité de passer en v2 (premium).
 */
export class SportsDbProvider extends DataProvider {
  constructor(apiKey = '123') {
    super();
    this.apiKey = apiKey;
    this.baseUrl = `${BASE_URL_V1}/${this.apiKey}`;
  }

  async fetchTeams() {
    try {
      const resp = await axios.get(`${this.baseUrl}/search_all_teams.php`, {
        params: { l: 'French_Top_14' },
      });

      if (!resp.data?.teams) return [];

      return resp.data.teams.map(t => ({
        id: t.idTeam,
        name: t.strTeam,
        badge_url: t.strBadge,
      }));
    } catch (err) {
      console.error('[SportsDB] Erreur fetchTeams:', err.message);
      return [];
    }
  }

  async fetchMatches() {
    try {
      // Récupérer les événements de la saison en cours
      const season = this._getCurrentSeason();
      const resp = await axios.get(`${this.baseUrl}/eventsseason.php`, {
        params: { id: LEAGUE_ID, s: season },
      });

      if (!resp.data?.events) return { matches: [], changes: [] };

      const matches = resp.data.events.map(e => this._normalizeMatch(e));

      // Détecter les changements (simplifié: on retourne tous les matchs)
      return { matches, changes: [] };
    } catch (err) {
      console.error('[SportsDB] Erreur fetchMatches:', err.message);
      return { matches: [], changes: [] };
    }
  }

  async fetchScoreEvents(matchId) {
    try {
      const resp = await axios.get(`${this.baseUrl}/lookuptimeline.php`, {
        params: { id: matchId },
      });

      if (!resp.data?.timeline) return [];

      return resp.data.timeline.map(t => ({
        match_id: matchId,
        team_id: t.idTeam,
        player: t.strPlayer || 'Inconnu',
        event_type: this._normalizeEventType(t.strTimeline),
        minute: parseInt(t.intTime) || 0,
        half: (parseInt(t.intTime) || 0) <= 40 ? 1 : 2,
        detail: t.strTimelineDetail || '',
      }));
    } catch (err) {
      console.error('[SportsDB] Erreur fetchScoreEvents:', err.message);
      return [];
    }
  }

  _getCurrentSeason() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    // La saison Top 14 va d'août à juin
    if (month >= 7) return `${year}-${year + 1}`;
    return `${year - 1}-${year}`;
  }

  _normalizeMatch(event) {
    // Parser les scores de mi-temps depuis strResult si disponible
    let home_1h = 0, away_1h = 0, home_2h = 0, away_2h = 0;
    if (event.strResult) {
      const halfMatch = event.strResult.match(/First Half:\s*(\d+)\s+(\d+)/i);
      const secondMatch = event.strResult.match(/Second Half\s*(\d+)\s+(\d+)/i);
      if (halfMatch) { home_1h = parseInt(halfMatch[1]); away_1h = parseInt(halfMatch[2]); }
      if (secondMatch) { home_2h = parseInt(secondMatch[1]); away_2h = parseInt(secondMatch[2]); }
    }

    return {
      id: event.idEvent,
      home_team_id: event.idHomeTeam,
      away_team_id: event.idAwayTeam,
      score_home: parseInt(event.intHomeScore) || 0,
      score_away: parseInt(event.intAwayScore) || 0,
      status: event.strStatus || 'NS',
      round: parseInt(event.intRound) || 0,
      match_date: event.dateEvent,
      match_time: event.strTime || '00:00:00',
      venue: event.strVenue || '',
      home_1h,
      away_1h,
      home_2h,
      away_2h,
      updated_at: new Date().toISOString(),
    };
  }

  _normalizeEventType(type) {
    const map = {
      'goal': 'essai',
      'try': 'essai',
      'conversion': 'transformation',
      'penalty': 'penalite',
      'penalty goal': 'penalite',
      'drop goal': 'drop',
      'drop_goal': 'drop',
      'yellow card': 'carton_jaune',
      'red card': 'carton_rouge',
    };
    return map[(type || '').toLowerCase()] || type;
  }
}
