import { DataProvider } from './DataProvider.js';

// Équipes du Top 14 2025-2026
const TEAMS = [
  { id: 'mock-tou', name: 'Stade Toulousain', badge_url: 'https://r2.thesportsdb.com/images/media/team/badge/z7pjfg1622926113.png' },
  { id: 'mock-ubb', name: 'Union Bordeaux-Bègles', badge_url: 'https://r2.thesportsdb.com/images/media/team/badge/qiw7sx1536393400.png' },
  { id: 'mock-rct', name: 'RC Toulonnais', badge_url: 'https://r2.thesportsdb.com/images/media/team/badge/c4997c1536393005.png' },
  { id: 'mock-sfp', name: 'Stade Français Paris', badge_url: 'https://r2.thesportsdb.com/images/media/team/badge/lr2v3f1622926121.png' },
  { id: 'mock-lr', name: 'Stade Rochelais', badge_url: 'https://r2.thesportsdb.com/images/media/team/badge/a4yd1y1536393155.png' },
  { id: 'mock-asm', name: 'ASM Clermont Auvergne', badge_url: 'https://r2.thesportsdb.com/images/media/team/badge/qh7djg1622926100.png' },
  { id: 'mock-r92', name: 'Racing 92', badge_url: 'https://r2.thesportsdb.com/images/media/team/badge/ywxugl1536392844.png' },
  { id: 'mock-co', name: 'Castres Olympique', badge_url: 'https://r2.thesportsdb.com/images/media/team/badge/2hzwdf1536392242.png' },
  { id: 'mock-sp', name: 'Section Paloise', badge_url: 'https://r2.thesportsdb.com/images/media/team/badge/zak92e1573136893.png' },
  { id: 'mock-mhr', name: 'Montpellier HR', badge_url: 'https://r2.thesportsdb.com/images/media/team/badge/xbsi1g1536392475.png' },
  { id: 'mock-lou', name: 'Lyon OU', badge_url: 'https://r2.thesportsdb.com/images/media/team/badge/kjljr41536392388.png' },
  { id: 'mock-ab', name: 'Aviron Bayonnais', badge_url: 'https://r2.thesportsdb.com/images/media/team/badge/z0fq591714808782.png' },
  { id: 'mock-usap', name: 'USA Perpignan', badge_url: 'https://r2.thesportsdb.com/images/media/team/badge/9jsg3o1573137449.png' },
  { id: 'mock-usm', name: 'US Montauban', badge_url: 'https://r2.thesportsdb.com/images/media/team/badge/6wog8v1694604440.png' },
];

// Joueurs fictifs par équipe (pour les événements de score)
const PLAYERS = {
  'mock-tou': ['Antoine Dupont', 'Romain Ntamack', 'Thomas Ramos', 'Julien Marchand', 'Emmanuel Meafou'],
  'mock-ubb': ['Matthieu Jalibert', 'Damian Penaud', 'Maxime Lucu', 'Maama Vaipulu', 'Louis Bielle-Biarrey'],
  'mock-rct': ['Baptiste Serin', 'Eben Etzebeth', 'Charles Ollivon', 'Gabin Villière', 'Setariki Tuicuvu'],
  'mock-sfp': ['Louis Carbonel', 'Jonathan Danty', 'Sekou Macalou', 'Tani Vili', 'Samuel Ezeala'],
  'mock-lr': ['Grégory Alldritt', 'Jonathan Danty', 'Dillyn Leyds', 'Will Skelton', 'Oscar Jegou'],
  'mock-asm': ['Alivereti Raka', 'Damian Penaud', 'Camille Lopez', 'Fritz Lee', 'Judicaël Cancoriet'],
  'mock-r92': ['Finn Russell', 'Virimi Vakatawa', 'Camille Chat', 'Ibrahim Diallo', 'Nolann Le Garrec'],
  'mock-co': ['Ben Urdapilleta', 'Antoine Zeghdar', 'Filipo Nakosi', 'Rory Kockott', 'Kevin Kornath'],
  'mock-sp': ['Jack Maddocks', 'Emilien Gailleton', 'Joel Sclavi', 'Tumua Manu', 'Dan Biggar'],
  'mock-mhr': ['Paolo Garbisi', 'Zach Mercer', 'Arthur Vincent', 'Cobus Reinach', 'Yacouba Camara'],
  'mock-lou': ['Léo Berdeu', 'Toby Arnold', 'Thibaut Regard', 'Killian Gerber', 'Dylan Cretin'],
  'mock-ab': ['Joris Segonds', 'Camille Lopez', 'Manuel Leindekar', 'Uzair Cassiem', 'Guillaume Martocq'],
  'mock-usap': ['Melvyn Jaminet', 'Tristan Tedder', 'Mathieu Acebes', 'Posolo Tuilagi', 'Lucas Bachelier'],
  'mock-usm': ['Thomas Darmon', 'Junior Rasolea', 'Benjamin Geledan', 'Yvan Reilhac', 'Joris Moura'],
};

const EVENT_TYPES = ['essai', 'essai', 'essai', 'transformation', 'transformation', 'penalite', 'penalite', 'penalite', 'drop'];
const POINTS = { essai: 5, transformation: 2, penalite: 3, drop: 3 };

