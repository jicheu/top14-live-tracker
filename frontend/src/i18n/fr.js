/**
 * Traductions françaises pour l'interface.
 */
const fr = {
  // Statuts de match
  status: {
    NS: 'À venir',
    '1H': '1re mi-temps',
    HT: 'Mi-temps',
    '2H': '2e mi-temps',
    FT: 'Terminé',
    PST: 'Reporté',
    CANC: 'Annulé',
  },

  // Types d'événements de score
  eventType: {
    essai: 'Essai',
    transformation: 'Transformation',
    penalite: 'Pénalité',
    drop: 'Drop',
    carton_jaune: 'Carton jaune',
    carton_rouge: 'Carton rouge',
  },

  // Points par type d'événement
  eventPoints: {
    essai: 5,
    transformation: 2,
    penalite: 3,
    drop: 3,
  },

  // Icônes par type d'événement
  eventIcon: {
    essai: '🏉',
    transformation: '🎯',
    penalite: '🥅',
    drop: '💧',
    carton_jaune: '🟨',
    carton_rouge: '🟥',
  },

  // Labels UI
  ui: {
    title: 'Top 14 — Scores en direct',
    subtitle: 'Championnat de France de Rugby',
    round: 'Journée',
    roundShort: 'J',
    liveNow: 'En direct',
    noLiveMatches: 'Aucun match en direct pour le moment',
    allMatches: 'Tous les matchs',
    matchDetail: 'Détail du match',
    scoreTimeline: 'Chronologie des scores',
    noEvents: 'Aucun événement enregistré',
    close: 'Fermer',
    halfTime: 'Mi-temps',
    firstHalf: '1re MT',
    secondHalf: '2e MT',
    connecting: 'Connexion au serveur...',
    connected: 'Connecté',
    disconnected: 'Déconnecté',
    views: {
      live: 'En direct',
      results: 'Résultats',
      standings: 'Classement'
    },
    venue: 'Stade',
    minute: 'min',
    menu: 'Menu',
    toggleTheme: 'Changer le thème',
    settings: 'Paramètres',
    theme: 'Apparence',
    themeLight: 'Clair',
    themeDark: 'Sombre',
    themeAuto: 'Auto',
    comingSoon: 'Bientôt disponible',
    comingSoonDetail: 'Les données pour cette compétition ne sont pas encore disponibles.',
  },

  // Liste des compétitions
  competitions: {
    top14: 'Top 14',
    prod2: 'Pro D2',
    premiership: 'Premiership Rugby',
    urc: 'United Rugby Championship',
    super_rugby: 'Super Rugby Pacific',
    mlr: 'Major League Rugby',
    english_championship: 'English Championship',
    irish_championship: 'Irish Championship',
    six_nations_male: '6 Nations (H)',
    six_nations_female: '6 Nations (F)',
    rugby_championship: 'The Rugby Championship',
    european_championship: 'European Championship',
    champions_cup: 'Champions Cup',
    challenge_cup: 'Challenge Cup',
  },
};

export default fr;
