import { useEffect, useState, useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import PixelAvatar from '../components/PixelAvatar.jsx';

// ─── Pixel scene helper ───────────────────────────────────────────────────────

function PixelScene({ pixels, cols, rows, scale = 4 }) {
  const W = cols * scale, H = rows * scale;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ imageRendering:'pixelated', display:'block' }}>
      {pixels.filter(([c,r])=>c>=0&&r>=0&&c<cols&&r<rows).map(([c,r,color,w=1,h=1],i)=>(
        <rect key={i} x={c*scale} y={r*scale} width={w*scale} height={h*scale} fill={color} />
      ))}
    </svg>
  );
}

const SK = '#F4C2A1';

// Professor Oak — overworld sprite style, gray hair, white coat, lavender shirt
const OAK_PIXELS = [
  // Gray hair
  [2,0,'#B8B8B8',8,1],[1,1,'#B8B8B8',10,2],[1,0,'#B8B8B8',1,3],[10,0,'#B8B8B8',1,3],
  [3,0,'#989898',6,1],
  // Face
  [2,2,SK,8,5],
  // Eyebrows (stern/distinguished)
  [3,2,'#808080',3,1],[7,2,'#808080',3,1],
  // Eyes (dark, intelligent)
  [3,3,'#3A2A10',2,2],[7,3,'#3A2A10',2,2],
  [3,4,'#1A0A00',2,1],[7,4,'#1A0A00',2,1],
  // Nose
  [5,5,'#D4A090',2,1],
  // Mouth (slight knowing smile)
  [4,6,'#A07060',5,1],
  // Neck
  [5,7,SK,2,2],
  // Lavender shirt (center visible under coat)
  [4,7,'#B090C8',4,7],
  // White lab coat (sides)
  [1,7,'#F0F0F0',3,9],[9,7,'#F0F0F0',3,9],
  // Coat collar/lapels
  [2,7,'#E0E0E0',2,3],[10,7,'#E0E0E0',2,3],
  // Arms (coat)
  [0,8,'#F0F0F0',1,6],[11,8,'#F0F0F0',1,6],
  // Hands
  [0,13,SK,2,2],[11,13,SK,2,2],
  // Clipboard in left hand
  [0,11,'#D4A800',2,5],[0,12,'#FFFFFF',1,3],[1,12,'#FFFFFF',1,3],
  [0,11,'#C09000',1,1],
  // Pants (dark)
  [2,16,'#404050',4,4],[7,16,'#404050',4,4],
  // Shoes
  [1,20,'#1A1A1A',5,1],[7,20,'#1A1A1A',5,1],
];

// Rival — spiky dark hair, white shirt, dark pants, pointing pose
const RIVAL_PIXELS = [
  // Spiky hair (dark, multiple spikes)
  [3,0,'#1A1A1A',6,1],[2,0,'#1A1A1A',1,2],[9,0,'#1A1A1A',1,2],
  [2,1,'#1A1A1A',8,2],[1,2,'#1A1A1A',1,3],[10,2,'#1A1A1A',1,3],
  // Spiky tips
  [1,0,'#1A1A1A',1,1],[5,0,'#242424',1,1],[8,0,'#1A1A1A',1,2],[10,0,'#1A1A1A',1,1],
  // Face
  [2,2,SK,8,5],
  // Furrowed eyebrows
  [3,2,'#1A1A1A',3,1],[7,2,'#1A1A1A',3,1],
  // Determined eyes
  [3,3,'#2A2A2A',2,2],[7,3,'#2A2A2A',2,2],
  [3,4,'#000000',2,1],[7,4,'#000000',2,1],
  // Smug mouth
  [5,6,'#C08080',3,1],[7,6,'#C08080',1,1],
  // Neck
  [5,7,SK,2,2],
  // White shirt
  [2,7,'#F0F0F0',8,8],
  // Dark vest/jacket open
  [2,7,'#2A2A2A',2,6],[9,7,'#2A2A2A',2,6],
  // Badge/symbol on shirt
  [5,9,'#4A4AE0',2,2],[6,10,'#6060FF',1,1],
  // Left arm — straight down
  [0,8,'#F0F0F0',2,6],[0,13,SK,2,2],
  // Right arm — raised/pointing forward (shorter, angled)
  [10,7,'#F0F0F0',2,4],
  [11,6,SK,2,2],  // hand raised
  // Dark pants
  [2,15,'#1A1A2A',4,5],[7,15,'#1A1A2A',4,5],
  // Shoes (dark, angular)
  [1,20,'#0A0A0A',5,2],[7,20,'#0A0A0A',5,2],
];

