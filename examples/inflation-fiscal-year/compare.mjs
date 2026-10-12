// Compare World Bank (calendar year) and IMF (Egypt: fiscal year) inflation.
// Usage: node examples/inflation-fiscal-year/compare.mjs [--offline] [--save]
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {readWorldBankPage, readImfSeries, compareSources} from '../../lib/observations.mjs';

const COUNTRIES = ['EGY', 'JOR', 'MAR'];
const YEARS = [2020, 2021, 2022, 2023, 2024, 2025];
const WB = 'https://api.worldbank.org/v2/country/EGY;JOR;MAR/indicator/FP.CPI.TOTL.ZG?format=json&date=2020:2025&per_page=100';
const IMF = 'https://www.imf.org/external/datamapper/api/v1/PCPIPCH';
const here = new URL('.', import.meta.url);

async function getJson(url) {
  const res = await fetch(url, {headers: {'User-Agent': 'data-kit-example'}});
  if (!res.ok) throw new Error(url + ' returned HTTP ' + res.status);
  return res.json();
}

export async function load({offline = false} = {}) {
  if (offline) return JSON.parse(await readFile(new URL('snapshot.json', here), 'utf8'));
  const [wb, imf] = await Promise.all([getJson(WB), getJson(IMF)]);
  return {retrievedAt: new Date().toISOString().slice(0, 10), worldBank: {url: WB, response: wb}, imf: {url: IMF, response: imf}};
}

export function analyse(snap) {
  const wb = readWorldBankPage(snap.worldBank.response, 'FP.CPI.TOTL.ZG');
  const imf = readImfSeries(snap.imf.response, 'PCPIPCH', COUNTRIES);
  return compareSources(wb, imf, YEARS);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const offline = process.argv.includes('--offline');
  const snap = await load({offline});
  const rows = analyse(snap);
  console.log(`Retrieved ${snap.retrievedAt}${offline ? ' (saved snapshot)' : ''}`);
  console.log('country year  WorldBank   IMF   gap(pts)');
  for (const r of rows) {
    const f = v => v === null ? '   –  ' : v.toFixed(1).padStart(6);
    console.log(`${r.country}    ${r.year}  ${f(r.a)}   ${f(r.b)}  ${f(r.gapPoints)}`);
  }
  if (process.argv.includes('--save') && !offline) {
    await mkdir(new URL('snapshots/', here), {recursive: true});
    const name = `snapshots/${snap.retrievedAt}.json`;
    await writeFile(new URL(name, here), JSON.stringify(snap, null, 1));
    console.log('Saved ' + name);
  }
}
