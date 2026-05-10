import React from 'react';
import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function Sidebar({ 
  isOpen, 
  onClose, 
  currentCompetition, 
  onSelectCompetition,
  theme,
  onThemeChange,
  unsupportedCompetitions = new Set(),
}) {
  const { t, lang, setLanguage } = useLanguage();

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
            {Object.entries(t.competitions).map(([id, name]) => {
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
                        {t.ui.comingSoon}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-settings">
          <h3 className="settings-title">{t.ui.settings}</h3>

          <div className="settings-group">
            <label>{t.ui.theme}</label>
            <div className="segmented-control">
              <button 
                className={theme === 'light' ? 'active' : ''} 
                onClick={() => onThemeChange('light')}
              >
                {t.ui.themeLight}
              </button>
              <button 
                className={theme === 'dark' ? 'active' : ''} 
                onClick={() => onThemeChange('dark')}
              >
                {t.ui.themeDark}
              </button>
              <button 
                className={theme === 'auto' ? 'active' : ''} 
                onClick={() => onThemeChange('auto')}
              >
                {t.ui.themeAuto}
              </button>
            </div>
          </div>

          <div className="settings-group">
            <label>{t.ui.language}</label>
            <div className="segmented-control lang-switcher">
              <button
                className={lang === 'fr' ? 'active' : ''}
                onClick={() => setLanguage('fr')}
              >
                FR
              </button>
              <button
                className={lang === 'en' ? 'active' : ''}
                onClick={() => setLanguage('en')}
              >
                EN
              </button>
              <button
                className={lang === 'zh-TW' ? 'active' : ''}
                onClick={() => setLanguage('zh-TW')}
              >
                繁中
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