// ─── Diamond confetti ─────────────────────────────────────────────────────────

const DIAMOND_COLORS = ['#FFD700','#FF4444','#4488FF','#44CC44','#CC44CC','#FF8800','#FFFFFF','#44FFFF'];

function DiamondConfetti() {
  const diamonds = useMemo(() => Array.from({ length: 35 }, (_, i) => ({
    id: i,
    left: `${((i * 13 + Math.sin(i * 0.9) * 40 + 50) % 100)}%`,
    top:  `${((i * 17 + Math.cos(i * 1.1) * 30 + 20) % 85)}%`,
    color: DIAMOND_COLORS[i % DIAMOND_COLORS.length],
    size: i % 4 === 0 ? 12 : i % 3 === 0 ? 9 : 6,
    delay: `${(i * 0.15) % 2.5}s`,
    duration: `${2 + (i % 4) * 0.5}s`,
  })), []);

  return (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:1 }}>
      {diamonds.map(d => (
        <div key={d.id} style={{
          position:'absolute', left:d.left, top:d.top,
          width:d.size, height:d.size,
          background:d.color,
          transform:'rotate(45deg)',
          animation:`confetti-fall ${d.duration} ${d.delay} infinite`,
        }} />
      ))}
    </div>
  );
}

// ─── Hall of Fame scene (STRONG_PLATFORM) ─────────────────────────────────────

