import React from 'react';
import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function ScoreEvent({ event }) {
  const { t } = useLanguage();
  const typeLabel = t.eventType[event.event_type] || event.event_type;
  const icon = t.eventIcon[event.event_type] || '•';
  const points = t.eventPoints[event.event_type];

  return (
    <div className="score-event">
      <div className="event-minute">
        {event.minute}'
      </div>
      <div className="event-icon">{icon}</div>
      <div className="event-details">
        <span className="event-type">{typeLabel}</span>
        {points && <span className="event-points">+{points} pts</span>}
        <span className="event-player">{event.player}</span>
        <span className="event-team">{event.team_name}</span>
      </div>
    </div>
  );
}
