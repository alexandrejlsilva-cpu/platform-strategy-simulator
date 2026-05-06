import { useApp } from '../context/AppContext.jsx';

const STEPS = [
  { num: 1, label: '1.MARKET' },
  { num: 2, label: '2.PLAYERS' },
  { num: 3, label: '3.INTERVIEW' },
  { num: 4, label: '4.DYNAMICS' },
  { num: 5, label: '5.STRATEGY' },
];

export default function StepNav() {
  const { currentStep, setCurrentStep, players, business } = useApp();

  function canNavigate(num) {
    if (num === 1) return true;
    if (num === 2) return business.description.trim().length > 0;
    if (num === 3) return players.length >= 2;
    if (num === 4) return players.length >= 2;
    if (num === 5) return players.length >= 2;
    return false;
  }

  return (
    <nav className="step-nav">
      <span className="step-nav-title">PSS</span>
      {STEPS.map(s => (
        <button
          key={s.num}
          className={`step-tile${currentStep === s.num ? ' active' : ''}${s.num < currentStep ? ' done' : ''}`}
          onClick={() => canNavigate(s.num) && setCurrentStep(s.num)}
          title={!canNavigate(s.num) ? 'Complete previous steps first' : ''}
        >
          <span className="dot" />
          {s.label}
        </button>
      ))}
    </nav>
  );
}
