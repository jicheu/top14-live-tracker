import { Router } from 'express';
import { getAllMatches, getMatch, getScoreEvents } from '../db/database.js';

const router = Router();

/**
 * GET /api/matches
 * Retourne tous les matchs de la journée en cours.
 */
router.get('/matches', (req, res) => {
  try {
    const matches = getAllMatches();
    res.json({ matches });
  } catch (err) {
    console.error('[Routes] Erreur GET /matches:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/matches/:id
 * Retourne le détail d'un match + ses événements de score.
 */
router.get('/matches/:id', (req, res) => {
  try {
    const match = getMatch(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match non trouvé' });
    }

    const events = getScoreEvents(req.params.id);
    res.json({ match, events });
  } catch (err) {
    console.error('[Routes] Erreur GET /matches/:id:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
