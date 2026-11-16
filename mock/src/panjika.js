// Panjika calculations: Bengali date, tithi, nakshatra, sunrise and sunset.
// Everything is computed from the sun's and moon's positions (astronomy-engine), for Gede, Nadia, in IST.
// Puja times and wedding dates are NOT computed here: the committee enters them from the club's panjika.
import * as A from 'astronomy-engine';

export const PLACE = { en: 'Gede, Nadia', bn: 'গেদে, নদিয়া', lat: 23.0567, lon: 88.7967 };
const OBS = new A.Observer(PLACE.lat, PLACE.lon, 15);
const IST = 330 * 60000; // +5:30
const DAY = 86400000;

export const TITHI = [
  ['Pratipada', 'প্রতিপদ'], ['Dwitiya', 'দ্বিতীয়া'], ['Tritiya', 'তৃতীয়া'], ['Chaturthi', 'চতুর্থী'], ['Panchami', 'পঞ্চমী'],
  ['Shashthi', 'ষষ্ঠী'], ['Saptami', 'সপ্তমী'], ['Ashtami', 'অষ্টমী'], ['Navami', 'নবমী'], ['Dashami', 'দশমী'],
  ['Ekadashi', 'একাদশী'], ['Dwadashi', 'দ্বাদশী'], ['Trayodashi', 'ত্রয়োদশী'], ['Chaturdashi', 'চতুর্দশী'],
];
const PURNIMA = ['Purnima', 'পূর্ণিমা'];
const AMAVASYA = ['Amavasya', 'অমাবস্যা'];
/** Name of tithi 0–29 (0–14 shukla, 15–29 krishna). */
export const tithiName = (i) => (i === 14 ? PURNIMA : i === 29 ? AMAVASYA : TITHI[i % 15]);
export const PAKSHA = [['Shukla paksha', 'শুক্লপক্ষ'], ['Krishna paksha', 'কৃষ্ণপক্ষ']];

export const NAKSHATRA = [
  ['Ashwini', 'অশ্বিনী'], ['Bharani', 'ভরণী'], ['Krittika', 'কৃত্তিকা'], ['Rohini', 'রোহিণী'], ['Mrigashira', 'মৃগশিরা'],
  ['Ardra', 'আর্দ্রা'], ['Punarvasu', 'পুনর্বসু'], ['Pushya', 'পুষ্যা'], ['Ashlesha', 'অশ্লেষা'], ['Magha', 'মঘা'],
  ['Purva Phalguni', 'পূর্বফাল্গুনী'], ['Uttara Phalguni', 'উত্তরফাল্গুনী'], ['Hasta', 'হস্তা'], ['Chitra', 'চিত্রা'],
  ['Swati', 'স্বাতী'], ['Vishakha', 'বিশাখা'], ['Anuradha', 'অনুরাধা'], ['Jyeshtha', 'জ্যেষ্ঠা'], ['Mula', 'মূলা'],
  ['Purva Ashadha', 'পূর্বাষাঢ়া'], ['Uttara Ashadha', 'উত্তরাষাঢ়া'], ['Shravana', 'শ্রবণা'], ['Dhanishtha', 'ধনিষ্ঠা'],
  ['Shatabhisha', 'শতভিষা'], ['Purva Bhadrapada', 'পূর্বভাদ্রপদ'], ['Uttara Bhadrapada', 'উত্তরভাদ্রপদ'], ['Revati', 'রেবতী'],
];

export const BN_MONTHS = [
  ['Boishakh', 'বৈশাখ'], ['Joishtho', 'জ্যৈষ্ঠ'], ['Asharh', 'আষাঢ়'], ['Shrabon', 'শ্রাবণ'], ['Bhadro', 'ভাদ্র'], ['Ashwin', 'আশ্বিন'],
  ['Kartik', 'কার্তিক'], ['Agrahayan', 'অগ্রহায়ণ'], ['Poush', 'পৌষ'], ['Magh', 'মাঘ'], ['Falgun', 'ফাল্গুন'], ['Choitro', 'চৈত্র'],
];
export const WEEKDAYS = [
  ['Sunday', 'রবিবার'], ['Monday', 'সোমবার'], ['Tuesday', 'মঙ্গলবার'], ['Wednesday', 'বুধবার'],
  ['Thursday', 'বৃহস্পতিবার'], ['Friday', 'শুক্রবার'], ['Saturday', 'শনিবার'],
];

/* ---------- IST day helpers. A "day key" is 'YYYY-MM-DD' in IST. ---------- */
export const istMidnight = (y, m, d) => new Date(Date.UTC(y, m - 1, d) - IST);
export const keyOf = (date) => new Date(date.getTime() + IST).toISOString().slice(0, 10);
export const parseKey = (k) => { const [y, m, d] = k.split('-').map(Number); return { y, m, d }; };
export const addDays = (k, n) => { const { y, m, d } = parseKey(k); return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10); };
export const todayKey = () => keyOf(new Date());
/** Clock time in IST, as [hours 0–23, minutes]. */
export const istHM = (date) => { const t = new Date(date.getTime() + IST); return [t.getUTCHours(), t.getUTCMinutes()]; };

/* ---------- Sidereal longitude (Lahiri ayanamsa) ---------- */
const ayanamsa = (t) => 23.85306 + 0.0139663 * ((t.ut) / 365.25); // degrees; t.ut = days since J2000
const norm = (x) => ((x % 360) + 360) % 360;
const sunSid = (t) => norm(A.SunPosition(t).elon - ayanamsa(t));
const moonSid = (t) => norm(A.EclipticGeoMoon(t).lon - ayanamsa(t));

