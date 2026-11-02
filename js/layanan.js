// Moto Ijo · layanan: test ride (form + WhatsApp hand-off), simulasi cicilan (flat rate), servis, garansi.
// Facts from js/site.js, models and prices from data/models.js. Nothing is stored; every message is built in the page.
import { SITE, wa, icon, CICIL, cicilan, MITRA, mitraBy } from './site.js';
import { SERIES, MODELS, bySlug } from '../data/models.js';

const page = document.body.dataset.page;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const group = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const rp = n => 'Rp ' + group(n);
const digits = s => String(s ?? '').replace(/\D/g, '');
const num = s => { const t = String(s ?? '').trim().replace(/\./g, '').replace(',', '.'); return t === '' ? NaN : Number(t); };
const qs = new URLSearchParams(location.search);
const qModel = (k = 'm') => { const v = qs.get(k); return v ? (bySlug(v) || MODELS.find(m => m.id === v)) : undefined; };   // ?m= takes a slug or a model id

/* ---------- shared: site facts, WhatsApp links, model lists ---------- */
$$('[data-site]').forEach(el => {
  const k = el.dataset.site;
  const lower = s => s.charAt(0).toLowerCase() + s.slice(1);
  if (k === 'hoursLower') el.textContent = lower(SITE.hours);
  else if (k === 'landmarkLower') el.textContent = lower(SITE.landmark);
  else if (SITE[k]) el.textContent = SITE[k];
});
$$('[data-maps]').forEach(a => { a.href = SITE.maps; });
$$('[data-wa]').forEach(a => { a.href = wa(a.dataset.wa || undefined); });

/* line-up grouped by series, cheapest first; models without a price ("Tanya harga") go last in their series */
const LINEUP = Object.values(SERIES).map(s => ({ s,
  list: MODELS.filter(m => m.series === s.key).sort((a, b) => (a.priceNum ?? Infinity) - (b.priceNum ?? Infinity) || 0) }));
const span = (list, k, unit) => { const v = list.map(m => m[k]); const lo = Math.min(...v), hi = Math.max(...v); return `${lo === hi ? lo : `${lo}–${hi}`} ${unit}`; };
const priceText = m => m.price || 'Tanya harga';
function modelOptions(select, { withPrice = false, custom = false } = {}) {
  LINEUP.forEach(({ s, list }) => {
    const og = document.createElement('optgroup'); og.label = s.label;
    list.forEach(m => og.append(new Option(withPrice ? `${m.short} · ${priceText(m)}` : m.name, m.slug)));
    select.append(og);
  });
  if (custom) select.append(new Option('Harga lain (isi sendiri)', 'custom'));
}

// in-page anchors: smooth through Lenis when it is running
$$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const t = a.getAttribute('href').length > 1 && $(a.getAttribute('href'));
  if (!t) return;
  e.preventDefault();
  const off = -(document.querySelector('.nav')?.offsetHeight || 76) - 12;
  if (window.__lenis && !reduced) window.__lenis.scrollTo(t, { offset: off });
  else t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
}));

