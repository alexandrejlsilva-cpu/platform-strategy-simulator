import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import PixelAvatar, { detectArchetype } from '../components/PixelAvatar.jsx';
import NetworkMap from '../components/NetworkMap.jsx';

const GOALS = ['PROFIT', 'GROWTH', 'CONVENIENCE', 'ACCESS', 'OTHER'];
const BLANK = { name: '', role: '', supply: '', demand: '', goal: 'PROFIT', dependency: 5 };

export default function Step2Players() {
  const { players, addPlayer, removePlayer, business, setCurrentStep } = useApp();
  const [form, setForm] = useState(BLANK);
  const [selectedId, setSelectedId] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loadingSugg, setLoadingSugg] = useState(false);
  const [suggError, setSuggError] = useState('');
  const [loaded, setLoaded] = useState(false);

  function setF(key, val) { setForm(f => ({ ...f, [key]: val })); }

  useEffect(() => {
    if (business.description.trim() && !loaded) fetchSuggestions();
  }, []);

  async function fetchSuggestions() {
    setLoadingSugg(true);
    setSuggError('');
    try {
      const res = await fetch('/api/suggest-players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAiSuggestions(data.players || []);
      setLoaded(true);
    } catch (e) {
      setSuggError(e.message);
    } finally {
      setLoadingSugg(false);
    }
  }

  function applyTemplate(t) {
    setForm({ ...BLANK, ...t, goal: GOALS.includes(t.goal) ? t.goal : 'PROFIT' });
  }

  function handleAdd() {
    if (!form.name.trim() || !form.role.trim()) return;
    addPlayer({ ...form });
    setForm(BLANK);
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

      {/* Left panel: form */}
      <div className="scroll-area" style={{ width: 310, borderRight: '4px solid var(--gb-darkest)', padding: 12, background: 'var(--gb-light)', flexShrink: 0 }}>
        <div className="section-title">BUILD YOUR TEAM</div>

        {/* AI suggestions */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span className="input-label" style={{ flex: 1 }}>SUGGESTED FOR YOUR IDEA</span>
            <button className="pixel-btn sm" onClick={fetchSuggestions} disabled={loadingSugg}>↺</button>
          </div>

          {loadingSugg && (
            <div className="pixel-loading" style={{ marginBottom: 8 }}>
              ANALYZING<div className="pixel-loading-dots"><span /><span /><span /></div>
            </div>
          )}
          {suggError && (
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: 6, color: 'var(--gb-red)', marginBottom: 6 }}>ERR: {suggError}</div>
          )}

          {aiSuggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => applyTemplate(s)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                background: 'var(--gb-lightest)', border: '3px solid var(--gb-darkest)',
                padding: '5px 7px', cursor: 'pointer', marginBottom: 4, textAlign: 'left',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gb-mid)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--gb-lightest)'}
            >
              <PixelAvatar player={s} scale={2} />
              <div>
                <div style={{ fontFamily: "'Press Start 2P'", fontSize: 7, color: 'var(--gb-darkest)' }}>{s.name}</div>
                <div style={{ fontFamily: "'Press Start 2P'", fontSize: 5, color: 'var(--gb-dark)', marginTop: 2 }}>{s.role}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="pixel-divider" />

        <div className="input-group">
          <label className="input-label">Name *</label>
          <input className="pixel-input" placeholder="e.g. Driver, Shopper" value={form.name} onChange={e => setF('name', e.target.value)} />
        </div>
        <div className="input-group">
          <label className="input-label">Role *</label>
          <input className="pixel-input" placeholder="e.g. Service provider" value={form.role} onChange={e => setF('role', e.target.value)} />
        </div>
        <div className="input-group">
          <label className="input-label">They Supply</label>
          <input className="pixel-input" placeholder="What do they bring?" value={form.supply} onChange={e => setF('supply', e.target.value)} />
        </div>
        <div className="input-group">
          <label className="input-label">They Want</label>
          <input className="pixel-input" placeholder="What do they need?" value={form.demand} onChange={e => setF('demand', e.target.value)} />
        </div>

        <div className="input-group">
          <label className="input-label">Primary Goal</label>
          <div className="goal-grid">
            {GOALS.map(g => (
              <button key={g} className={`goal-pill${form.goal === g ? ' active' : ''}`} onClick={() => setF('goal', g)}>{g}</button>
            ))}
          </div>
        </div>

        <div className="slider-wrap">
          <div className="slider-header">
            <span className="slider-label">Dependency on Others</span>
            <span className="slider-value">{form.dependency}</span>
          </div>
          <input type="range" className="pixel-slider" min={1} max={10} value={form.dependency} onChange={e => setF('dependency', Number(e.target.value))} />
          <div className="slider-range-labels"><span>LOW</span><span>HIGH</span></div>
        </div>

        <button
          className="pixel-btn primary"
          style={{ width: '100%', justifyContent: 'center' }}
          disabled={!form.name.trim() || !form.role.trim()}
          onClick={handleAdd}
        >
          + ADD TO ROSTER
        </button>
      </div>

      {/* Center: roster + map */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="scroll-area" style={{ flex: '0 0 auto', maxHeight: '48%', padding: 12, borderBottom: '4px solid var(--gb-darkest)', background: 'var(--gb-screen)' }}>
          <div className="section-title">ROSTER ({players.length}/8)</div>
          {players.length === 0 ? (
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: 7, color: 'var(--gb-dark)', textAlign: 'center', padding: 16, lineHeight: 2 }}>
              ADD AT LEAST 2 PLAYERS
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {players.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedId(p.id === selectedId ? null : p.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                    background: selectedId === p.id ? 'var(--gb-light)' : 'var(--gb-lightest)',
                    border: '4px solid var(--gb-darkest)', padding: '6px 8px',
                  }}
                >
                  <PixelAvatar player={p} scale={3} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="player-name">{p.name}</div>
                    <div className="player-role">{p.role}</div>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={e => { e.stopPropagation(); removePlayer(p.id); }}
                  >✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ flex: 1, padding: 12, background: 'var(--gb-mid)', overflow: 'hidden' }}>
          <div className="section-title">ECOSYSTEM MAP</div>
          <div style={{ height: 'calc(100% - 28px)' }}>
            <NetworkMap players={players} selectedId={selectedId} onSelect={p => setSelectedId(p.id)} />
          </div>
        </div>
      </div>

      {/* Right: nav */}
      <div style={{ width: 130, borderLeft: '4px solid var(--gb-darkest)', padding: 12, background: 'var(--gb-darkest)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
        <button className="pixel-btn" style={{ width: '100%', justifyContent: 'center', fontSize: 7 }} onClick={() => setCurrentStep(1)}>◀ BACK</button>
        <button className="pixel-btn primary" style={{ width: '100%', justifyContent: 'center', fontSize: 7 }} disabled={players.length < 2} onClick={() => setCurrentStep(3)}>
          NEXT ▶
        </button>
        {players.length < 2 && <div style={{ fontFamily: "'Press Start 2P'", fontSize: 5, color: 'var(--gb-mid)', textAlign: 'center' }}>NEED 2+</div>}
      </div>
    </div>
  );
}
