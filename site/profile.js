// Country profile: fetches live data from the sources that allow browser requests,
// then sorts every figure into current, old or missing.
const REF_YEAR = new Date().getFullYear();
const MAX_AGE = 3;
const arNum = (v, d = 1) => v == null ? '–' : Number(v).toLocaleString('ar-EG', {maximumFractionDigits: d});
const regionAr = (() => { try { return new Intl.DisplayNames(['ar'], {type: 'region'}); } catch { return null; } })();
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));

const INDICATORS = [
  ['SP.POP.TOTL', 'السكان', v => arNum(v, 0), 'الاقتصاد والسكان'],
  ['SP.URB.TOTL.IN.ZS', 'سكان الحضر', v => arNum(v) + '٪', 'الاقتصاد والسكان'],
  ['NY.GDP.PCAP.CD', 'نصيب الفرد من الناتج', v => arNum(v, 0) + ' دولار', 'الاقتصاد والسكان'],
  ['NY.GDP.MKTP.KD.ZG', 'النمو الاقتصادي', v => arNum(v) + '٪', 'الاقتصاد والسكان'],
  ['FP.CPI.TOTL.ZG', 'التضخم', v => arNum(v) + '٪', 'الاقتصاد والسكان'],
  ['GC.DOD.TOTL.GD.ZS', 'دين الحكومة المركزية', v => arNum(v) + '٪ من الناتج', 'الاقتصاد والسكان'],
  ['SL.UEM.TOTL.ZS', 'البطالة (تقدير نموذجي)', v => arNum(v) + '٪', 'العمل والخدمات'],
  ['SL.UEM.1524.ZS', 'بطالة الشباب (تقدير نموذجي)', v => arNum(v) + '٪', 'العمل والخدمات'],
  ['SP.DYN.LE00.IN', 'متوسط العمر المتوقع', v => arNum(v) + ' سنة', 'العمل والخدمات'],
  ['SE.ADT.LITR.ZS', 'معرفة القراءة والكتابة (البالغون)', v => arNum(v) + '٪', 'العمل والخدمات'],
  ['IT.NET.USER.ZS', 'مستخدمو الإنترنت', v => arNum(v) + '٪', 'العمل والخدمات'],
  ['EG.ELC.ACCS.ZS', 'الوصول إلى الكهرباء', v => arNum(v) + '٪', 'العمل والخدمات'],
];

const get = async (url, as = 'json') => {
  const r = await fetch(url, {signal: AbortSignal.timeout(25000)});
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return as === 'text' ? r.text() : r.json();
};

let requests = [], status = {current: [], old: [], missing: []}, traps = [];
const log = (name, url) => requests.push([name, url]);
const mark = (name, year, note) => {
  if (!Number.isInteger(year)) status.missing.push(note ? `${name} (${note})` : name);
  else if (REF_YEAR - year > MAX_AGE) status.old.push(`${name}: ${year}`);
  else status.current.push(`${name}: ${year}`);
};

async function loadCountries() {
  const data = await get('https://api.worldbank.org/v2/country?format=json&per_page=400');
  const list = data[1].filter(c => c.region.value !== 'Aggregates')
    .map(c => ({id: c.id, iso2: c.iso2Code, name: (regionAr && regionAr.of(c.iso2Code)) || c.name, en: c.name}))
    .sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  $('country').innerHTML = '<option value="">اختر دولة…</option>' + list.map(c => `<option value="${c.id}">${esc(c.name)} · ${esc(c.en)}</option>`).join('');
}

function card(title, body, foot = '') {
  return `<article class="box pc"><h3>${title}</h3>${body}${foot ? `<p class="foot">${foot}</p>` : ''}</article>`;
}

