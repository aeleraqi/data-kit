// Small, dependency-free helpers shared by the examples, tests and website.
// Each function refuses to guess: incomplete or unexpected input throws.

export function readWorldBankPage(payload, indicatorId) {
  if (!Array.isArray(payload) || payload.length !== 2 || !Array.isArray(payload[1])) {
    if (Array.isArray(payload) && payload[0]?.message) throw new Error('World Bank error: ' + JSON.stringify(payload[0].message));
    throw new Error('Expected World Bank metadata and observations');
  }
  const [meta, rows] = payload;
  if (Number(meta.pages) !== 1 || Number(meta.total) !== rows.length) {
    throw new Error('Incomplete response: retrieve all pages before presenting totals');
  }
  const seen = new Set();
  return rows.map(row => {
    const country = row.countryiso3code, year = Number(row.date), value = row.value;
    if (!/^[A-Z]{3}$/.test(country) || !Number.isInteger(year)) throw new Error('Unexpected country or year');
    if (indicatorId && row.indicator?.id !== indicatorId) throw new Error('Unexpected indicator ' + row.indicator?.id);
    if (value !== null && !Number.isFinite(value)) throw new Error('Invalid value');
    const key = country + ':' + year;
    if (seen.has(key)) throw new Error('Duplicate country/year');
    seen.add(key);
    return { country, name: row.country.value, year, value, status: row.obs_status || '' };
  }).sort((a, b) => a.country.localeCompare(b.country) || a.year - b.year);
}

export function readImfSeries(payload, indicator, countries) {
  const values = payload?.values?.[indicator];
  if (!values) throw new Error('Indicator ' + indicator + ' missing from IMF response');
  const rows = [];
  for (const country of countries) {
    const series = values[country];
    if (!series) throw new Error('Country ' + country + ' missing from IMF response');
    for (const [year, value] of Object.entries(series)) rows.push({ country, year: Number(year), value });
  }
  return rows.sort((a, b) => a.country.localeCompare(b.country) || a.year - b.year);
}

// Gap between two sources for the same country and year, in percentage points.
// It reports the gap; it does not decide which source is right.
export function compareSources(a, b, years) {
  const out = [];
  for (const country of [...new Set(a.map(r => r.country))]) {
    for (const year of years) {
      const x = a.find(r => r.country === country && r.year === year)?.value ?? null;
      const y = b.find(r => r.country === country && r.year === year)?.value ?? null;
      out.push({ country, year, a: x, b: y, gapPoints: x === null || y === null ? null : y - x });
    }
  }
  return out;
}

// Rows whose displayed year differs from the year the figure was measured.
export function carriedForward(rows) {
  return rows.filter(r => Number.isInteger(r.original_year) && r.original_year !== r.year)
    .map(r => ({ ...r, yearsCarried: r.year - r.original_year }));
}

// Moon illumination (0 = new, 1 = full) from the mean synodic month.
// Accurate to about a day, which is enough to avoid comparing a dark night with a moonlit one.
const SYNODIC = 29.530588853;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);
export function moonIllumination(isoDate) {
  const t = Date.parse(isoDate + 'T00:00:00Z');
  if (Number.isNaN(t)) throw new Error('Invalid date ' + isoDate);
  const age = (((t - KNOWN_NEW_MOON) / 86400000) % SYNODIC + SYNODIC) % SYNODIC;
  return (1 - Math.cos(2 * Math.PI * age / SYNODIC)) / 2;
}

// Two map requests are comparable only if everything but TIME is identical.
export function differsOnlyInTime(urlA, urlB) {
  const a = new URL(urlA), b = new URL(urlB);
  if (a.origin + a.pathname !== b.origin + b.pathname) return false;
  const keys = new Set([...a.searchParams.keys(), ...b.searchParams.keys()]);
  for (const k of keys) if (k !== 'TIME' && a.searchParams.get(k) !== b.searchParams.get(k)) return false;
  return a.searchParams.get('TIME') !== b.searchParams.get('TIME');
}

// Latest non-empty value per indicator from a multi-indicator World Bank call (mrnev=1).
export function readWorldBankLatest(payload) {
  if (!Array.isArray(payload) || !Array.isArray(payload[1])) throw new Error('Expected World Bank metadata and observations');
  const [meta, rows] = payload;
  if (Number(meta.pages) !== 1) throw new Error('Incomplete response: retrieve all pages');
  const seen = new Set();
  return rows.map(r => {
    if (seen.has(r.indicator.id)) throw new Error('Expected one value per indicator; use mrnev=1');
    seen.add(r.indicator.id);
    return {id: r.indicator.id, label: r.indicator.value, year: Number(r.date), value: r.value, lastUpdated: meta.lastupdated};
  });
}

// A value is stale when its year is more than maxAge years before the reference year.
export function staleness(year, referenceYear, maxAge = 3) {
  if (!Number.isInteger(year)) return 'missing';
  return referenceYear - year > maxAge ? 'stale' : 'current';
}
