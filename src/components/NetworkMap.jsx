import { getPlayerColor } from './PlayerCard.jsx';

export default function NetworkMap({ players, selectedId, onSelect }) {
  if (!players.length) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--gb-dark)', fontFamily: "'Press Start 2P'", fontSize: 8, textAlign: 'center', padding: 16 }}>
      ADD PLAYERS<br />TO SEE MAP
    </div>
  );

  const W = 320, H = 280;
  const cx = W / 2, cy = H / 2;
  const r = players.length === 1 ? 0 : Math.min(cx, cy) - 50;

  const positions = players.map((p, i) => {
    const angle = (i / players.length) * 2 * Math.PI - Math.PI / 2;
    return { ...p, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height="100%"
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Connection lines */}
      {positions.flatMap((a, i) =>
        positions.slice(i + 1).map((b, j) => {
          const strength = ((a.dependency || 5) + (b.dependency || 5)) / 20;
          return (
            <line
              key={`${i}-${j}`}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke="var(--gb-dark)"
              strokeWidth={1 + strength * 3}
              strokeDasharray="4 4"
              opacity={0.5 + strength * 0.4}
            />
          );
        })
      )}

      {/* Player nodes */}
      {positions.map(p => {
        const color = getPlayerColor(p);
        const isSel = p.id === selectedId;
        return (
          <g key={p.id} onClick={() => onSelect(p)} style={{ cursor: 'pointer' }}>
            {isSel && (
              <rect
                x={p.x - 24} y={p.y - 24}
                width={48} height={48}
                fill="none"
                stroke="var(--gb-lightest)"
                strokeWidth={3}
              />
            )}
            <rect
              x={p.x - 18} y={p.y - 18}
              width={36} height={36}
              fill={color}
              stroke="var(--gb-darkest)"
              strokeWidth={3}
            />
            <text
              x={p.x} y={p.y + 5}
              textAnchor="middle"
              fontSize={14}
              fontFamily="'Press Start 2P'"
              fill="white"
              style={{ pointerEvents: 'none', textShadow: '1px 1px 0 black' }}
            >
              {p.name.charAt(0).toUpperCase()}
            </text>
            <text
              x={p.x} y={p.y + 32}
              textAnchor="middle"
              fontSize={6}
              fontFamily="'Press Start 2P'"
              fill="var(--gb-darkest)"
              style={{ pointerEvents: 'none' }}
            >
              {p.name.toUpperCase().slice(0, 8)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
