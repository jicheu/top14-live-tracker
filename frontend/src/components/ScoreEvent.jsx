import React from 'react';
import fr from '../i18n/fr.js';

export default function ScoreEvent({ event }) {
  const typeLabel = fr.eventType[event.event_type] || event.event_type;
  const icon = fr.eventIcon[event.event_type] || '•';
  const points = fr.eventPoints[event.event_type];

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