/* ---------- servis + garansi: model picker feeds the WhatsApp messages ---------- */
const withModel = (m, a, b) => (m ? a(m) : b);
const TPL = {
  servis: m => withModel(m, x => `Halo Moto Ijo, saya mau servis ${x.name}. Keluhannya: `, 'Halo Moto Ijo, saya mau servis motor GODA. Model dan keluhannya: '),
  sparepart: m => withModel(m, x => `Halo Moto Ijo, saya cari sparepart untuk ${x.name}. Bagiannya: `, 'Halo Moto Ijo, saya cari sparepart GODA. Model dan bagiannya: '),
  // servis hero (CTA pass, 1 Nov 2026): one WhatsApp button for both servis and sparepart
  'servis-sparepart': m => withModel(m, x => `Halo Moto Ijo, saya mau tanya servis atau sparepart untuk ${x.name}. `, 'Halo Moto Ijo, saya mau tanya servis atau sparepart motor GODA. Modelnya: '),
  garansi: m => withModel(m, x => `Halo Moto Ijo, saya mau tanya garansi untuk ${x.name}.`, 'Halo Moto Ijo, saya mau tanya garansi GODA.'),
  'garansi-klaim': m => withModel(m, x => `Halo Moto Ijo, saya mau klaim garansi untuk ${x.name}. Saya kirim video unboxing dan keluhannya.`, 'Halo Moto Ijo, saya mau klaim garansi. Saya kirim video unboxing, nama model, dan keluhannya.'),
  'servis-syarat': m => `Halo Moto Ijo, saya mau tanya syarat gratis jasa servis seumur hidup dari GODA${m ? ' untuk ' + m.name : ''}. Apakah berlaku untuk pembelian lewat Moto Ijo?`,
  'garansi-syarat': m => `Halo Moto Ijo, saya mau tanya syarat gratis jasa servis seumur hidup dari GODA${m ? ' untuk ' + m.name : ''}.`,
  'garansi-cakupan': m => `Halo Moto Ijo, saya mau tanya cakupan penggantian unit baru dari GODA${m ? ' untuk ' + m.name : ''}.`,
  'garansi-lain': m => `Halo Moto Ijo, saya mau tanya syarat klaim kerusakan selain video unboxing${m ? ' untuk ' + m.name : ''}.`,
  'garansi-moto': m => `Halo Moto Ijo, apakah garansi GODA berlaku untuk pembelian lewat Moto Ijo${m ? ' (' + m.name + ')' : ''}?`,
};
function initPicker() {
  const sel = $('[data-picker]');
  if (sel) {
    modelOptions(sel);
    const qm = qModel(); if (qm) sel.value = qm.slug;
    sel.addEventListener('change', wire);
  }
  function wire() {
    const m = sel ? bySlug(sel.value) : qModel();   // no picker on the page: a ?m=<slug> link still names the model
    $$('[data-wa-tpl]').forEach(a => { const f = TPL[a.dataset.waTpl]; if (f) a.href = wa(f(m)); });
  }
  wire();
}

/* ---------- test ride: stepped booking card (model chips, day + hour, name). No phone field: the chat comes from the visitor's own WhatsApp ---------- */
const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const SLOTS = [9, 10, 11, 12, 13, 14, 15];   // test ride until 15.00 at the latest (client, 22 Okt 2026); the hour is a request, not a booking
const slotText = h => `${String(h).padStart(2, '0')}.00`;
const UNSURE = 'saran';
const thumb = m => m.img.replace(/\.webp$/, '-400.webp');

