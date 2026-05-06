export default function PixelSlider({ label, value, onChange, min = 1, max = 10, lowLabel, highLabel, dark = false }) {
  return (
    <div className="slider-wrap">
      <div className="slider-header">
        <span className={dark ? 'slider-label-light' : 'slider-label'}>{label}</span>
        <span className={dark ? 'slider-value-light' : 'slider-value'}>{value}</span>
      </div>
      <input
        type="range"
        className="pixel-slider"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
      {(lowLabel || highLabel) && (
        <div className={dark ? 'slider-range-labels-light' : 'slider-range-labels'}>
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
      )}
    </div>
  );
}
