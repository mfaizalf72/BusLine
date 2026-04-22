import { findActiveTrip, findNextTrip, getTripRowStatus, getTripStatus, getStopStatus, findNextStop } from '../utils/tripLogic';
import { formatTime, calculateTimeDifference, timeToMinutes, formatCountdown } from '../utils/timeUtils';

export default function ScheduleTable({ trips, t, tBus, tStop, getDirectionLabel }) {
  if (trips.length === 0) {
    return (
      <div className="schedule-grid">
        <div className="no-bus-msg">{t('noBusesForRoute')}</div>
      </div>
    );
  }

  const featuredTrip = findActiveTrip(trips) || findNextTrip(trips);

  return (
    <div className="schedule-grid">
      {trips.map((trip, idx) => {
        const rowStatus = getTripRowStatus(trip, featuredTrip);
        const rowCls    = rowStatus === 'NEXT' ? 'row-next' : rowStatus === 'DEPARTED' ? 'row-departed' : '';
        const tagCls    = rowStatus === 'NEXT' ? 'tag-next' : rowStatus === 'DEPARTED' ? 'tag-departed' : 'tag-upcoming';
        const tagLabel  = rowStatus === 'NEXT' ? t('tagNext') : rowStatus === 'DEPARTED' ? t('tagDeparted') : t('tagUpcoming');

        const firstStop = trip.stops[0];
        const lastStop  = trip.stops[trip.stops.length - 1];

        return (
          <div
            key={`${trip.busName}-${trip.tripIndex}`}
            className={`schedule-row ${rowCls}`}
            style={{ animationDelay: `${idx * 0.04}s` }}
          >
            <div className="row-left">
              <div className="row-bus-name">{tBus(trip.busName)}</div>
              <div className="row-direction-label">{getDirectionLabel(trip.direction)}</div>
              <div className="row-time-range">
                <span className="t-start">{formatTime(firstStop.time)}</span>
                <span className="t-sep">→</span>
                <span className="t-end">{formatTime(lastStop.time)}</span>
                {trip.totalTripsThisDir > 1 && (
                  <span className="row-trip-badge">
                    {t('tripLabel')} {trip.tripIndex} {t('ofLabel')} {trip.totalTripsThisDir}
                  </span>
                )}
              </div>
              {rowStatus === 'NEXT' && <EtaBadge trip={trip} t={t} />}
            </div>

            <div className="row-status">
              <span className={`status-tag ${tagCls}`}>{tagLabel}</span>
            </div>

            <div className="row-stops">
              {trip.stops.map((stop, i) => {
                const st     = getStopStatus(trip, i);
                const bdgCls = st === 'passed'  ? 'stop-badge badge-passed'  :
                               st === 'current' ? 'stop-badge badge-current' : 'stop-badge';
                return (
                  <span key={i}>
                    <span className={bdgCls}>
                      {tStop(stop.name)}
                      <span className="badge-time">{formatTime(stop.time)}</span>
                    </span>
                    {i < trip.stops.length - 1 && (
                      <span className="stop-badge-arrow">→</span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EtaBadge({ trip, t }) {
  const status = getTripStatus(trip);

  if (status === 'UPCOMING') {
    const diff = calculateTimeDifference(timeToMinutes(trip.stops[0].time));
    if (diff > 0) return (
      <span className="row-eta-badge">{t('etaDeparts')} {formatCountdown(diff, t)}</span>
    );
  }

  if (status === 'EN_ROUTE' || status === 'AT_STOP') {
    const nextStop = findNextStop(trip);
    if (nextStop) {
      const diff = calculateTimeDifference(timeToMinutes(nextStop.time));
      return (
        <span className="row-eta-badge">{t('etaNextStop')} {formatCountdown(diff, t)}</span>
      );
    }
  }

  return null;
}
