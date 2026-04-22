import { BUS_DATA } from '../data/busData';
import { getCurrentMinutes, timeToMinutes } from './timeUtils';

// ─────────────────────────────────────────────────────────────────────
// TRIP EXTRACTION
// ─────────────────────────────────────────────────────────────────────

/**
 * Returns a flat sorted array of trip objects for the given direction.
 * tripIndex is assigned AFTER sorting so it always matches display order.
 */
export function getTripsForDirection(direction) {
  const result = [];

  for (const bus of BUS_DATA) {
    const directionTripCount = bus.trips.filter(t => t.direction === direction).length;

    for (let i = 0; i < bus.trips.length; i++) {
      const trip = bus.trips[i];
      if (trip.direction !== direction) continue;

      result.push({
        busName:           bus.name,
        tripIndex:         0,            // placeholder — assigned after sort
        totalTripsThisDir: directionTripCount,
        globalTripIndex:   i + 1,
        totalTrips:        bus.trips.length,
        direction:         trip.direction,
        stops:             trip.stops,
      });
    }
  }

  // Sort chronologically by departure time
  result.sort((a, b) =>
    timeToMinutes(a.stops[0].time) - timeToMinutes(b.stops[0].time)
  );

  // Re-number tripIndex per bus AFTER sorting so "Trip 1" is always
  // the earliest trip in the day for that bus on this direction.
  const busSeqMap = {};
  for (const trip of result) {
    if (!busSeqMap[trip.busName]) busSeqMap[trip.busName] = 0;
    busSeqMap[trip.busName]++;
    trip.tripIndex = busSeqMap[trip.busName];
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────
// TRIP STATUS
// ─────────────────────────────────────────────────────────────────────

/** Returns "UPCOMING" | "AT_STOP" | "EN_ROUTE" | "COMPLETED" */
export function getTripStatus(trip) {
  const now       = getCurrentMinutes();
  const firstTime = timeToMinutes(trip.stops[0].time);
  const lastTime  = timeToMinutes(trip.stops[trip.stops.length - 1].time);

  if (now < firstTime) return 'UPCOMING';
  if (now > lastTime)  return 'COMPLETED';

  for (const stop of trip.stops) {
    if (Math.abs(now - timeToMinutes(stop.time)) <= 1) return 'AT_STOP';
  }

  return 'EN_ROUTE';
}

/** Returns the currently active (EN_ROUTE or AT_STOP) trip, or null. */
export function findActiveTrip(trips) {
  const now = getCurrentMinutes();
  const activeTrips = trips.filter(t => {
    const s = getTripStatus(t);
    return s === 'EN_ROUTE' || s === 'AT_STOP';
  });

  if (activeTrips.length === 0) return null;
  if (activeTrips.length === 1) return activeTrips[0];

  return activeTrips.reduce((best, trip) => {
    const dTrip = Math.abs(now - timeToMinutes(trip.stops[0].time));
    const dBest = Math.abs(now - timeToMinutes(best.stops[0].time));
    return dTrip < dBest ? trip : best;
  });
}

/** Returns the earliest UPCOMING trip, or null. */
export function findNextTrip(trips) {
  const now = getCurrentMinutes();
  return [...trips]
    .sort((a, b) => timeToMinutes(a.stops[0].time) - timeToMinutes(b.stops[0].time))
    .find(t => timeToMinutes(t.stops[0].time) > now) || null;
}

/** Returns the next stop the bus hasn't reached yet. */
export function findNextStop(trip) {
  const now = getCurrentMinutes();
  return trip.stops.find(stop => timeToMinutes(stop.time) > now) || null;
}

/** Returns position info object: { text, type } */
export function getPositionDescription(trip, t, tStop) {
  const now   = getCurrentMinutes();
  const stops = trip.stops;
  const first = timeToMinutes(stops[0].time);
  const last  = timeToMinutes(stops[stops.length - 1].time);

  if (now < first) return { text: t('posNotStarted'), type: 'not_started' };
  if (now > last)  return { text: t('posCompleted'),  type: 'completed'   };

  for (const stop of stops) {
    if (Math.abs(now - timeToMinutes(stop.time)) <= 1) {
      return { text: `${t('posBusAt')} ${tStop(stop.name)}`, type: 'at_stop', stopName: stop.name };
    }
  }

  for (let i = 0; i < stops.length - 1; i++) {
    const t1 = timeToMinutes(stops[i].time);
    const t2 = timeToMinutes(stops[i + 1].time);
    if (now >= t1 && now < t2) {
      return {
        text:     `${t('posBetween')} ${tStop(stops[i].name)} ${t('posAnd')} ${tStop(stops[i + 1].name)}`,
        type:     'between',
        fromStop: stops[i].name,
        toStop:   stops[i + 1].name,
      };
    }
  }

  return { text: t('posUnknown'), type: 'unknown' };
}

/** Returns "passed" | "current" | "upcoming" for one stop dot */
export function getStopStatus(trip, stopIndex) {
  const now      = getCurrentMinutes();
  const stopTime = timeToMinutes(trip.stops[stopIndex].time);
  const status   = getTripStatus(trip);

  if (status === 'COMPLETED')        return 'passed';
  if (now > stopTime + 1)            return 'passed';
  if (Math.abs(now - stopTime) <= 1) return 'current';
  return 'upcoming';
}

/** Returns "NEXT" | "DEPARTED" | "UPCOMING" for a schedule row */
export function getTripRowStatus(trip, featuredTrip) {
  const status = getTripStatus(trip);
  if (status === 'COMPLETED') return 'DEPARTED';

  if (featuredTrip &&
      trip.busName   === featuredTrip.busName &&
      trip.tripIndex === featuredTrip.tripIndex) return 'NEXT';

  if (status === 'EN_ROUTE' || status === 'AT_STOP') return 'NEXT';
  return 'UPCOMING';
}
