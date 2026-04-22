export default function DirectionTabs({ activeDirection, onSwitch, t }) {
  return (
    <nav className="direction-tabs" role="tablist" aria-label="Route Direction">
      <button
        className={`tab-btn ${activeDirection === 'HTM_TO_MNG' ? 'active' : ''}`}
        role="tab"
        aria-selected={activeDirection === 'HTM_TO_MNG'}
        onClick={() => onSwitch('HTM_TO_MNG')}
      >
        <span className="tab-origin">{t('tabOrigin1')}</span>
        <span className="tab-arrow">→</span>
        <span className="tab-dest">{t('tabDest1')}</span>
      </button>
      <button
        className={`tab-btn ${activeDirection === 'MNG_TO_HTM' ? 'active' : ''}`}
        role="tab"
        aria-selected={activeDirection === 'MNG_TO_HTM'}
        onClick={() => onSwitch('MNG_TO_HTM')}
      >
        <span className="tab-origin">{t('tabOrigin2')}</span>
        <span className="tab-arrow">→</span>
        <span className="tab-dest">{t('tabDest2')}</span>
      </button>
    </nav>
  );
}
