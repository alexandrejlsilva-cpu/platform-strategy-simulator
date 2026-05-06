import { useApp } from '../context/AppContext.jsx';
import PixelAvatar from './PixelAvatar.jsx';

const MOOD_ICONS = { neutral: '😐', skeptical: '😒', optimistic: '🙂' };

export function getPlayerColor(player) {
  const COLORS = ['#306230','#C03040','#8B6914','#1A4A8A','#6A2A6A','#2A6A5A','#8A3A00','#0F380F'];
  let hash = 0;
  for (let i = 0; i < player.name.length; i++) hash = player.name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function PlayerCard({ player, selected, onClick, showRemove = false }) {
  const { removePlayer, playerMoods } = useApp();
  const mood = playerMoods[player.id] || player.mood || 'neutral';

  return (
    <div
      className={`player-card${selected ? ' selected' : ''}`}
      onClick={onClick}
    >
      <PixelAvatar player={player} scale={3} />
      <div className="player-info">
        <div className="player-name">{player.name}</div>
        <div className="player-role">{player.role}</div>
      </div>
      <span className="mood-badge" title={mood}>{MOOD_ICONS[mood]}</span>
      {showRemove && (
        <button
          className="remove-btn"
          onClick={e => { e.stopPropagation(); removePlayer(player.id); }}
          title="Remove player"
        >✕</button>
      )}
    </div>
  );
}
