// ─────────────────────────────────────────────────────────────────────
// TIME UTILITIES
// ─────────────────────────────────────────────────────────────────────

/** Returns current local time as total minutes since midnight. */
export function getCurrentMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/** Converts "HH:MM" string → integer minutes since midnight. */
export function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

/** Converts "HH:MM" 24-hour → "H:MM AM/PM" 12-hour display. */
export function formatTime(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour   = h % 12 || 12;
  const min    = String(m).padStart(2, '0');
  return `${hour}:${min} ${period}`;
}

/** Returns live wall-clock as "HH:MM:SS AM/PM" for the header clock. */
export function formatCurrentTime() {
  const now    = new Date();
  const rawH   = now.getHours();
  const period = rawH >= 12 ? 'PM' : 'AM';
  const hour   = String(rawH % 12 || 12).padStart(2, '0');
  const min    = String(now.getMinutes()).padStart(2, '0');
  const sec    = String(now.getSeconds()).padStart(2, '0');
  return `${hour}:${min}:${sec} ${period}`;
}

/** How many minutes until targetMinutes from now? Clamped to 0. */
export function calculateTimeDifference(targetMinutes) {
  return Math.max(0, targetMinutes - getCurrentMinutes());
}

/** Human-friendly duration: 0→"now", 45→"45 min", 90→"1 hr 30 min" */
export function formatCountdown(minutes, t) {
  if (minutes <= 0) return t('timeNow');
  if (minutes < 60) return `${minutes} ${t('timeMin')}`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0
    ? `${h} ${t('timeHr')} ${m} ${t('timeMin')}`
    : `${h} ${t('timeHr')}`;
}
