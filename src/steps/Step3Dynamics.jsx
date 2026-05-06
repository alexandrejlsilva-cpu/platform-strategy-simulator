import { useApp } from '../context/AppContext.jsx';
import PixelSlider from '../components/PixelSlider.jsx';

const WTA_CONDITIONS = [
  {
    key: 'multiHomingCost',
    label: 'Cost of Multi-homing',
    low: 'EASY (Low WTA)',
    high: 'HARD (High WTA)',
    tip: 'Can users simultaneously use multiple platforms?',
  },
  {
    key: 'standardizationPref',
    label: 'Preference for Standardization',
    low: 'SPECIALIZED',
    high: 'STANDARDIZED (High WTA)',
    tip: 'Do users all want the same core function, or specialized needs?',
  },
  {
    key: 'intermediationNeed',
    label: 'Necessity of Intermediation',
    low: 'CAN BYPASS',
    high: 'NEED PLATFORM (High WTA)',
    tip: 'Can matched users transact without the platform?',
  },
  {
    key: 'userPowerDispersion',
    label: 'Dispersion of User Power',
    low: 'CONCENTRATED',
    high: 'DISPERSED (High WTA)',
    tip: 'Can individual users force sudden large-scale platform changes?',
  },
];

const NETWORK_EFFECTS = [
  { key: 'crossSideNetworkEffects', label: 'Cross-side Network Effects', low: 'WEAK', high: 'STRONG', tip: 'How much does one side benefit from growth on the other side?' },
  { key: 'sameSideEffects',         label: 'Same-side Effects',          low: 'NEGATIVE', high: 'POSITIVE', tip: 'Do users on the same side help or compete with each other?' },
];

const MARKET_CONTEXT = [
  { key: 'switchingCosts', label: 'Switching Costs',  low: 'LOW', high: 'HIGH', tip: 'How hard is it for users to leave for a competitor?' },
  { key: 'marketMaturity', label: 'Market Maturity',  low: 'EMERGING', high: 'MATURE', tip: 'How established is this market?' },
];

function wtaLevel(v) {
  if (v >= 7) return { label: 'HIGH', color: 'var(--gb-darkest)' };
  if (v >= 4) return { label: 'MED',  color: 'var(--gb-dark)' };
  return { label: 'LOW', color: 'var(--gb-red)' };
}

function SliderGroup({ title, sliders, dynamics, setDynamics, showWta }) {
  return (
    <div className="strategy-section" style={{ marginBottom: 10 }}>
      <div className="strategy-section-title">{title}</div>
      {sliders.map(s => (
        <div key={s.key}>
          <PixelSlider
            label={s.label}
            value={dynamics[s.key]}
            onChange={v => setDynamics(d => ({ ...d, [s.key]: v }))}
            lowLabel={s.low}
            highLabel={s.high}
          />
          {showWta && (
            <div style={{ display:'flex', justifyContent:'flex-end', marginTop:-6, marginBottom:4, paddingRight:4 }}>
              <span style={{ fontFamily:"'Press Start 2P'",fontSize:5, color: wtaLevel(dynamics[s.key]).color }}>
                WTA: {wtaLevel(dynamics[s.key]).label}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function WtaScoreMeter({ dynamics }) {
  const scores = WTA_CONDITIONS.map(c => dynamics[c.key]);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const pct = ((avg - 1) / 9) * 100;

  let market, color;
  if (avg >= 7.5) { market = 'WINNER-TAKE-ALL';  color = 'var(--gb-darkest)'; }
  else if (avg >= 5.5) { market = 'WINNER-TAKE-MOST'; color = 'var(--gb-dark)'; }
  else if (avg >= 3.5) { market = 'WINNER-TAKE-SOME'; color = '#8A6000'; }
  else { market = 'NO-WINNER MARKET'; color = 'var(--gb-red)'; }

  return (
    <div style={{ background:'var(--gb-lightest)', border:'4px solid var(--gb-darkest)', padding:'10px 12px', marginBottom:12 }}>
      <div style={{ fontFamily:"'Press Start 2P'",fontSize:6,color:'var(--gb-dark)',marginBottom:6 }}>WTA SCORE PREVIEW</div>
      <div style={{ background:'var(--gb-screen)', border:'3px solid var(--gb-darkest)', height:14, marginBottom:6 }}>
        <div style={{ height:'100%', width:`${pct}%`, background:color, transition:'width 0.3s' }} />
      </div>
      <div style={{ fontFamily:"'Press Start 2P'",fontSize:7,color:color,textAlign:'center' }}>{market}</div>
      <div style={{ fontFamily:"'Press Start 2P'",fontSize:5,color:'var(--gb-dark)',textAlign:'center',marginTop:4 }}>
        {avg >= 5.5 ? '→ COMPETE: invest in growth & lock-in' : '→ COLLABORATE: partnerships & bundling'}
      </div>
    </div>
  );
}

export default function Step3Dynamics() {
  const { dynamics, setDynamics, setCurrentStep } = useApp();

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <div className="scroll-area" style={{ flex: 1, padding: 16, background: 'var(--gb-screen)' }}>
        <div className="section-title">STEP 4 — MARKET DYNAMICS</div>

        <WtaScoreMeter dynamics={dynamics} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <SliderGroup title="WTA CONDITIONS" sliders={WTA_CONDITIONS} dynamics={dynamics} setDynamics={setDynamics} showWta />
          </div>
          <div>
            <SliderGroup title="NETWORK EFFECTS" sliders={NETWORK_EFFECTS} dynamics={dynamics} setDynamics={setDynamics} />
            <SliderGroup title="MARKET CONTEXT"  sliders={MARKET_CONTEXT}  dynamics={dynamics} setDynamics={setDynamics} />
          </div>
        </div>
      </div>

      <div style={{ width: 140, borderLeft: '4px solid var(--gb-darkest)', padding: 12, background: 'var(--gb-darkest)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
        <button className="pixel-btn" style={{ width: '100%', justifyContent: 'center', fontSize: 7 }} onClick={() => setCurrentStep(3)}>◀ BACK</button>
        <button className="pixel-btn primary" style={{ width: '100%', justifyContent: 'center', fontSize: 7 }} onClick={() => setCurrentStep(5)}>
          STRATEGY ▶
        </button>
      </div>
    </div>
  );
}
