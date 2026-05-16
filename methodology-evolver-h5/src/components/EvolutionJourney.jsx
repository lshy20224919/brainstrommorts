export default function EvolutionJourney({ stages }) {
  if (!stages || stages.length === 0) return null

  return (
    <div className="evo-journey">
      <div className="evo-journey-title">进化旅程</div>
      <div className="evo-journey-track">
        {stages.map((stage, i) => (
          <div key={stage.key} className="evo-journey-step">
            <div className="evo-journey-dot-row">
              {i > 0 && <div className={`evo-journey-line ${stages[i - 1].done ? 'done' : ''}`} />}
              <div className={`evo-journey-dot ${stage.done ? 'done' : ''}`}>
                {stage.done && <span className="evo-journey-check">✓</span>}
              </div>
            </div>
            <div className="evo-journey-label">{stage.label}</div>
            <div className="evo-journey-value">{stage.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
