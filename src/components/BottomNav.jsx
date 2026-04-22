export default function BottomNav({ activePage, onNavigate }) {
  return (
    <nav className="bottom-nav" role="navigation" aria-label="Page Navigation">
      <button
        className={`bottom-nav-btn ${activePage === 'live' ? 'active' : ''}`}
        onClick={() => onNavigate('live')}
        aria-label="Live"
      >
        <span className="bnav-icon">🚌</span>
        <span className="bnav-label">Live</span>
      </button>
      <button
        className={`bottom-nav-btn ${activePage === 'schedule' ? 'active' : ''}`}
        onClick={() => onNavigate('schedule')}
        aria-label="Schedule"
      >
        <span className="bnav-icon">📋</span>
        <span className="bnav-label">Schedule</span>
      </button>
    </nav>
  );
}