function initTestRide() {
  const form = $('#tr-form'); if (!form) return;
  const handoff = $('#handoff');
  const f = { nama: $('#f-nama'), catatan: $('#f-catatan') };

  /* step 1: a two-tab series switch (Motorbike first), one series of chips at a time, "Belum yakin" always in view.
     One radio group across both panels, so a pick survives a tab switch. Panels share one reserved height (no shift):
     a series with 4 models or fewer gets bigger, stacked chips that fill the same space */
  const chipsEl = $('#mchips');
  const chip = (value, inner, label, cls = '') => `<label class="mchip${cls}"><input type="radio" name="mpick" value="${value}" aria-label="${esc(label)}"><span class="mchip__in">${inner}</span></label>`;
  const modelChip = m => chip(m.slug,
    `<img src="${thumb(m)}" alt="" width="400" height="300" loading="lazy" decoding="async"><span class="mchip__t"><b>${esc(m.short)}</b><small>${priceText(m)}</small></span>`,
    `${m.name}, ${SERIES[m.series]?.label || ''}, ${m.price || 'tanya harga'}`);
  const qm = qModel();
  let cur = LINEUP.findIndex(g => g.s.key === qm?.series); if (cur < 0) cur = 0;
  chipsEl.innerHTML = `<div class="mtabs" role="tablist" aria-label="Seri">${LINEUP.map(({ s, list }, i) =>
      `<button type="button" class="mtab" role="tab" id="mt-${s.key}" aria-controls="mp-${s.key}" aria-selected="${i === cur}" tabindex="${i === cur ? 0 : -1}"><b>${s.label}</b><small>${list.length} model, ${span(list, 'powerW', 'W')}</small></button>`).join('')}</div>`
    + chip(UNSURE, `<span class="mchip__ic">${icon('info-circle')}</span><span class="mchip__t"><b>Belum yakin</b><small>Minta saran</small></span>`, 'Belum yakin, minta saran', ' mchip--x')
    + LINEUP.map(({ s, list }, i) => `<div class="mpanel" role="tabpanel" id="mp-${s.key}" aria-labelledby="mt-${s.key}"${i === cur ? '' : ' hidden'}>
      <div class="mchips${list.length <= 4 ? ' mchips--big' : ''}">${list.map(modelChip).join('')}</div></div>`).join('');
  /* a thumbnail that is not there yet falls back to the plain icon (cut-outs are added per model) */
  $$('img', chipsEl).forEach(img => img.addEventListener('error', () => { img.outerHTML = `<span class="mchip__ic">${icon('motorbike')}</span>`; }, { once: true }));
  const tabs = $$('.mtab', chipsEl), panels = $$('.mpanel', chipsEl);
  function showTab(i, focus) {
    cur = (i + tabs.length) % tabs.length;
    tabs.forEach((t, k) => { t.setAttribute('aria-selected', String(k === cur)); t.tabIndex = k === cur ? 0 : -1; });
    panels.forEach((p, k) => { p.hidden = k !== cur; });
    if (focus) tabs[cur].focus();
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => showTab(i));
    t.addEventListener('keydown', e => {
      const to = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (to !== undefined) { e.preventDefault(); showTab(to, true); }
    });
  });
  const picks = $$('input[name="mpick"]', chipsEl);
  const picked = () => picks.find(r => r.checked)?.value || '';
  const modelSlug = picked;
  if (qm) { const r = picks.find(x => x.value === qm.slug); if (r) r.checked = true; }
  chipsEl.addEventListener('change', () => { recheckIfErr('model'); paintSum(); });

  /* step 2: day tiles + time chips */
  const daysEl = $('#days'), timesEl = $('#times');
  // the showroom's clock (WIB), whatever the visitor's device says
  const jkt = () => { const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date()).map(x => [x.type, x.value])); return { y: +p.year, mo: +p.month - 1, d: +p.day, h: +p.hour, mi: +p.minute }; };
  const today = jkt();
  const dates = Array.from({ length: 7 }, (_, i) => new Date(today.y, today.mo, today.d + i));
  daysEl.innerHTML = dates.map((d, i) => `<label class="day"><input type="radio" name="hari" value="${i}" aria-label="${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]}"><span><small>${HARI[d.getDay()].slice(0, 3)}</small><b>${d.getDate()}</b><small>${BULAN[d.getMonth()]}</small></span></label>`).join('');
  timesEl.innerHTML = SLOTS.map(h => `<label class="tchip"><input type="radio" name="jam" value="${h}" aria-label="Jam ${slotText(h)}"><span class="chip">${slotText(h)}</span></label>`).join('');
  const dayRadios = $$('input[name="hari"]', daysEl), timeRadios = $$('input[name="jam"]', timesEl);
  const minutesLeft = h => { const n = jkt(); return h * 60 - (n.h * 60 + n.mi); };
  const isToday = i => i === 0;
  function syncTimes() {
    const sel = dayRadios.find(r => r.checked);
    timeRadios.forEach(r => { r.disabled = !!sel && isToday(+sel.value) && minutesLeft(+r.value) < 60; if (r.disabled && r.checked) r.checked = false; });
  }
  dayRadios[0].disabled = SLOTS.every(h => minutesLeft(h) < 60);   // nothing left today
  daysEl.addEventListener('change', () => { syncTimes(); recheckIfErr('waktu'); paintSum(); });
  timesEl.addEventListener('change', () => { recheckIfErr('waktu'); paintSum(); });

  /* live summary right above the button: "Aura · Sab 2 Nov · 10.00" */
  const sumT = $('#tr-sum-t'), sum = $('#tr-sum');
  function paintSum() {
    const v = modelSlug(), m = bySlug(v), d = dayRadios.find(r => r.checked), t = timeRadios.find(r => r.checked);
    const parts = [m ? m.short : v === UNSURE ? 'Model: minta saran' : null,
      d ? (dt => `${HARI[dt.getDay()].slice(0, 3)} ${dt.getDate()} ${BULAN[dt.getMonth()]}`)(dates[+d.value]) : null,
      t ? slotText(+t.value) : null];
    const done = parts.filter(Boolean);
    const miss = [!parts[0] && 'model', !parts[1] && 'hari', !parts[2] && 'jam'].filter(Boolean);
    sumT.textContent = done.length ? done.join(' · ') + (miss.length ? ` · pilih ${miss.join(' dan ')}` : '') : 'Pilih model, hari, dan jam.';
    sum.classList.toggle('is-ready', !miss.length);
  }

  /* validation */
  const box = k => $(`[data-field="${k}"]`);
  const MSG = { nama: 'Isi nama kamu.', model: 'Pilih model, atau pilih "Belum yakin".', waktu: 'Pilih hari dan jam.', hari: 'Pilih harinya.', jam: 'Pilih jamnya.', lewat: 'Jam itu sudah lewat. Pilih jam lain.' };
  function setErr(k, msg) {
    const b = box(k), e = $(':scope > .err', b) || $('.err', b);
    b.classList.add('is-error'); e.textContent = msg; e.hidden = false;
    if (k === 'nama') $('input', b).setAttribute('aria-invalid', 'true');
  }
  function clearErr(k) {
    const b = box(k), e = $(':scope > .err', b) || $('.err', b); if (!e) return;
    b.classList.remove('is-error'); e.hidden = true;
    $$('[aria-invalid]', b).forEach(i => i.removeAttribute('aria-invalid'));
  }
  const checks = {
    model: () => picked() ? true : MSG.model,
    waktu: () => {
      const d = dayRadios.find(r => r.checked), t = timeRadios.find(r => r.checked);
      if (!d && !t) return MSG.waktu;
      if (!d) return MSG.hari;
      if (!t) return MSG.jam;
      if (isToday(+d.value) && minutesLeft(+t.value) <= 0) return MSG.lewat;
      return true;
    },
    nama: () => f.nama.value.trim().length >= 2 || MSG.nama,
  };
  const recheck = k => { const r = checks[k](); r === true ? clearErr(k) : setErr(k, r); };
  const recheckIfErr = k => { if (box(k).classList.contains('is-error')) recheck(k); };
  const order = ['model', 'waktu', 'nama'];
  const focusOf = k => {
    if (k === 'model') return $('.mpanel:not([hidden]) input', chipsEl) || picks[0];
    if (k === 'waktu') return dayRadios.find(r => r.checked) ? (timeRadios.find(r => !r.disabled) || dayRadios[1]) : (dayRadios.find(r => !r.disabled) || dayRadios[1]);
    return f[k];
  };
  function validate() {
    let first = null;
    order.forEach(k => { const r = checks[k](); if (r === true) clearErr(k); else { setErr(k, r); first ||= k; } });
    if (first) { const el = focusOf(first); el?.focus({ preventScroll: true }); box(first).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }); }
    return !first;
  }
  f.nama.addEventListener('blur', () => { if (f.nama.value.trim() !== '') recheck('nama'); });
  f.nama.addEventListener('input', () => { if (box('nama').classList.contains('is-error') && checks.nama() === true) clearErr('nama'); });

  function compose() {
    const m = bySlug(modelSlug()), d = dates[+dayRadios.find(r => r.checked).value], jam = slotText(+timeRadios.find(r => r.checked).value);
    const when = `hari ${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]}, jam ${jam}`;
    const ride = m ? `Saya mau test ride ${m.name} ${when}. Bisa?` : `Saya mau test ride ${when}, tapi belum yakin modelnya. Bisa dibantu pilih?`;
    const note = f.catatan.value.trim();
    return `Halo Moto Ijo, saya ${f.nama.value.trim()}. ${ride}${note ? ` Catatan: ${note}` : ''}`;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validate()) return;
    const msg = compose(), url = wa(msg);
    const w = window.open(url, '_blank'); if (w) w.opener = null;           // new tab; the hand-off button covers a blocked pop-up
    $('#handoff-msg').textContent = msg; $('#handoff-open').href = url;
    form.hidden = true; handoff.hidden = false;
    handoff.focus({ preventScroll: true });
    handoff.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
  });
  $('#handoff-edit').addEventListener('click', () => { handoff.hidden = true; form.hidden = false; f.nama.focus(); });
  paintSum();
}

