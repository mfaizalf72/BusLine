import { useEffect, useState } from 'react';
import { formatCurrentTime } from '../utils/timeUtils';

export default function Header({ language, onToggleLanguage, t }) {
  const [clock, setClock] = useState(formatCurrentTime());

  useEffect(() => {
    const id = setInterval(() => setClock(formatCurrentTime()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="site-header">
      <div className="header-inner">

        {/* Logo */}
        <div className="logo">
          <span className="logo-icon">🚌</span>
          <span className="logo-text">BusLine</span>
          <span className="logo-badge">LIVE</span>
        </div>

        {/* Language Toggle */}
        <button
          className="lang-toggle-btn"
          onClick={onToggleLanguage}
          aria-label="Switch Language"
        >
          <span className="lang-toggle-icon">🌐</span>
          <span className="lang-toggle-label">
            {language === 'en' ? 'ಕನ್ನಡ' : 'English'}
          </span>
        </button>

        {/* Live Clock */}
        <div className="current-time-display">
          <span className="time-label">{t('localTime')}</span>
          <span className="time-value">{clock}</span>
        </div>

      </div>
    </header>
  );
}
