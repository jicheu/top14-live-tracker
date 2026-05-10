import React from 'react';
import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function ViewToggle({ currentView, onToggle }) {
  const { t } = useLanguage();

  return (
    <div className="view-toggle-container">
      <div className="view-toggle">
        <button 
          className={`view-toggle-btn ${currentView === 'live' ? 'active' : ''}`}
          onClick={() => onToggle('live')}
        >
          {t.ui.views.live}
        </button>
        <button 
          className={`view-toggle-btn ${currentView === 'results' ? 'active' : ''}`}
          onClick={() => onToggle('results')}
        >
          {t.ui.views.results}
        </button>
        <button 
          className={`view-toggle-btn ${currentView === 'standings' ? 'active' : ''}`}
          onClick={() => onToggle('standings')}
        >
          {t.ui.views.standings}
        </button>
        <div className={`view-toggle-slider slide-${currentView}`} />
      </div>
    </div>
  );
}