/* ---------- showroom photos: swipe carousel, read from assets/img/showroom/manifest.json ---------- */
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
async function initShots() {
  const root = $('[data-shots]'); if (!root) return;
  const track = $('[data-shots-track]', root), bar = $('[data-shots-bar]', root), count = $('[data-shots-count]', root);
  const prev = $('[data-shots-prev]', root), next = $('[data-shots-next]', root);
  const DIR = 'assets/img/showroom/', base = f => String(f).split('/').pop();
  const first = $('img', track), firstFile = base(first.getAttribute('src'));
  try {
    const r = await fetch(DIR + 'manifest.json', { cache: 'no-cache' });
    const list = r.ok ? await r.json() : [];
    (Array.isArray(list) ? list : []).filter(p => p && p.file).forEach(p => {
      if (base(p.file) === firstFile) { if (p.alt) first.alt = p.alt; return; }
      const src = String(p.file).includes('/') ? p.file : DIR + p.file;
      track.insertAdjacentHTML('beforeend', `<div class="shots__slide" role="group" aria-roledescription="slide"><img src="${esc(src)}" alt="${esc(p.alt)}" width="${+p.w || 900}" height="${+p.h || 1200}" loading="lazy" decoding="async"></div>`);
    });
  } catch { /* no manifest: the storefront photo stays on its own */ }
  const slides = $$('.shots__slide', track), n = slides.length;
  slides.forEach((s, i) => s.setAttribute('aria-label', `${i + 1} dari ${n}`));
  if (n < 2) { root.classList.add('is-single'); bar.hidden = true; return; }
  root.classList.add('is-multi');
  track.tabIndex = 0; track.setAttribute('aria-label', 'Foto showroom. Geser, atau pakai tombol panah kiri dan kanan.');

  let cur = -1;
  const at = () => {
    const x = track.scrollLeft;
    if (x >= track.scrollWidth - track.clientWidth - 4) return n - 1;
    let best = 0; slides.forEach((s, i) => { if (Math.abs(s.offsetLeft - x) < Math.abs(slides[best].offsetLeft - x)) best = i; });
    return best;
  };
  const paint = () => {
    const i = at(); if (i === cur) return; cur = i;
    count.textContent = `${i + 1}/${n}`;
    prev.disabled = i === 0; next.disabled = i === n - 1;
  };
  const go = i => { i = Math.max(0, Math.min(n - 1, i)); track.scrollTo({ left: slides[i].offsetLeft, behavior: reduced ? 'auto' : 'smooth' }); };
  let tick = false;
  track.addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(() => { tick = false; paint(); }); } }, { passive: true });
  prev.addEventListener('click', () => go(cur - 1));
  next.addEventListener('click', () => go(cur + 1));
  track.addEventListener('keydown', e => {
    const k = { ArrowLeft: cur - 1, ArrowRight: cur + 1, Home: 0, End: n - 1 }[e.key];
    if (k === undefined) return;
    e.preventDefault(); go(k);
  });
  paint();
}