/** Find when f(t) (a longitude, increasing) crosses `target`, between dates a and b. */
function crossing(f, target, a, b) {
  const g = (d) => { const v = norm(f(A.MakeTime(d)) - target); return v > 180 ? v - 360 : v; };
  let lo = a.getTime(), hi = b.getTime();
  if (g(new Date(lo)) >= 0 || g(new Date(hi)) < 0) return null;
  for (let i = 0; i < 40 && hi - lo > 30000; i++) { const mid = (lo + hi) / 2; if (g(new Date(mid)) < 0) lo = mid; else hi = mid; }
  return new Date(hi);
}

/* ---------- Bengali (Bangabda) date ---------- */
const sankrantiCache = new Map();
/** Sankranti (sun entering sidereal rashi r) nearest before `before`. */
function sankranti(r, before) {
  const key = `${r}:${before.getUTCFullYear()}:${before.getUTCMonth()}`;
  if (sankrantiCache.has(key)) return sankrantiCache.get(key);
  const target = r * 30;
  // The sun moves ~1°/day; search the 40 days before
  let a = new Date(before.getTime() - 40 * DAY);
  let hit = null;
  for (let s = a.getTime(); s < before.getTime() + DAY; s += 4 * DAY) {
    hit = crossing(sunSid, target, new Date(s), new Date(s + 4 * DAY));
    if (hit) break;
  }
  sankrantiCache.set(key, hit);
  return hit;
}
/**
 * Bengali date for an IST day. West Bengal rule: a month begins on the civil day after its sankranti
 * (sankranti before midnight → next day; the hours after midnight belong to the previous day, so the result is the same).
 */
export function bengaliDate(k) {
  const { y, m, d } = parseKey(k);
  const noon = new Date(istMidnight(y, m, d).getTime() + DAY / 2);
  let r = Math.floor(sunSid(A.MakeTime(noon)) / 30);
  let s = sankranti(r, noon);
  let start = addDays(keyOf(s), 1);
  if (start > k) { r = (r + 11) % 12; s = sankranti(r, new Date(s.getTime() - DAY)); start = addDays(keyOf(s), 1); }
  const sd = parseKey(start);
  const day = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(sd.y, sd.m - 1, sd.d)) / DAY) + 1;
  const year = y - (m <= 4 && r >= 8 ? 594 : 593);
  return { month: r, day, year, firstDay: day === 1 };
}

/* ---------- Sun, tithi, nakshatra ---------- */
export function sunTimes(k) {
  const { y, m, d } = parseKey(k);
  const t0 = A.MakeTime(istMidnight(y, m, d));
  const rise = A.SearchRiseSet(A.Body.Sun, OBS, +1, t0, 1);
  const set = A.SearchRiseSet(A.Body.Sun, OBS, -1, t0, 1);
  return { rise: rise?.date, set: set?.date };
}
/** Angle between moon and sun, 0–360 (12° per tithi). */
const elong = (date) => A.MoonPhase(A.MakeTime(date));

/** Tithi prevailing at a moment, and when it began and ends. */
export function tithiAt(date) {
  const i = Math.floor(elong(date) / 12);
  const t = A.MakeTime(date);
  const end = A.SearchMoonPhase(((i + 1) * 12) % 360, t, 3)?.date;
  const start = A.SearchMoonPhase(i * 12, t.AddDays(-3), 3)?.date;
  return { i, start, end };
}
export function nakshatraAt(date) {
  const span = 360 / 27;
  const i = Math.floor(moonSid(A.MakeTime(date)) / span);
  const end = crossing(moonSid, ((i + 1) * span) % 360, date, new Date(date.getTime() + 1.5 * DAY));
  return { i, end };
}
/** Fraction of the moon lit, 0–1, and whether it is waxing. */
export function moonLight(date) {
  const e = elong(date);
  return { lit: (1 - Math.cos((e * Math.PI) / 180)) / 2, waxing: e < 180 };
}

/** Everything for one IST day. The day's tithi and nakshatra are the ones at sunrise (udaya). */
const dayCache = new Map();
export function panjikaDay(k) {
  if (dayCache.has(k)) return dayCache.get(k);
  const { y, m, d } = parseKey(k);
  const sun = sunTimes(k);
  const at = sun.rise || new Date(istMidnight(y, m, d).getTime() + 6 * 3600000);
  const tithi = tithiAt(at);
  // A second tithi can begin and end before the next sunrise (kshaya); show what follows
  const nextTithi = tithi.end ? tithiAt(new Date(tithi.end.getTime() + 60000)) : null;
  const out = {
    key: k, weekday: new Date(Date.UTC(y, m - 1, d)).getUTCDay(),
    bengali: bengaliDate(k), sun, tithi, nextTithi,
    paksha: tithi.i < 15 ? 0 : 1,
    nakshatra: nakshatraAt(at),
    moon: moonLight(at),
  };
  dayCache.set(k, out);
  return out;
}

/** The nearest day (within ±window days of `k`) whose sunrise tithi is `i`. */
export function findTithiDay(k, i, window = 16) {
  for (let n = 0; n <= window; n++) for (const s of n ? [n, -n] : [0]) { const kk = addDays(k, s); if (panjikaDay(kk).tithi.i === i) return kk; }
  return null;
}
