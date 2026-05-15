export default function Loading({ rows = 3 }) {
  return (
    <div className="g-loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="g-loading-row" style={{ width: `${80 - i * 15}%` }} />
      ))}
    </div>
  )
}
