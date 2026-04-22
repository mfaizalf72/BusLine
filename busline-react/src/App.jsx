import { useState, useEffect } from 'react';
import { TRANSLATIONS } from './data/translations';
import { getTripsForDirection } from './utils/tripLogic';
import Header        from './components/Header';
import DirectionTabs from './components/DirectionTabs';
import NextBusCard   from './components/NextBusCard';
import StopFinder    from './components/StopFinder';
import ScheduleTable from './components/ScheduleTable';
import BottomNav     from './components/BottomNav';

function makeT(language) {
  return (key) =>
    (TRANSLATIONS[language]?.[key] !== undefined
      ? TRANSLATIONS[language][key]
      : TRANSLATIONS.en[key]) ?? key;
}
function makeTBus(language)  { return (name) => TRANSLATIONS[language]?.busNames?.[name]  ?? name; }
function makeTStop(language) { return (name) => TRANSLATIONS[language]?.stopNames?.[name] ?? name; }

export default function App() {
  const [language,        setLanguage]        = useState(() => localStorage.getItem('busline-lang') || 'en');
  const [activeDirection, setActiveDirection] = useState('HTM_TO_MNG');
  const [lastUpdated,     setLastUpdated]     = useState('—');
  const [tick,            setTick]            = useState(0);
  const [activePage,      setActivePage]      = useState('live');

  const t     = makeT(language);
  const tBus  = makeTBus(language);
  const tStop = makeTStop(language);

  useEffect(() => { document.documentElement.lang = language; }, [language]);

  useEffect(() => {
    function refresh() {
      const ts = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      setLastUpdated(`${makeT(language)('lastUpdated')}: ${ts}`);
      setTick(n => n + 1);
    }
    refresh();
    const id = setInterval(refresh, 60_000);
    return () => clearInterval(id);
  }, [language]);

  function toggleLanguage() {
    const next = language === 'en' ? 'kn' : 'en';
    setLanguage(next);
    localStorage.setItem('busline-lang', next);
  }

  function getDirectionLabel(direction) {
    return direction === 'HTM_TO_MNG' ? t('dirHtmToMng') : t('dirMngToHtm');
  }

  const trips = getTripsForDirection(activeDirection);

  return (
    <>
      <div className="bg-image-layer" /> 
      <Header language={language} onToggleLanguage={toggleLanguage} t={t} />

      <DirectionTabs activeDirection={activeDirection} onSwitch={setActiveDirection} t={t} />

      {activePage === 'live' && (
        <main className="main-panel">
          <section className="section next-bus-section">
            <h2 className="section-title">
              <span className="title-icon">◎</span>
              <span>{t('nextBus')}</span>
            </h2>
            <NextBusCard
              trips={trips} t={t} tBus={tBus} tStop={tStop}
              language={language} getDirectionLabel={getDirectionLabel}
            />
          </section>

          <section className="section stop-finder-section">
            <h2 className="section-title">
              <span className="title-icon">◈</span>
              <span>{t('smartStopFinder')}</span>
            </h2>
            <StopFinder
              trips={trips} activeDirection={activeDirection}
              t={t} tBus={tBus} tStop={tStop} language={language}
            />
          </section>
        </main>
      )}

      {activePage === 'schedule' && (
        <main className="main-panel">
          <section className="section schedule-section">
            <h2 className="section-title">
              <span className="title-icon">▦</span>
              <span>{t('fullSchedule')}</span>
            </h2>
            <div className="schedule-wrapper">
              <ScheduleTable
                trips={trips} t={t} tBus={tBus} tStop={tStop}
                getDirectionLabel={getDirectionLabel}
              />
            </div>
          </section>
        </main>
      )}

      <footer className="site-footer">
        <span>{t('footerText')}</span>
        <span className="footer-dot">·</span>
        <span>{lastUpdated}</span>
      </footer>

      <BottomNav activePage={activePage} onNavigate={setActivePage} t={t} />
    </>
  );
}
