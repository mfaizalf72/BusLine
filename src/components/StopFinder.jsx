import { useState, useEffect } from 'react';
import { getTripsForDirection, getTripStatus, getPositionDescription, findNextStop } from '../utils/tripLogic';
import { getCurrentMinutes, timeToMinutes, formatTime, formatCountdown, calculateTimeDifference } from '../utils/timeUtils';

export default function StopFinder({ trips, activeDirection, t, tBus, tStop, language }) {
  const [selectedStop, setSelectedStop] = useState('');
  const [result, setResult]             = useState(null); // null | { type, data }

  // Build unique stop list from trips in route order
  const stops = (() => {
    const seen = new Map();
    for (const trip of trips) {
      for (const stop of trip.stops) {
        if (!seen.has(stop.name)) seen.set(stop.name, true);
      }
    }
    return [...seen.keys()];
  })();

  // Reset when direction changes
  useEffect(() => {
    setSelectedStop('');
    setResult(null);
  }, [activeDirection]);

  function runFinder(stop) {
    if (!stop) { setResult(null); return; }

    const now        = getCurrentMinutes();
    const candidates = trips.filter(trip => {
      const stopObj = trip.stops.find(s => s.name === stop);
      return stopObj && timeToMinutes(stopObj.time) >= now;
    });

    if (candidates.length === 0) {
      const stopExists = trips.some(tr => tr.stops.some(s => s.name === stop));
      setResult({ type: stopExists ? 'no_more' : 'not_found', stop });
      return;
    }

    candidates.sort((a, b) => {
      const ta = timeToMinutes(a.stops.find(s => s.name === stop).time);
      const tb = timeToMinutes(b.stops.find(s => s.name === stop).time);
      return ta - tb;
    });

    const trip       = candidates[0];
    const stopObj    = trip.stops.find(s => s.name === stop);
    const minsAway   = calculateTimeDifference(timeToMinutes(stopObj.time));
    const tripStatus = getTripStatus(trip);
    const posInfo    = getPositionDescription(trip, t, tStop);

    setResult({ type: 'found', trip, stopObj, minsAway, tripStatus, posInfo });
  }

  function handleChange(e) {
    const val = e.target.value;
    setSelectedStop(val);
    runFinder(val);
  }

  function handleFindClick() {
    runFinder(selectedStop);
  }

  return (
    <div className="stop-finder-card">
      <p className="finder-description">{t('finderDesc')}</p>
      <div className="finder-controls">
        <div className="select-group">
          <label htmlFor="stopSelect" className="select-label">{t('yourStop')}</label>
          <select
            id="stopSelect"
            className="styled-select"
            value={selectedStop}
            onChange={handleChange}
          >
            <option value="">{t('chooseStop')}</option>
            {stops.map(name => (
              <option key={name} value={name}>{tStop(name)}</option>
            ))}
          </select>
        </div>
        <button className="find-btn" onClick={handleFindClick}>{t('findBus')}</button>
      </div>

      {result && <FinderResult result={result} t={t} tBus={tBus} tStop={tStop} language={language} />}
    </div>
  );
}

function FinderResult({ result, t, tBus, tStop, language }) {
  if (result.type === 'no_more') {
    return (
      <div className="finder-result result-error">
        <div className="result-icon">⛔</div>
        <div>
          <strong>{t('noMoreBuses')}</strong><br />
          <span className="result-sub">
            {t('allTripsPassed')} <em>{tStop(result.stop)}</em>.
          </span>
        </div>
      </div>
    );
  }

  if (result.type === 'not_found') {
    return (
      <div className="finder-result result-error">
        <div className="result-icon">❓</div>
        <div>
          <strong>{t('stopNotFound')}</strong> {t('onRouteLabel')}<br />
          <span className="result-sub">{t('tryDifferentStop')}</span>
        </div>
      </div>
    );
  }

  const { trip, stopObj, minsAway, tripStatus, posInfo } = result;
  const tripLabel = trip.totalTripsThisDir > 1
    ? <span className="result-trip-label">{t('tripLabel')} {trip.tripIndex} {t('ofLabel')} {trip.totalTripsThisDir}</span>
    : null;

  return (
    <div className="finder-result result-success">
      <div className="result-bus-name">
        {tBus(trip.busName)} {tripLabel}
      </div>
      <div className="result-main">
        {minsAway === 0 ? (
          <span className="result-highlight">{t('arrivingNow')}</span>
        ) : (
          <>
            {t('busArrivesIn')}{' '}
            <span className="result-highlight">{formatCountdown(minsAway, t)}</span>{' '}
            <span className="result-sub-inline">({t('inWord')} {formatTime(stopObj.time)})</span>
          </>
        )}
      </div>
      {(tripStatus === 'EN_ROUTE' || tripStatus === 'AT_STOP') ? (
        <div className="result-position">📍 <em>{posInfo.text}</em></div>
      ) : (
        <div className="result-position">
          🕐 {t('departsWord')} <strong>{tStop(trip.stops[0].name)}</strong> {t('inWord')}{' '}
          <strong>{formatCountdown(calculateTimeDifference(timeToMinutes(trip.stops[0].time)), t)}</strong>{' '}
          <span className="result-sub-inline">({formatTime(trip.stops[0].time)})</span>
        </div>
      )}
    </div>
  );
}
