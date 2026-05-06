import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function Step1Market() {
  const { business, setBusiness, setCurrentStep } = useApp();
  const [oakDone, setOakDone] = useState(false);

  const canContinue = business.description.trim().length > 10 && business.industry.trim().length > 0;

  if (!oakDone) {
    return (
      <div className="oak-wrap">
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', maxWidth: 620, width: '100%' }}>
          <div className="oak-portrait">
            PROF.<br />OAK
          </div>
          <div style={{ flex: 1 }}>
            <div className="dialog-overlay">
              <div className="dialog-speaker">PROF. OAK:</div>
              <div className="dialog-text">
                Hello! Welcome to the Platform Strategy Simulator!<br /><br />
                This tool will help you discover whether your business idea works best as a multi-sided platform — and how to make it win.<br /><br />
                But first... tell me about your idea!
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="pixel-btn primary" onClick={() => setOakDone(true)}>
                ▶ LET'S GO
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="scroll-area" style={{ height: '100%', padding: 20 }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="section-title">STEP 1 — DEFINE YOUR MARKET</div>

        <div className="pixel-panel" style={{ marginBottom: 16 }}>
          <div className="input-group">
            <label className="input-label">Business Description *</label>
            <textarea
              className="pixel-textarea"
              placeholder="Describe what your business does, who it connects, and what value it creates..."
              value={business.description}
              onChange={e => setBusiness(b => ({ ...b, description: e.target.value }))}
              maxLength={400}
            />
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: 6, color: 'var(--gb-dark)', textAlign: 'right' }}>
              {business.description.length}/400
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Industry / Market Context *</label>
            <input
              className="pixel-input"
              placeholder="e.g. Gig economy, B2B SaaS, Consumer marketplace..."
              value={business.industry}
              onChange={e => setBusiness(b => ({ ...b, industry: e.target.value }))}
            />
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Geographic Scope</label>
            <div className="seg-toggle">
              {['LOCAL', 'REGIONAL', 'GLOBAL'].map(s => (
                <button
                  key={s}
                  className={business.geographicScope === s ? 'active' : ''}
                  onClick={() => setBusiness(b => ({ ...b, geographicScope: s }))}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="pixel-btn primary"
            disabled={!canContinue}
            onClick={() => setCurrentStep(2)}
          >
            NEXT: BUILD TEAM ▶
          </button>
        </div>
      </div>
    </div>
  );
}