function HallOfFameScene({ players, rationale, onContinue }) {
  return (
    <div style={{
      background:'linear-gradient(180deg,#7080C0 0%,#9098D0 60%,#A8B0E0 100%)',
      width:'100%', height:'100%',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'space-between',
      position:'relative', overflow:'hidden',
      padding:'10px 0 0 0',
    }}>
      <DiamondConfetti />

      {/* Title */}
      <div style={{ zIndex:2, textAlign:'center' }}>
        <div style={{ fontFamily:"'Press Start 2P'",fontSize:9,color:'#FFD700',textShadow:'2px 2px 0 #1A1A4A',lineHeight:1.8 }}>
          ★ CONGRATULATIONS! ★
        </div>
        <div style={{ fontFamily:"'Press Start 2P'",fontSize:6,color:'white',textShadow:'1px 1px 0 #1A1A4A',marginTop:4 }}>
          Your platform has what it takes!
        </div>
      </div>

      {/* Player grid */}
      <div style={{
        zIndex:2, display:'flex', flexWrap:'wrap',
        justifyContent:'center', gap:10, padding:'0 16px', flex:1,
        alignItems:'center', maxWidth:560,
      }}>
        {players.slice(0,6).map(p => (
          <div key={p.id} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
            <div style={{
              background:'rgba(255,255,255,0.25)',
              border:'3px solid rgba(255,255,255,0.8)',
              padding:5, position:'relative',
            }}>
              {/* Corner sparkles */}
              <div style={{ position:'absolute',top:-4,left:-4,color:'#FFD700',fontFamily:'monospace',fontSize:10,lineHeight:1 }}>✦</div>
              <div style={{ position:'absolute',top:-4,right:-4,color:'#FFD700',fontFamily:'monospace',fontSize:10,lineHeight:1 }}>✦</div>
              <PixelAvatar player={p} scale={4} />
            </div>
            <div style={{ fontFamily:"'Press Start 2P'",fontSize:5,color:'white',textShadow:'1px 1px 0 #000' }}>
              {p.name.slice(0,8).toUpperCase()}
            </div>
          </div>
        ))}
      </div>

      {/* Hall of Fame banner */}
      <div style={{ zIndex:2, width:'100%', background:'#0A0A28', borderTop:'4px solid #000010', padding:'10px 0', display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
        <div style={{ fontFamily:"'Press Start 2P'",fontSize:8,color:'white',letterSpacing:1 }}>
          Welcome to the HALL OF FAME!
        </div>
        <button className="pixel-btn primary" style={{ fontSize:8, padding:'8px 20px' }} onClick={onContinue}>
          SEE FULL STRATEGY ▶
        </button>
      </div>
    </div>
  );
}

// ─── Professor Oak scene (CONDITIONAL) ────────────────────────────────────────

function ProfOakScene({ rationale, onContinue }) {
  return (
    <div style={{
      background:'linear-gradient(180deg,#D8D8C8 0%,#E8E8D8 100%)',
      width:'100%', height:'100%',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:20,
    }}>
      <div style={{ display:'flex', alignItems:'flex-end', gap:24, maxWidth:560, width:'100%' }}>
        <div style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
          <PixelScene pixels={OAK_PIXELS} cols={12} rows={21} scale={5} />
          <div style={{ fontFamily:"'Press Start 2P'",fontSize:6,color:'#404040' }}>PROF. OAK</div>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"'Press Start 2P'",fontSize:9,color:'#2A2A2A',marginBottom:14,lineHeight:1.6 }}>
            Prof. Oak<br/>wants to explain!
          </div>
          {/* Dialog box */}
          <div style={{
            background:'#F8F8E8',
            border:'4px solid #2A2A2A',
            padding:'12px 14px',
            marginBottom:12,
            position:'relative',
          }}>
            <div style={{ position:'absolute',top:-2,left:8, fontFamily:"'Press Start 2P'",fontSize:6,background:'#F8F8E8',padding:'0 4px',color:'#2A2A2A' }}>
              OAK:
            </div>
            <div style={{ fontFamily:"'Press Start 2P'",fontSize:7,color:'#2A2A2A',lineHeight:2,marginTop:4 }}>
              {rationale}
            </div>
          </div>
          <button className="pixel-btn primary" style={{ width:'100%',justifyContent:'center' }} onClick={onContinue}>
            SEE FULL ANALYSIS ▶
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Rival scene (NOT_SUITABLE) ───────────────────────────────────────────────

function RivalScene({ rationale, onContinue }) {
  return (
    <div style={{
      background:'linear-gradient(180deg,#C8C8C8 0%,#E0E0E0 100%)',
      width:'100%', height:'100%',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:20,
    }}>
      <div style={{ display:'flex', alignItems:'flex-end', gap:24, maxWidth:560, width:'100%' }}>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"'Press Start 2P'",fontSize:9,color:'#C03030',marginBottom:14,lineHeight:1.6 }}>
            ...!<br/>Your RIVAL<br/>blocked the way!
          </div>
          <div style={{
            background:'#F0F0F0',
            border:'4px solid #2A2A2A',
            padding:'12px 14px',
            marginBottom:12,
            position:'relative',
          }}>
            <div style={{ position:'absolute',top:-2,left:8, fontFamily:"'Press Start 2P'",fontSize:6,background:'#F0F0F0',padding:'0 4px',color:'#2A2A2A' }}>
              RIVAL:
            </div>
            <div style={{ fontFamily:"'Press Start 2P'",fontSize:7,color:'#2A2A2A',lineHeight:2,marginTop:4 }}>
              {rationale}
            </div>
          </div>
          <div style={{ fontFamily:"'Press Start 2P'",fontSize:6,color:'#606060',lineHeight:2,marginBottom:10 }}>
            Even great trainers regroup and try again.
          </div>
          <button className="pixel-btn" style={{ width:'100%',justifyContent:'center' }} onClick={onContinue}>
            SEE FULL ANALYSIS ▶
          </button>
        </div>
        <div style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
          <PixelScene pixels={RIVAL_PIXELS} cols={12} rows={22} scale={5} />
          <div style={{ fontFamily:"'Press Start 2P'",fontSize:6,color:'#404040' }}>RIVAL</div>
        </div>
      </div>
    </div>
  );
}

// ─── Strategy metadata ────────────────────────────────────────────────────────