async function profile(iso3) {
  requests = []; status = {current: [], old: [], missing: []}; traps = [];
  $('out').innerHTML = '<p class="note">جارٍ جلب البيانات من المصادر…</p>';
  history.replaceState(null, '', '#' + iso3);

  const cUrl = `https://api.worldbank.org/v2/country/${iso3}?format=json`;
  log('البنك الدولي — بيانات الدولة', cUrl);
  let c;
  try { c = (await get(cUrl))[1][0]; } catch (e) { $('out').innerHTML = `<p class="note">تعذّر جلب بيانات الدولة (${esc(e.message)}).</p>`; return; }
  const lat = Number(c.latitude), lon = Number(c.longitude), hasXY = Number.isFinite(lat) && Number.isFinite(lon) && c.latitude !== '';
  const nameAr = (regionAr && regionAr.of(c.iso2Code)) || c.name;

  const indUrl = `https://api.worldbank.org/v2/country/${iso3}/indicator/${INDICATORS.map(i => i[0]).join(';')}?source=2&mrnev=1&format=json&per_page=50`;
  const pipUrl = `https://api.worldbank.org/pip/v1/pip?country=${iso3}&year=all&povline=3&ppp_version=2021&format=json`;
  const iloUrl = `https://rplumber.ilo.org/data/indicator/?id=UNE_DEAP_SEX_AGE_RT_A&ref_area=${iso3}&sex=SEX_T&classif1=AGE_YTHADULT_Y15-24&timefrom=2015&format=.csv`;
  const yr = REF_YEAR - 2;
  const coaUrl = `https://api.unhcr.org/population/v1/population/?year=${yr}&coa=${iso3}&cf_type=ISO`;
  const cooUrl = `https://api.unhcr.org/population/v1/population/?year=${yr}&coo=${iso3}&cf_type=ISO`;
  const qUrl = hasXY ? `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2000-01-01&minmagnitude=5&latitude=${lat}&longitude=${lon}&maxradiuskm=500&orderby=magnitude&limit=200` : null;
  const pUrl = hasXY ? `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=T2M,PRECTOTCORR&community=RE&latitude=${lat}&longitude=${lon}&format=JSON` : null;
  const d = 0.15, since = new Date(Date.now() - 45 * 864e5).toISOString().slice(0, 10);
  const sUrl = hasXY ? `https://planetarycomputer.microsoft.com/api/stac/v1/search?collections=sentinel-2-l2a&bbox=${lon - d},${lat - d},${lon + d},${lat + d}&datetime=${since}/..&limit=20` : null;
  [['البنك الدولي — المؤشرات', indUrl], ['منصة الفقر PIP', pipUrl], ['ILOSTAT — بطالة الشباب', iloUrl], ['المفوضية — المستضافون', coaUrl], ['المفوضية — من الدولة', cooUrl], ['USGS — الزلازل', qUrl], ['NASA POWER — المناخ', pUrl], ['Planetary Computer — Sentinel-2', sUrl]].forEach(([n, u]) => u && log(n, u));

  const [ind, pip, ilo, coa, coo, quakes, power, scenes] = await Promise.allSettled([
    get(indUrl), get(pipUrl), get(iloUrl, 'text'), get(coaUrl), get(cooUrl),
    qUrl ? get(qUrl) : Promise.reject(new Error('لا إحداثيات')), pUrl ? get(pUrl) : Promise.reject(new Error('لا إحداثيات')), sUrl ? get(sUrl) : Promise.reject(new Error('لا إحداثيات'))
  ]);

  let html = `<section class="box idc"><div><h2>${esc(nameAr)}</h2><p class="small">${esc(c.name)} · ${esc(c.id)} / ${esc(c.iso2Code)}</p></div>
    <dl><div><dt>العاصمة</dt><dd>${esc(c.capitalCity || '–')}</dd></div><div><dt>الإقليم</dt><dd>${esc(c.region.value)}</dd></div><div><dt>فئة الدخل</dt><dd>${esc(c.incomeLevel.value)}</dd></div></dl></section>`;

  // World Bank indicators, grouped by theme
  let wb = {}, wbUpdated = '';
  if (ind.status === 'fulfilled' && Array.isArray(ind.value[1])) {
    wbUpdated = ind.value[0].lastupdated;
    for (const r of ind.value[1]) wb[r.indicator.id] = {year: Number(r.date), value: r.value};
  }
  for (const group of ['الاقتصاد والسكان', 'العمل والخدمات']) {
    html += `<h3 class="grp">${group}</h3><div class="pgrid">`;
    for (const [id, label, fmt, g] of INDICATORS.filter(i => i[3] === group)) {
      const r = wb[id];
      const st = !r ? 'missing' : (REF_YEAR - r.year > MAX_AGE ? 'old' : 'current');
      mark(label, r?.year);
      html += `<div class="ind ${st}"><span class="lab">${label}</span><b class="num">${r ? fmt(r.value) : 'غير متاح'}</b><span class="yr">${r ? r.year : ''}${st === 'old' ? ' <em>قديم</em>' : ''}</span></div>`;
    }
    html += '</div>';
  }
  if (ind.status === 'rejected') status.missing.push('مؤشرات البنك الدولي (' + ind.reason.message + ')');
  html += `<p class="note">البنك الدولي، أحدث قيمة متاحة لكل مؤشر (mrnev=1)${wbUpdated ? '، آخر تحديث ' + esc(wbUpdated) : ''}. «قديم» = أقدم من ${arNum(MAX_AGE, 0)} سنوات.</p>`;
  const stale = INDICATORS.filter(i => wb[i[0]] && REF_YEAR - wb[i[0]].year > MAX_AGE);
  if (stale.length) traps.push(`أحدث قيمة ليست حديثة: ${stale.map(i => i[1] + ' (' + wb[i[0]].year + ')').join('، ')}. اكتب السنة بجوار الرقم.`);

  // Complementary sources
  let cards = '';
  if (pip.status === 'fulfilled' && Array.isArray(pip.value) && pip.value.length) {
    const nat = pip.value.filter(r => r.reporting_level === 'national');
    const last = (nat.length ? nat : pip.value).reduce((a, b) => b.reporting_year > a.reporting_year ? b : a);
    mark('الفقر المدقع (PIP)', last.reporting_year);
    cards += card('الفقر المدقع', `<p class="big num">${arNum(last.headcount * 100, 2)}٪</p><p>أقل من ٣ دولارات يوميًا (تعادل ٢٠٢١)، مسح ${last.reporting_year}، ${last.welfare_type === 'consumption' ? 'استهلاك' : 'دخل'}.</p>`, 'منصة الفقر وعدم المساواة، البنك الدولي');
    if (REF_YEAR - last.reporting_year > MAX_AGE) traps.push(`آخر مسح للفقر يعود إلى ${last.reporting_year}. لا تقل «الآن».`);
  } else mark('الفقر المدقع (PIP)', undefined, 'لا مسح متاح');

  if (ilo.status === 'fulfilled') {
    const lines = ilo.value.trim().split('\n').slice(1).map(l => l.split(','));
    const rows = lines.map(c => ({time: Number(c[5].replace(/"/g, '')), v: Number(c[6]), st: (c[7] || '').replace(/"/g, ''), src: (c[1] || '').replace(/"/g, '')})).filter(r => Number.isFinite(r.v)).sort((a, b) => b.time - a.time);
    if (rows.length) {
      const r = rows[0];
      mark('بطالة الشباب (مسح ILOSTAT)', r.time);
      cards += card('بطالة الشباب ١٥–٢٤', `<p class="big num">${arNum(r.v)}٪ ${r.st === 'B' ? '<span class="flag">B</span>' : ''}</p><p>سنة ${r.time}، المصدر ${esc(r.src)}${r.src.startsWith('BA') ? ' (مسح قوة العمل)' : ''}.</p>`, 'ILOSTAT');
      if (r.st === 'B') traps.push(`بطالة الشباب في ILOSTAT لسنة ${r.time} تحمل العلامة B: انقطاع في السلسلة.`);
      const m = wb['SL.UEM.1524.ZS'];
      if (m && Math.abs(m.value - r.v) > 1) traps.push(`بطالة الشباب: التقدير النموذجي في البنك الدولي ${arNum(m.value)}٪ (${m.year}) مقابل ${arNum(r.v)}٪ في المسح (${r.time}). اذكر أيهما تنقل.`);
    } else mark('بطالة الشباب (مسح ILOSTAT)', undefined, 'لا بيانات');
  } else mark('بطالة الشباب (مسح ILOSTAT)', undefined, ilo.reason.message);

  const un = (res) => res.status === 'fulfilled' ? res.value.items?.[0] : null;
  const h = un(coa), o = un(coo);
  if (h || o) {
    mark('اللاجئون (المفوضية)', yr);
    cards += card('اللجوء', `<p><b class="num">${arNum(+h?.refugees || 0, 0)}</b> لاجئ و<b class="num">${arNum(+h?.asylum_seekers || 0, 0)}</b> طالب لجوء تستضيفهم الدولة.</p><p><b class="num">${arNum(+o?.refugees || 0, 0)}</b> لاجئ من الدولة في الخارج.</p>`, `المفوضية، سنة ${yr}. لا تشمل لاجئي فلسطين لدى الأونروا.`);
    const internal = h?.coa || o?.coo;
    if (internal && internal !== iso3) traps.push(`رمز الدولة الداخلي عند المفوضية هو ${esc(internal)}، لا ${esc(iso3)}. استخدم cf_type=ISO.`);
  } else mark('اللاجئون (المفوضية)', undefined, 'تعذّر الجلب');

  if (power.status === 'fulfilled') {
    const p = power.value.properties.parameter;
    cards += card('المناخ عند العاصمة', `<p class="big num">${arNum(p.T2M.ANN)}°م</p><p>متوسط الحرارة السنوي، والأمطار ${arNum(p.PRECTOTCORR.ANN * 365, 0)} مم في السنة تقريبًا.</p>`, 'NASA POWER، متوسطات مناخية من نماذج وأقمار صناعية لنقطة واحدة');
  } else status.missing.push('المناخ (NASA POWER)');

  if (quakes.status === 'fulfilled') {
    const f = quakes.value.features;
    cards += card('الزلازل', `<p><b class="num">${arNum(f.length, 0)}</b> زلزالًا بقوة ٥ فأكثر منذ ٢٠٠٠ في نطاق ٥٠٠ كم من العاصمة.</p>${f.slice(0, 3).map(q => `<p class="small">${arNum(q.properties.mag)} · ${esc(q.properties.place)} · ${new Date(q.properties.time).toISOString().slice(0, 10)}</p>`).join('')}`, 'USGS. الدائرة قد تتجاوز حدود الدولة.');
  } else status.missing.push('الزلازل (USGS)');

  if (scenes.status === 'fulfilled') {
    const f = scenes.value.features.map(s => ({d: s.properties.datetime.slice(0, 10), cc: s.properties['eo:cloud_cover']})).sort((a, b) => b.d.localeCompare(a.d));
    const clear = f.filter(s => s.cc < 20);
    cards += card('صور الأقمار الصناعية', f.length ? `<p><b class="num">${arNum(f.length, 0)}</b> مشهدًا من Sentinel-2 حول العاصمة في آخر ٤٥ يومًا، منها <b class="num">${arNum(clear.length, 0)}</b> بسحب أقل من ٢٠٪.</p><p class="small">الأحدث: ${f[0].d}، سحب ${arNum(f[0].cc, 0)}٪.</p>` : '<p>لا مشاهد في آخر ٤٥ يومًا.</p>', 'Planetary Computer. نسبة السحب للمربع كله لا للمدينة.');
  } else status.missing.push('صور Sentinel-2 (Planetary Computer)');

  html += `<h3 class="grp">مصادر مكمّلة</h3><div class="pcards">${cards}</div>`;

  html += `<h3 class="grp">المتاح والناقص</h3><div class="avail">
    <div><h4>حديث</h4><ul>${status.current.map(x => `<li>${esc(x)}</li>`).join('') || '<li>–</li>'}</ul></div>
    <div><h4>قديم</h4><ul>${status.old.map(x => `<li>${esc(x)}</li>`).join('') || '<li>–</li>'}</ul></div>
    <div><h4>غائب</h4><ul>${status.missing.map(x => `<li>${esc(x)}</li>`).join('') || '<li>–</li>'}</ul></div></div>
    <p class="note">من الخادم فقط (لا تعمل من المتصفح): توقعات صندوق النقد <span class="mono">imf.org/external/datamapper/api/v1/NGDP_RPCH/${esc(iso3)}</span>، ومنظمة الصحة العالمية <span class="mono">ghoapi.azureedge.net/api/WHOSIS_000001</span>. اطلبهما من المهارة أو من بايثون أو R.</p>`;

  if (traps.length) html += `<h3 class="grp">فخاخ ظهرت أثناء الجمع</h3><ul class="traps">${traps.map(t => `<li>${t}</li>`).join('')}</ul>`;
  html += `<details class="reqs"><summary>الطلبات (${arNum(requests.length, 0)}) · استُرجعت ${new Date().toISOString().slice(0, 10)}</summary><ol>${requests.map(([n, u]) => `<li>${esc(n)}<div class="code mono">${esc(u)}</div></li>`).join('')}</ol></details>`;
  $('out').innerHTML = html;
}

$('country').addEventListener('change', e => e.target.value && profile(e.target.value));
loadCountries().then(() => {
  const h = location.hash.slice(1).toUpperCase();
  if (/^[A-Z]{3}$/.test(h)) { $('country').value = h; profile(h); }
}).catch(e => { $('out').innerHTML = `<p class="note">تعذّر تحميل قائمة الدول (${esc(e.message)}).</p>`; });
