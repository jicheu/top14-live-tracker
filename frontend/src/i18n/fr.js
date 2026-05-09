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
    venue: 'Stade',
    minute: 'min',
  },
};

export default fr;
