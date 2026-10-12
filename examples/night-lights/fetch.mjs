// Download two NASA GIBS night-light frames for the same box on two dates.
// Usage: node examples/night-lights/fetch.mjs [--check]
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {moonIllumination, differsOnlyInTime} from '../../lib/observations.mjs';

const here = new URL('.', import.meta.url);
export const snapshot = JSON.parse(await readFile(new URL('snapshot.json', here), 'utf8'));

export function check(snap = snapshot) {
  const [a, b] = snap.frames;
  return {
    comparable: differsOnlyInTime(a.url, b.url),
    moon: snap.frames.map(f => ({date: f.date, illumination: moonIllumination(f.date)}))
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = check();
  console.log('Same request except date:', result.comparable);
  for (const m of result.moon) console.log(`${m.date}: moon ${(m.illumination * 100).toFixed(0)}% lit`);
  if (!process.argv.includes('--check')) {
    await mkdir(new URL('downloads/', here), {recursive: true});
    for (const f of snapshot.frames) {
      const res = await fetch(f.url);
      if (!res.ok || !res.headers.get('content-type')?.startsWith('image/')) throw new Error(f.date + ': HTTP ' + res.status);
      await writeFile(new URL(`downloads/gaza-${f.date}.png`, here), Buffer.from(await res.arrayBuffer()));
      console.log('Saved downloads/gaza-' + f.date + '.png');
    }
  }
}
