import React from 'react';
import fr from '../i18n/fr.js';

export default function Sidebar({ 
  isOpen, 
  onClose, 
  currentCompetition, 
  onSelectCompetition,
  theme,
  onThemeChange,
  unsupportedCompetitions = new Set(),
}) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose}></div>}

      {/* Sidebar drawer */}
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Compétitions</h2>
          <button className="sidebar-close" onClick={onClose}>&times;</button>
        </div>
        <nav className="sidebar-nav">
          <ul className="competition-list">
            {Object.entries(fr.competitions).map(([id, name]) => {
              const unsupported = unsupportedCompetitions.has(id);
              return (
                <li key={id} className={`competition-item${unsupported ? ' competition-item--unsupported' : ''}`}>
                  <button
                    className={`competition-btn ${currentCompetition === id ? 'competition-btn--active' : ''} ${unsupported ? 'competition-btn--unsupported' : ''}`}
                    onClick={() => {
                      onSelectCompetition(id);
                      onClose();
                    }}
                  >
                    <span className="competition-btn-name">{name}</span>
                    {unsupported && (
                      <span className="competition-badge competition-badge--soon">
                        {fr.ui.comingSoon}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-settings">
          <h3 className="settings-title">{fr.ui.settings}</h3>
          
          <div className="settings-group">
            <label>{fr.ui.theme}</label>
            <div className="segmented-control">
              <button 
                className={theme === 'light' ? 'active' : ''} 
                onClick={() => onThemeChange('light')}
              >
                {fr.ui.themeLight}
              </button>
              <button 
                className={theme === 'dark' ? 'active' : ''} 
                onClick={() => onThemeChange('dark')}
              >
                {fr.ui.themeDark}
              </button>
              <button 
                className={theme === 'auto' ? 'active' : ''} 
                onClick={() => onThemeChange('auto')}
              >
                {fr.ui.themeAuto}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
