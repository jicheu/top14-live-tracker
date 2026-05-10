import React from 'react';
import fr from '../i18n/fr.js';

export default function ViewToggle({ currentView, onToggle }) {
  return (
    <div className="view-toggle-container">
      <div className="view-toggle">
        <button 
          className={`view-toggle-btn ${currentView === 'live' ? 'active' : ''}`}
          onClick={() => onToggle('live')}
        >
          {fr.ui.views.live}
        </button>
        <button 
          className={`view-toggle-btn ${currentView === 'results' ? 'active' : ''}`}
          onClick={() => onToggle('results')}
        >
          {fr.ui.views.results}
        </button>
        <button 
          className={`view-toggle-btn ${currentView === 'standings' ? 'active' : ''}`}
          onClick={() => onToggle('standings')}
        >
          {fr.ui.views.standings}
        </button>
        <div className={`view-toggle-slider slide-${currentView}`} />
      </div>
    </div>
  );
}
