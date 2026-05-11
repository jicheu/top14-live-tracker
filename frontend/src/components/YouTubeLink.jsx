import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext.jsx';

/**
 * Fetches and renders a YouTube summary link for a finished match.
 * Shows a placeholder while the API is being queried.
 */
export default function YouTubeLink({ matchId, isFinished }) {
  const { t } = useLanguage();
  // loading: true while fetching, false when done
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { videoId, title, url } | { videoId: null }

  useEffect(() => {
    if (!isFinished) return;

    let cancelled = false;
    setLoading(true);
    fetch(`/api/matches/${matchId}/youtube`)
      .then(res => {
        if (res.status === 204 || !res.ok) return null;
        return res.json();
      })
      .then(data => {
        if (!cancelled) {
          setResult(data);
          setLoading(false);
        }
      })
      .catch(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [matchId, isFinished]);

  if (!isFinished) return null;

  if (loading) {
    return (
      <span className="youtube-link youtube-link--loading">
        {t.youtube.loading}
      </span>
    );
  }

  // Result received but no video found — render nothing
  if (!result?.videoId) return null;

  return (
    <a
      className="youtube-link"
      href={result.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      title={result.title}
    >
      <svg className="youtube-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/>
      </svg>
      {t.youtube.watchHighlights}
    </a>
  );
}