/* ---------- simulasi cicilan: one formula site-wide (cicilan() in site.js = GODA's simulator, keputusan 24).
   Buyers pick model, DP chip and tenor only; the rate is fixed (CICIL.rate). Opens on Aura, DP 20%, 12 bulan.
   A model without a price ("Tanya harga") never shows a number: the result turns into a WhatsApp question with the chosen DP and tenor ---------- */
const DP_CHIPS = [0, 10, 20, 30];
const DEFAULT_MODEL = 'aura-gd008';
function initCalc() {
  const form = $('#calc-form'); if (!form) return;
  const el = { model: $('#c-model'), harga: $('#c-harga'), eq: $('#dp-eq'),
    fixed: $('#harga-fixed'), manual: $('#harga-manual'), hv: $('#harga-v'), hn: $('#harga-note'), img: $('#harga-img'),
    label: $('#res-label'), num: $('#res-num'), sr: $('#res-sr'), hint: $('#res-hint'), rows: $('#res-rows'),
    pokok: $('#res-pokok'), fee: $('#res-fee'), bungaOut: $('#res-bunga'), total: $('#res-total'), cta: $('#res-cta'), ctaT: $('#res-cta-t'),
    tr: $('#res-tr'), live: $('#res-live'), liveBox: $('#res-livebox'), rate: $('#res-rate') };
  const pctTxt = n => String(Math.round(n * 10000) / 100).replace('.', ',');
  const st = { dp: CICIL.dpPct, tenor: CICIL.tenor, mitra: mitraBy(qs.get('mitra')).key, touched: false };
  modelOptions(el.model, { withPrice: true, custom: true });
  el.img?.addEventListener('error', () => { el.img.style.visibility = 'hidden'; });   /* cut-out not there yet: keep the space, hide the broken image */
  el.img?.addEventListener('load', () => { el.img.style.visibility = ''; });
  const qm = qModel();
  el.model.value = qm ? qm.slug : qs.get('m') === 'custom' ? 'custom' : DEFAULT_MODEL;
  /* ?tenor= and ?dp= (percent) come from the home's "Hitung lengkap"; dp snaps to the nearest chip */
  const qt = +qs.get('tenor'); if (CICIL.tenors.includes(qt)) st.tenor = qt;
  const qd = qs.get('dp') === null ? NaN : num(qs.get('dp'));
  if (Number.isFinite(qd)) st.dp = DP_CHIPS.reduce((a, c) => (Math.abs(c - qd) < Math.abs(a - qd) ? c : a), DP_CHIPS[0]);
  if (!DP_CHIPS.includes(st.dp)) st.dp = 20;
  $('#tenor').innerHTML = CICIL.tenors.map(t => `<button type="button" class="chip" data-tenor="${t}" aria-pressed="${t === st.tenor}">${t} bulan</button>`).join('');
  $('#dp-chips').innerHTML = DP_CHIPS.map(d => `<button type="button" class="chip" data-dp="${d}" aria-pressed="${d === st.dp}">${d}%</button>`).join('');
  $('#mitra-chips').innerHTML = MITRA.map(x => `<button type="button" class="chip" data-mitra="${x.key}" aria-pressed="${x.key === st.mitra}">${x.label}</button>`).join('');

  const sel = () => bySlug(el.model.value);
  const asking = () => { const m = sel(); return !!m && !m.price; };   // listed model, no price yet
  const getPrice = () => {
    const m = sel();
    if (m) return m.priceNum || NaN;
    const n = Number(digits(el.harga.value)); return n > 0 ? n : NaN;
  };

  /* caret-safe thousands separator (manual price only) */
  function groupInput(input) {
    const pos = input.selectionStart ?? input.value.length, before = digits(input.value.slice(0, pos)).length;
    const out = digits(input.value).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); input.value = out;
    let c = 0, i = 0; for (; i < out.length && c < before; i++) if (/\d/.test(out[i])) c++;
    input.setSelectionRange?.(i, i);
  }

  /* number tween: result figure rolls to the new value (instant under reduced motion) */
  let shown = 0, raf = 0, fin = 0;
  function roll(to) {
    cancelAnimationFrame(raf); clearTimeout(fin);
    if (reduced || Math.abs(to - shown) < 1 || shown === 0) { shown = to; el.num.textContent = rp(to); return; }
    const from = shown, t0 = performance.now(), dur = 420;
    const step = t => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); shown = from + (to - from) * e; el.num.textContent = rp(shown); if (k < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    fin = setTimeout(() => { cancelAnimationFrame(raf); shown = to; el.num.textContent = rp(to); }, dur + 80);
  }

  function paintPrice() {
    const m = sel();
    el.fixed.hidden = !m; el.manual.hidden = !!m;
    if (!m) return;
    if (el.img) { el.img.src = thumb(m); el.img.alt = m.name; }
    if (m.price) {
      el.hv.textContent = m.price;
      el.hn.textContent = 'Harga dari Moto Ijo.';   // no inline WhatsApp link: the result button below is the one WhatsApp action (CTA pass, 1 Nov 2026)
    } else {
      el.hv.textContent = 'Tanya harga';
      el.hn.textContent = `Harga ${m.short} belum ada di daftar kami. Kami kirim harga dan cicilannya lewat WhatsApp.`;
    }
  }

  function update() {
    paintPrice();
    const price = getPrice(), ok = price > 0, m = sel(), ask = asking();
    const box = $('[data-field="harga"]'), err = $('#err-harga');
    const showErr = !el.manual.hidden && st.touched && !ok;
    box.classList.toggle('is-error', showErr); err.hidden = !showErr;
    showErr ? el.harga.setAttribute('aria-invalid', 'true') : el.harga.removeAttribute('aria-invalid');

    const dpTxt = st.dp ? `DP ${st.dp}%` : 'tanpa DP';
    const dpRp = ok ? Math.round(price * st.dp / 100) : 0;
    const mt = mitraBy(st.mitra), r = ok ? cicilan(price, dpRp, st.tenor, mt) : null;
    el.rate.textContent = `Cicilan lewat ${mt.label}: ${mt.terms}.`;
    $('#res-mitra').textContent = mt.label;
    $('#mitra-hint').textContent = mt.rate ? `Bunga ${pctTxt(mt.rate)}% per bulan, biaya penanganan ${pctTxt(mt.handling)}%.` : 'Cicilan 0%. Ujrah bulanan kartu belum termasuk.';
    el.label.textContent = ask ? `Cicilan ${m.short}` : 'Perkiraan cicilan per bulan';
    el.rows.hidden = ask; el.liveBox.hidden = ask;
    if (ask) { cancelAnimationFrame(raf); clearTimeout(fin); shown = 0; el.num.textContent = 'Tanya harga'; }
    else roll(r ? r.bulan : 0);
    el.live.textContent = r ? rp(r.bulan) : 'Rp 0';
    el.eq.textContent = ok ? (st.dp ? `DP ${rp(dpRp)}` : 'Tanpa DP') : ask ? (st.dp ? `DP ${st.dp}% dari harga` : 'Tanpa DP') : 'Isi harga dulu untuk melihat DP.';
    el.pokok.textContent = ok ? rp(price - dpRp) : 'Rp 0';
    el.fee.textContent = r ? rp(r.pokok - (price - dpRp)) : 'Rp 0';
    el.bungaOut.textContent = r ? rp(r.bunga) : 'Rp 0';
    el.total.textContent = r ? rp(r.total) : 'Rp 0';
    el.hint.textContent = ok ? `${st.tenor} bulan, ${st.dp ? `DP ${st.dp}% (${rp(dpRp)})` : 'tanpa DP'}.`
      : ask ? `${st.tenor} bulan, ${dpTxt}. Kirim pilihan ini, kami balas dengan harga dan cicilannya.` : 'Isi harga motornya dulu.';
    clearTimeout(update.t);
    update.t = setTimeout(() => { el.sr.textContent = r ? `Perkiraan cicilan ${rp(r.bulan)} per bulan.` : el.hint.textContent; }, 700);

    const msg = r
      ? `Halo Moto Ijo, saya mau tanya cicilan${m ? ' ' + m.name : ''}. Hitungan saya di situs: harga ${rp(price)}, ${st.dp ? `DP ${st.dp}% (${rp(dpRp)})` : 'tanpa DP'}, tenor ${st.tenor} bulan, cicilan sekitar ${rp(r.bulan)} per bulan. Bisa diajukan lewat ${mt.label}?`
      : ask ? `Halo Moto Ijo, berapa harga ${m.name}? Saya mau hitung cicilannya lewat ${mt.label}: ${dpTxt}, tenor ${st.tenor} bulan.`
      : `Halo Moto Ijo, saya mau tanya cicilan${m ? ' ' + m.name : ''}. Bisa lewat ${mt.label}?`;
    el.cta.href = wa(msg);
    el.ctaT.textContent = ask ? 'Tanya harga lewat WhatsApp' : 'Tanya cicilan lewat WhatsApp';
    el.tr.href = m ? `test-ride.html?m=${m.slug}` : 'test-ride.html';
    return ok || ask;
  }

  /* events */
  el.model.addEventListener('change', () => {
    if (el.model.value === 'custom') { el.harga.value = ''; st.touched = false; }
    update();
  });
  el.harga.addEventListener('input', () => { groupInput(el.harga); st.touched = true; update(); });
  const chips = (sel, key) => $(sel).addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    st[key] = key === 'mitra' ? b.dataset[key] : +b.dataset[key];
    $$('button', $(sel)).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    update();
  });
  chips('#tenor', 'tenor'); chips('#dp-chips', 'dp'); chips('#mitra-chips', 'mitra');
  form.addEventListener('submit', e => e.preventDefault());
  el.cta.addEventListener('click', e => { if (update()) return; e.preventDefault(); st.touched = true; update(); el.harga.focus(); });

  update();
}

/* one WhatsApp control per screen: the shell's float steps aside while a WhatsApp link in <main> is in view
   (CSS: body.wa-inview .wafloat in layanan.css; same helper as quietFloat in produk.js) */
function quietFloat() {
  const scope = $('main'); if (!scope || !('IntersectionObserver' in window)) return;
  const on = new Set();
  const io = new IntersectionObserver(es => {
    es.forEach(e => (e.isIntersecting ? on.add(e.target) : on.delete(e.target)));
    document.body.classList.toggle('wa-inview', on.size > 0);
  });
  $$('a[href*="wa.me"]', scope).forEach(a => io.observe(a));
}

initPicker();
quietFloat();
if (page === 'test-ride') { initTestRide(); initShots(); }
if (page === 'simulasi-cicilan') initCalc();
