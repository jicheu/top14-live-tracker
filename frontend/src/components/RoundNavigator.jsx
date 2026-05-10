import React from 'react';
import fr from '../i18n/fr.js';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' });
}

/**
 * Navigation bar for both round-based (Top14) and date-based (ESPN) competitions.
 *
 * Props:
 *   mode            – 'round' (default) | 'date'
 *   currentRound    – selected round number (round mode)
 *   availableRounds – sorted array of round numbers (round mode)
 *   onRoundChange   – callback(round) (round mode)
 *   currentDate     – selected date string YYYY-MM-DD (date mode)
 *   availableDates  – sorted array of date strings (date mode)
 *   onDateChange    – callback(date) (date mode)
 */
export default function RoundNavigator({
  mode = 'round',
  currentRound,
  availableRounds,
  onRoundChange,
  currentDate,
  availableDates,
  onDateChange,
}) {
  if (mode === 'date') {
    const dates = availableDates || [];
    if (dates.length === 0 || !currentDate) return null;

    const idx = dates.indexOf(currentDate);
    const canGoPrev = idx > 0;
    const canGoNext = idx < dates.length - 1;

    return (
      <div className="round-navigator">
        <button
          className="round-nav-btn"
          onClick={() => canGoPrev && onDateChange(dates[idx - 1])}
          disabled={!canGoPrev}
          aria-label="Jour précédent"
        >
          &larr;
        </button>
        <div className="round-display">
          <span className="round-number date-label">{formatDate(currentDate)}</span>
        </div>
        <button
          className="round-nav-btn"
          onClick={() => canGoNext && onDateChange(dates[idx + 1])}
          disabled={!canGoNext}
          aria-label="Jour suivant"
        >
          &rarr;
        </button>
      </div>
    );
  }

  // Round mode (default)
  const rounds = availableRounds || [];
  if (rounds.length === 0 || !currentRound) return null;

  const currentIndex = rounds.indexOf(currentRound);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < rounds.length - 1;

  return (
    <div className="round-navigator">
      <button
        className="round-nav-btn"
        onClick={() => canGoPrev && onRoundChange(rounds[currentIndex - 1])}
        disabled={!canGoPrev}
        aria-label="Round précédent"
      >
        &larr;
      </button>
      <div className="round-display">
        <span className="round-label">{fr.ui.round}</span>
        <span className="round-number">{currentRound}</span>
      </div>
      <button
        className="round-nav-btn"
        onClick={() => canGoNext && onRoundChange(rounds[currentIndex + 1])}
        disabled={!canGoNext}
        aria-label="Round suivant"
      >
        &rarr;
      </button>
    </div>
  );
}