const REC_META = {
  STRONG_PLATFORM: { label:'STRONG PLATFORM OPPORTUNITY', cls:'strong',      icon:'★' },
  CONDITIONAL:     { label:'CONDITIONAL PLATFORM',        cls:'conditional',  icon:'◆' },
  NOT_SUITABLE:    { label:'NOT SUITABLE AS PLATFORM',    cls:'not-suitable', icon:'✕' },
};

const MKT_META = {
  WINNER_TAKE_ALL:  { label:'WINNER-TAKE-ALL',  bg:'var(--gb-darkest)', implication:'COMPETE' },
  WINNER_TAKE_MOST: { label:'WINNER-TAKE-MOST', bg:'var(--gb-dark)',    implication:'COMPETE' },
  WINNER_TAKE_SOME: { label:'WINNER-TAKE-SOME', bg:'#8A6000',           implication:'COLLABORATE' },
  NO_WINNER:        { label:'NO-WINNER MARKET', bg:'var(--gb-red)',     implication:'COLLABORATE' },
  FRAGMENTED:       { label:'FRAGMENTED',       bg:'var(--gb-dark)',    implication:'COLLABORATE' },
};

function Section({ title, children }) {
  return (
    <div className="strategy-section">
      <div className="strategy-section-title">{title}</div>
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Step5Strategy() {
  const { business, players, dynamics, interviewHistory, strategy, setStrategy, setCurrentStep } = useApp();

  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [showOutcome, setShowOutcome] = useState(true);

  useEffect(() => { if (!strategy) generate(); }, []);

  async function generate() {
    setLoading(true);
    setError('');
    setStrategy(null);
    try {
      const res = await fetch('/api/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business, players, dynamics, interviewHistory }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStrategy(data.strategy);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Outcome cinematic ─────────────────────────────────────────────────────

  if (showOutcome) {
    if (loading || !strategy) {
      return (
        <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100%',flexDirection:'column',gap:20,background:'var(--gb-screen)' }}>
          <div className="pixel-loading">
            ANALYZING<div className="pixel-loading-dots"><span /><span /><span /></div>
          </div>
          <div style={{ fontFamily:"'Press Start 2P'",fontSize:7,color:'var(--gb-dark)',textAlign:'center',lineHeight:2 }}>
            Consulting the platform oracle...<br />Running strategy engine...
          </div>
        </div>
      );
    }
    if (error) {
      return (
        <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100%',flexDirection:'column',gap:16,padding:20,background:'var(--gb-screen)' }}>
          <div style={{ fontFamily:"'Press Start 2P'",fontSize:8,color:'var(--gb-red)' }}>ERROR</div>
          <div style={{ fontFamily:"'Press Start 2P'",fontSize:7,color:'var(--gb-dark)',textAlign:'center' }}>{error}</div>
          <button className="pixel-btn" onClick={generate}>↺ RETRY</button>
          <button className="pixel-btn sm" onClick={() => setCurrentStep(4)}>◀ BACK</button>
        </div>
      );
    }

    const rec = strategy?.recommendation;
    const rationale = strategy?.rationale || '';

    if (rec === 'STRONG_PLATFORM') return (
      <div style={{ position:'relative',height:'100%',overflow:'hidden' }}>
        <HallOfFameScene players={players} rationale={rationale} onContinue={() => setShowOutcome(false)} />
      </div>
    );
    if (rec === 'CONDITIONAL') return (
      <div style={{ position:'relative',height:'100%',overflow:'hidden' }}>
        <ProfOakScene rationale={rationale} onContinue={() => setShowOutcome(false)} />
      </div>
    );
    return (
      <div style={{ position:'relative',height:'100%',overflow:'hidden' }}>
        <RivalScene rationale={rationale} onContinue={() => setShowOutcome(false)} />
      </div>
    );
  }

  // ── Full strategy breakdown ───────────────────────────────────────────────

  return (
    <div style={{ display:'flex', height:'100%', overflow:'hidden' }}>
      <div className="scroll-area" style={{ flex:1, padding:16, background:'var(--gb-screen)' }}>
        <div className="section-title">STRATEGY ANALYSIS</div>

        {strategy && (() => {
          const rec = REC_META[strategy.recommendation] || REC_META.CONDITIONAL;
          const mkt = MKT_META[strategy.marketStructure?.type] || MKT_META.FRAGMENTED;
          return (
            <>
              <div style={{ textAlign:'center', marginBottom:16 }}>
                <div className={`rec-badge ${rec.cls}`}>{rec.icon} {rec.label}</div>
                <p className="strategy-text" style={{ marginTop:10, lineHeight:2 }}>{strategy.rationale}</p>
              </div>
              <div className="pixel-divider" />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <Section title="KEY INSIGHTS">
                  <ul className="strategy-list">
                    {(strategy.keyInsights||[]).map((s,i)=><li key={i}>{s}</li>)}
                  </ul>
                </Section>
                <Section title="MONETIZATION">
                  {strategy.monetization?.charge && (
                    <div style={{ marginBottom:10 }}>
                      <div style={{ fontFamily:"'Press Start 2P'",fontSize:6,color:'var(--gb-red)',marginBottom:4 }}>▲ CHARGE:</div>
                      <p className="strategy-text"><strong>{strategy.monetization.charge.side}</strong> — {strategy.monetization.charge.reason}</p>
                    </div>
                  )}
                  {strategy.monetization?.subsidize && (
                    <div>
                      <div style={{ fontFamily:"'Press Start 2P'",fontSize:6,color:'var(--gb-dark)',marginBottom:4 }}>▼ SUBSIDIZE:</div>
                      <p className="strategy-text"><strong>{strategy.monetization.subsidize.side}</strong> — {strategy.monetization.subsidize.reason}</p>
                    </div>
                  )}
                </Section>
                <Section title="MARKET STRUCTURE">
                  <div style={{ marginBottom:8, display:'flex', flexDirection:'column', gap:4 }}>
                    <span style={{ fontFamily:"'Press Start 2P'",fontSize:7,background:mkt.bg,color:'var(--gb-lightest)',border:'3px solid var(--gb-darkest)',padding:'4px 8px',display:'inline-block' }}>
                      {mkt.label}
                    </span>
                    <span style={{ fontFamily:"'Press Start 2P'",fontSize:5,background:mkt.implication==='COMPETE'?'#8A1A1A':'#1A5A1A',color:'var(--gb-lightest)',border:'3px solid var(--gb-darkest)',padding:'3px 6px',display:'inline-block' }}>
                      → {mkt.implication}: {mkt.implication==='COMPETE'?'invest in growth & lock-in':'partnerships & bundling'}
                    </span>
                  </div>
                  <p className="strategy-text">{strategy.marketStructure?.explanation}</p>
                </Section>
                <Section title="COLD START">
                  <ul className="strategy-list">
                    {(strategy.coldStart||[]).map((s,i)=><li key={i}>{s}</li>)}
                  </ul>
                </Section>
              </div>
              <Section title="KEY RISKS">
                <ul className="strategy-list" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px 16px' }}>
                  {(strategy.risks||[]).map((s,i)=>(
                    <li key={i} style={{ color:'var(--gb-red)' }}>{s}</li>
                  ))}
                </ul>
              </Section>
            </>
          );
        })()}
      </div>

      <div style={{ width:140,borderLeft:'4px solid var(--gb-darkest)',padding:12,background:'var(--gb-darkest)',display:'flex',flexDirection:'column',justifyContent:'flex-end',gap:8,flexShrink:0 }}>
        <button className="pixel-btn" style={{ width:'100%',justifyContent:'center',fontSize:7 }} onClick={() => setShowOutcome(true)}>↺ CINEMATIC</button>
        <button className="pixel-btn" style={{ width:'100%',justifyContent:'center',fontSize:7 }} onClick={() => setCurrentStep(4)}>◀ BACK</button>
        <button className="pixel-btn" style={{ width:'100%',justifyContent:'center',fontSize:7 }} onClick={generate}>↺ REGEN</button>
        <button className="pixel-btn danger" style={{ width:'100%',justifyContent:'center',fontSize:7 }} onClick={() => { if(confirm('New simulation? All data resets.')) window.location.reload(); }}>NEW SIM</button>
      </div>
    </div>
  );
}
