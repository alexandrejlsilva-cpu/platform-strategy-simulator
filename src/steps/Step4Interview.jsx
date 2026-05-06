import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import PixelAvatar from '../components/PixelAvatar.jsx';
import DialogBox from '../components/DialogBox.jsx';

function hpClass(v) { return v > 66 ? 'high' : v > 33 ? 'mid' : 'low'; }

function detectMood(text) {
  const t = text.toLowerCase();
  const bad  = ["won't", "can't", "hesitat", "concern", "doubt", "risk", "unless", "problem", "issue", "not sure", "struggle"];
  const good = ['would consider', 'interested', 'could work', 'promising', 'benefit', 'value', 'definitely', 'love', 'great'];
  const s = bad.filter(w => t.includes(w)).length;
  const o = good.filter(w => t.includes(w)).length;
  return s > o ? 'skeptical' : o > s ? 'optimistic' : 'neutral';
}

const DEMAND_MOVES = [
  { label: 'WHY JOIN?',   text: 'Why would you consider joining this platform?',                                         color: '#4A90E0' },
  { label: 'WILL U PAY?', text: 'What would make you willing to pay for access to this platform?',                      color: '#E0B800' },
  { label: 'CONCERNS?',   text: 'What are your biggest concerns or hesitations about joining?',                          color: '#E04040' },
  { label: 'WHO ELSE?',   text: 'Would you use a competing platform or bypass it and transact directly instead?',        color: '#40A840' },
];

const SUPPLY_MOVES = [
  { label: 'WHY SUPPLY?',  text: 'What would motivate you to offer your services or products through this platform?',   color: '#4A90E0' },
  { label: 'EXCLUSIVE?',   text: 'Would you commit exclusively to this platform, or multi-home across competitors?',     color: '#E0B800' },
  { label: 'COLD START?',  text: 'Would you join now, before there are many users on the demand side?',                 color: '#E04040' },
  { label: 'BYPASS?',      text: 'Would you consider transacting directly with customers, bypassing this platform?',     color: '#40A840' },
];

const INVESTOR_MOVES = [
  { label: 'WTA?',         text: 'How strong do you think the winner-take-all dynamics are in this market?',            color: '#4A90E0' },
  { label: 'COLD START?',  text: 'What cold start risks concern you most about this platform?',                          color: '#E0B800' },
  { label: 'DEFENSIBLE?',  text: 'What would make you confident this platform can defend its position long-term?',       color: '#E04040' },
  { label: 'INVEST?',      text: 'At what stage and valuation would you consider investing in this platform?',           color: '#40A840' },
];

const ADVERTISER_MOVES = [
  { label: 'REACH?',       text: 'What audience reach would make this platform attractive for advertising?',             color: '#4A90E0' },
  { label: 'TARGETING?',   text: 'What user data or targeting capabilities would you need to run campaigns here?',       color: '#E0B800' },
  { label: 'VS RIVALS?',   text: 'How does this compare to platforms you currently advertise on?',                       color: '#E04040' },
  { label: 'ROI?',         text: 'What return on ad spend would justify allocating budget to this platform?',            color: '#40A840' },
];

function getPlayerMoves(player) {
  if (!player) return DEMAND_MOVES;
  const txt = `${player.name} ${player.role} ${player.supply} ${player.demand}`.toLowerCase();
  if (/investor|venture|vc|capital|fund|angel|backer/.test(txt)) return INVESTOR_MOVES;
  if (/advertis|brand|sponsor|media buyer|marketing/.test(txt)) return ADVERTISER_MOVES;
  if (/driver|chef|cook|seller|creator|developer|provider|host|freelancer|vendor|restaurant|supplier|manufacturer|writer|artist|musician|photographer|tutor|trainer|contractor|consultant|builder|maker/.test(txt)) return SUPPLY_MOVES;
  return DEMAND_MOVES;
}