/**
 * MockProvider - Simule des matchs en direct avec des données fictives.
 * Génère 4 matchs simultanés et fait évoluer les scores toutes les 30 secondes.
 */
export class MockProvider extends DataProvider {
  constructor() {
    super();
    this.matches = [];
    this.scoreEvents = {}; // matchId -> [events]
    this.initialized = false;
    this.tickCount = 0;
  }

  _initMatches() {
    if (this.initialized) return;

    // Créer 4 matchs "en cours" et 3 matchs "terminés" ou "à venir"
    const shuffled = [...TEAMS].sort(() => Math.random() - 0.5);
    const today = new Date().toISOString().split('T')[0];

    const matchups = [
      { home: shuffled[0], away: shuffled[1], status: '1H', id: 'mock-match-1' },
      { home: shuffled[2], away: shuffled[3], status: '1H', id: 'mock-match-2' },
      { home: shuffled[4], away: shuffled[5], status: '1H', id: 'mock-match-3' },
      { home: shuffled[6], away: shuffled[7], status: '1H', id: 'mock-match-4' },
      { home: shuffled[8], away: shuffled[9], status: 'NS', id: 'mock-match-5' },
      { home: shuffled[10], away: shuffled[11], status: 'FT', id: 'mock-match-6' },
      { home: shuffled[12], away: shuffled[13], status: 'FT', id: 'mock-match-7' },
    ];

    this.matches = matchups.map((m, i) => {
      const match = {
        id: m.id,
        home_team_id: m.home.id,
        away_team_id: m.away.id,
        score_home: m.status === 'FT' ? Math.floor(Math.random() * 30) + 10 : 0,
        score_away: m.status === 'FT' ? Math.floor(Math.random() * 30) + 10 : 0,
        status: m.status,
        round: 23,
        match_date: today,
        match_time: `${14 + i}:00:00`,
        venue: `Stade ${m.home.name}`,
        home_1h: 0,
        away_1h: 0,
        home_2h: 0,
        away_2h: 0,
        updated_at: new Date().toISOString(),
      };
      this.scoreEvents[m.id] = [];
      return match;
    });

    // Remplir les matchs terminés avec des scores de mi-temps
    this.matches.filter(m => m.status === 'FT').forEach(m => {
      m.home_1h = Math.floor(m.score_home * 0.6);
      m.away_1h = Math.floor(m.score_away * 0.4);
      m.home_2h = m.score_home - m.home_1h;
      m.away_2h = m.score_away - m.away_1h;
    });

    this.initialized = true;
    console.log('[MockProvider] 7 matchs simulés créés (4 en cours, 1 à venir, 2 terminés)');
  }

  /**
   * Simule le passage du temps: ajoute aléatoirement des événements de score.
   * Appelé par le poller à chaque tick.
   */
  _tick() {
    this.tickCount++;
    const changes = [];

    for (const match of this.matches) {
      if (match.status === 'FT' || match.status === 'NS') continue;

      // Avancer la mi-temps après 10 ticks (~5 min en mode dev)
      if (this.tickCount % 10 === 0 && match.status === '1H') {
        match.status = 'HT';
        match.home_1h = match.score_home;
        match.away_1h = match.score_away;
        changes.push({ type: 'status', match });
        continue;
      }
      if (this.tickCount % 12 === 0 && match.status === 'HT') {
        match.status = '2H';
        changes.push({ type: 'status', match });
        continue;
      }
      if (this.tickCount % 22 === 0 && match.status === '2H') {
        match.status = 'FT';
        match.home_2h = match.score_home - match.home_1h;
        match.away_2h = match.score_away - match.away_1h;
        changes.push({ type: 'status', match });
        continue;
      }

      // 40% de chance qu'un événement se produise à chaque tick
      if (Math.random() > 0.4) continue;

      const isHome = Math.random() > 0.5;
      const teamId = isHome ? match.home_team_id : match.away_team_id;
      const players = PLAYERS[teamId] || ['Joueur Inconnu'];
      const player = players[Math.floor(Math.random() * players.length)];
      const eventType = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
      const points = POINTS[eventType];
      const half = match.status === '1H' ? 1 : 2;
      const minute = half === 1
        ? Math.floor(Math.random() * 40) + 1
        : Math.floor(Math.random() * 40) + 41;

      // Mettre à jour le score
      if (isHome) {
        match.score_home += points;
        if (half === 1) match.home_1h += points;
        else match.home_2h += points;
      } else {
        match.score_away += points;
        if (half === 1) match.away_1h += points;
        else match.away_2h += points;
      }

      match.updated_at = new Date().toISOString();

      const event = {
        match_id: match.id,
        team_id: teamId,
        player,
        event_type: eventType,
        minute,
        half,
        detail: `${player} - ${eventType} (${points} pts)`,
      };

      this.scoreEvents[match.id].push(event);
      changes.push({ type: 'score', match, event });
    }

    return changes;
  }

  async fetchTeams() {
    return TEAMS;
  }

  async fetchMatches() {
    this._initMatches();
    const changes = this._tick();
    return { matches: this.matches, changes };
  }

  async fetchScoreEvents(matchId) {
    return this.scoreEvents[matchId] || [];
  }
}
