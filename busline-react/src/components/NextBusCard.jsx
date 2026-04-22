import {
  findActiveTrip, findNextTrip, getTripStatus,
  getPositionDescription, getStopStatus, findNextStop,
} from '../utils/tripLogic';
import { formatTime, calculateTimeDifference, timeToMinutes, formatCountdown } from '../utils/timeUtils';

export default function NextBusCard({ trips, t, tBus, tStop, language, getDirectionLabel }) {
  const activeTrip = findActiveTrip(trips);
  const trip       = activeTrip || findNextTrip(trips);

  // ── No trips left today ────────────────────────────────────────────
  if (!trip) {
    return (
      <div className="next-bus-card">
        <div className="no-bus-msg">
          <div style={{ fontSize: '2.2em', marginBottom: '12px' }}>🌙</div>
          <strong>{t('noBusesToday')}</strong><br />
          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            {t('checkTomorrow')}
          </span>
        </div>
      </div>
    );
  }

  const tripStatus = getTripStatus(trip);
  const posInfo    = getPositionDescription(trip, t, tStop);
  const firstStop  = trip.stops[0];
  const lastStop   = trip.stops[trip.stops.length - 1];

  const badgeMap = {
    UPCOMING:  { cls: 'badge-upcoming', label: t('badgeUpcoming') },
    EN_ROUTE:  { cls: 'badge-at-stop',  label: t('badgeEnRoute')  },
    AT_STOP:   { cls: 'badge-at-stop',  label: t('badgeAtStop')   },
    COMPLETED: { cls: 'badge-departed', label: t('badgeCompleted')},
  };
  const badge = badgeMap[tripStatus] || badgeMap.UPCOMING;

  return (
    <div className="next-bus-card">
      {/* Top row: bus name + badge */}
      <div className="nbc-top">
        <div>
          <div className="nbc-name">{tBus(trip.busName)}</div>
          <div className="nbc-direction-label">
            {getDirectionLabel(trip.direction)}
            {trip.totalTripsThisDir > 1 && (
              <span className="nbc-trip-label">
                {t('tripLabel')} {trip.tripIndex} {t('ofLabel')} {trip.totalTripsThisDir}
              </span>
            )}
          </div>
        </div>
        <div className={`nbc-status-badge ${badge.cls}`}>
          <span className="badge-dot"></span>
          {badge.label}
        </div>
      </div>

      {/* Countdown chip */}
      <CountdownChip trip={trip} tripStatus={tripStatus} t={t} tStop={tStop} language={language} />

      {/* Departure / Arrival times */}
      <div className="nbc-times">
        <div className="nbc-time-item">
          <span className="nbc-time-label">{t('departure')}</span>
          <span className="nbc-time-value">{formatTime(firstStop.time)}</span>
        </div>
        <div className="nbc-time-item">
          <span className="nbc-time-label">{t('arrival')}</span>
          <span className="nbc-time-value">{formatTime(lastStop.time)}</span>
        </div>
      </div>

      {/* Position text */}
      <div className="nbc-position">
        <span className="position-icon">◉</span>
        {posInfo.text}
      </div>

      {/* Stop progress track */}
      <div className="nbc-stops-track">
        {trip.stops.map((stop, i) => {
          const st      = getStopStatus(trip, i);
          const circCls = st === 'passed' ? 'passed' : st === 'current' ? 'current' : '';
          const nameCls = st === 'current' ? 'active-stop' : '';
          return (
            <div key={i} style={{ display: 'contents' }}>
              <div className="stop-dot">
                <div className={`stop-dot-circle ${circCls}`}></div>
                <div className={`stop-dot-name ${nameCls}`} title={tStop(stop.name)}>
                  {tStop(stop.name)}
                </div>
              </div>
              {i < trip.stops.length - 1 && (
                <div className={`stop-connector${st === 'passed' ? ' passed' : ''}`}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CountdownChip({ trip, tripStatus, t, tStop, language }) {
  if (tripStatus === 'UPCOMING') {
    const diff = calculateTimeDifference(timeToMinutes(trip.stops[0].time));
    return (
      <div className="countdown-chip chip-upcoming">
        <span className="chip-icon">🕐</span>
        {t('chipLeavesIn')} <strong>{formatCountdown(diff, t)}</strong>
      </div>
    );
  }

  if (tripStatus === 'EN_ROUTE') {
    const nextStop = findNextStop(trip);
    if (nextStop) {
      const diff = calculateTimeDifference(timeToMinutes(nextStop.time));
      return (
        <div className="countdown-chip chip-enroute">
          <span className="chip-icon">🚌</span>
          {language === 'kn' ? (
            <><strong>{tStop(nextStop.name)}</strong> {t('chipArrivingAt')} <strong>{formatCountdown(diff, t)}</strong></>
          ) : (
            <>{t('chipArrivingAt')} <strong>{tStop(nextStop.name)}</strong> {t('chipIn')} <strong>{formatCountdown(diff, t)}</strong></>
          )}
        </div>
      );
    }
  }

  if (tripStatus === 'AT_STOP') {
    return (
      <div className="countdown-chip chip-atstop">
        <span className="chip-icon">📍</span>
        {t('chipBoarding')}
      </div>
    );
  }

  return null;
}