export default function Step4Interview() {
  const { players, business, dynamics, interviewHistory, addMessage, setPlayerMood, setCurrentStep } = useApp();

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [menuState, setMenuState]   = useState(null);
  const [inputText, setInputText]   = useState('');
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [dialogText, setDialogText] = useState('');
  const [error, setError] = useState('');
  const [interest, setInterest] = useState({});

  const logRef = useRef(null);
  const selectedPlayer = players[selectedIdx] ?? players[0];
  const history = selectedPlayer ? (interviewHistory[selectedPlayer.id] || []) : [];
  const playerInterest = selectedPlayer ? (interest[selectedPlayer.id] ?? 50) : 50;
  const MOVES = getPlayerMoves(selectedPlayer);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [history, streamingText]);

  function bumpInterest(playerId, mood) {
    setInterest(prev => {
      const cur = prev[playerId] ?? 50;
      const d = mood === 'optimistic' ? 15 : mood === 'skeptical' ? -15 : -3;
      return { ...prev, [playerId]: Math.max(5, Math.min(100, cur + d)) };
    });
  }

  async function sendQuestion(q) {
    if (!q?.trim() || !selectedPlayer || isStreaming) return;
    const userMsg = { role: 'user', content: q.trim() };
    addMessage(selectedPlayer.id, userMsg);
    setMenuState(null);
    setInputText('');
    setStreamingText('');
    setDialogText('');
    setIsStreaming(true);
    setError('');

    const msgs = [...history, userMsg];
    let full = '';
    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player: selectedPlayer, business, dynamics, history: msgs }),
      });
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of dec.decode(value).split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6);
          if (raw === '[DONE]') break;
          try {
            const p = JSON.parse(raw);
            if (p.error) { setError(p.error); break; }
            if (p.text) { full += p.text; setStreamingText(full); }
          } catch (_) {}
        }
      }
      if (full) {
        addMessage(selectedPlayer.id, { role: 'assistant', content: full });
        const mood = detectMood(full);
        setPlayerMood(selectedPlayer.id, mood);
        bumpInterest(selectedPlayer.id, mood);
        setDialogText(full);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setStreamingText('');
      setIsStreaming(false);
    }
  }

  if (!selectedPlayer) {
    return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100%',fontFamily:"'Press Start 2P'",fontSize:8,color:'var(--gb-dark)' }}>NO PLAYERS — GO BACK TO STEP 2</div>;
  }

  const liveText = isStreaming ? streamingText : dialogText;

  return (
    <div className="battle-screen">

      {/* ── BATTLE FIELD ── */}
      <div className="battle-field">
        <div className="battle-top">
          <div className="battle-status-box">
            <div className="battle-name">{selectedPlayer.name.toUpperCase().slice(0,12)}</div>
            <div className="battle-level">Lv.{Math.min(9, history.filter(h=>h.role==='user').length + 1)}</div>
            <div className="hp-bar-label">HP  INTEREST</div>
            <div className="hp-bar-track">
              <div className={`hp-bar-fill ${hpClass(playerInterest)}`} style={{ width:`${playerInterest}%` }} />
            </div>
            <div className="hp-bar-number">{playerInterest}/100</div>
          </div>
          <div className="battle-sprite-opp">
            <PixelAvatar player={selectedPlayer} scale={5} />
          </div>
        </div>

        <div className="battle-bottom">
          <div className="battle-sprite-player">
            <PixelAvatar player={null} scale={4} showBack />
          </div>
          <div className="battle-status-box">
            <div className="battle-name">RESEARCHER</div>
            <div className="hp-bar-label">HP  CONFIDENCE</div>
            <div className="hp-bar-track">
              <div className="hp-bar-fill high" style={{ width:'80%' }} />
            </div>
            <div className="hp-bar-number">80/100</div>
          </div>
        </div>
      </div>

      {/* ── DIALOG BOX ── */}
      <div className="battle-dialog-area">
        {error ? (
          <div style={{ fontFamily:"'Press Start 2P'",fontSize:7,color:'var(--gb-red)' }}>ERROR: {error}</div>
        ) : liveText ? (
          <DialogBox speaker={selectedPlayer.name.toUpperCase()} text={liveText} isStreaming={isStreaming} />
        ) : (
          <div className="dialog-text" style={{ color:'var(--gb-dark)' }}>
            {history.length === 0
              ? `A wild ${selectedPlayer.name.toUpperCase()} appeared!`
              : 'Choose your next move...'}
          </div>
        )}
      </div>

      {/* ── LOG + MENU ── */}
      <div className="battle-bottom-area">

        <div className="battle-log scroll-area" ref={logRef}>
          {history.length === 0
            ? <div style={{ color:'var(--gb-dark)' }}>Press FIGHT to begin the interview!</div>
            : history.map((msg, i) => (
              <div key={i} className={`battle-log-entry ${msg.role==='user'?'user-q':'ai-a'}`}>
                {msg.role === 'user'
                  ? `▶ YOU: ${msg.content.slice(0,70)}${msg.content.length>70?'…':''}`
                  : `${selectedPlayer.name.slice(0,8).toUpperCase()}: ${msg.content.slice(0,90)}${msg.content.length>90?'…':''}`
                }
              </div>
            ))
          }
          {isStreaming && <div className="battle-log-entry" style={{ color:'var(--gb-dark)' }}>...</div>}
        </div>

        <div className="battle-menu">

          {menuState === null && (
            <div className="battle-menu-grid">
              <button className="battle-menu-btn" onClick={() => setMenuState('fight')} disabled={isStreaming}>⚔ FIGHT</button>
              <button className="battle-menu-btn" onClick={() => setMenuState('profile')}>📋 PROFILE</button>
              <button className="battle-menu-btn" onClick={() => setMenuState('custom')} disabled={isStreaming}>✏ CUSTOM</button>
              <button className="battle-menu-btn" onClick={() => setCurrentStep(4)} style={{ color:'var(--gb-red)', fontWeight:'bold' }}>▶ DYNAMICS</button>
            </div>
          )}

          {menuState === 'fight' && (
            <div className="battle-moves-panel">
              {MOVES.map((m, i) => (
                <button key={i} className="battle-move-btn" onClick={() => sendQuestion(m.text)} disabled={isStreaming}>
                  <span style={{ display:'inline-block', width:8, height:8, background:m.color, border:'2px solid var(--gb-darkest)', flexShrink:0 }} />
                  {m.label}
                </button>
              ))}
              <button className="battle-move-btn" onClick={() => setMenuState(null)} style={{ borderTop:'3px solid var(--gb-darkest)', color:'var(--gb-dark)' }}>← BACK</button>
            </div>
          )}

          {menuState === 'custom' && (
            <div className="battle-custom-panel">
              <input
                className="pixel-input"
                style={{ flex:1, fontSize:7 }}
                placeholder={`Ask ${selectedPlayer.name}...`}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') sendQuestion(inputText); }}
                autoFocus
                disabled={isStreaming}
              />
              <div style={{ display:'flex', gap:6 }}>
                <button className="pixel-btn sm" onClick={() => setMenuState(null)}>← BACK</button>
                <button className="pixel-btn primary sm" style={{ flex:1 }} onClick={() => sendQuestion(inputText)} disabled={isStreaming || !inputText.trim()}>
                  {isStreaming ? '...' : 'ASK ▶'}
                </button>
              </div>
            </div>
          )}

          {menuState === 'profile' && (
            <div className="battle-custom-panel scroll-area">
              <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6 }}>
                <PixelAvatar player={selectedPlayer} scale={3} />
                <div>
                  <div style={{ fontFamily:"'Press Start 2P'",fontSize:7,color:'var(--gb-darkest)' }}>{selectedPlayer.name}</div>
                  <div style={{ fontFamily:"'Press Start 2P'",fontSize:5,color:'var(--gb-dark)',marginTop:2 }}>{selectedPlayer.role}</div>
                </div>
              </div>
              {[['SUPPLIES', selectedPlayer.supply],['WANTS', selectedPlayer.demand],['GOAL', selectedPlayer.goal],['DEP.', `${selectedPlayer.dependency}/10`]].map(([k,v]) => v && (
                <div key={k} style={{ marginBottom:5 }}>
                  <div style={{ fontFamily:"'Press Start 2P'",fontSize:5,color:'var(--gb-dark)' }}>{k}:</div>
                  <div style={{ fontFamily:"'Press Start 2P'",fontSize:6,color:'var(--gb-darkest)',lineHeight:1.6 }}>{v}</div>
                </div>
              ))}
              <button className="pixel-btn sm" onClick={() => setMenuState(null)} style={{ width:'100%',justifyContent:'center',marginTop:4 }}>← BACK</button>
            </div>
          )}

        </div>
      </div>

      {/* Player tabs */}
      <div className="battle-player-select">
        {players.map((p, i) => (
          <button
            key={p.id}
            className={`battle-player-tab${i === selectedIdx ? ' active' : ''}`}
            onClick={() => { setSelectedIdx(i); setMenuState(null); setDialogText(''); setError(''); }}
          >
            {p.name.toUpperCase().slice(0, 8)}
          </button>
        ))}
        <div style={{ flex:1 }} />
        <button className="battle-player-tab" style={{ color:'var(--gb-lightest)', background:'var(--gb-dark)' }} onClick={() => setCurrentStep(2)}>◀ BACK</button>
      </div>

    </div>
  );
}
