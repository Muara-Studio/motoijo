// Moto Ijo · layanan: hub, test ride (form + WhatsApp hand-off), simulasi cicilan (flat rate), servis, garansi.
// Facts from js/site.js, models and prices from data/models.js. Nothing is stored; every message is built in the page.
import { SITE, wa, icon, CICIL, cicilan } from './site.js';
import { MODELS, bySlug } from '../data/models.js';

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
  if (k === 'hoursLower') el.textContent = SITE.hours.charAt(0).toLowerCase() + SITE.hours.slice(1);
  else if (SITE[k]) el.textContent = SITE[k];
});
$$('[data-maps]').forEach(a => { a.href = SITE.maps; });
$$('[data-wa]').forEach(a => { a.href = wa(a.dataset.wa || undefined); });

function modelOptions(select, { withPrice = false, custom = false } = {}) {
  const cats = {};
  MODELS.forEach(m => (cats[m.category] ||= []).push(m));
  Object.entries(cats).forEach(([cat, list]) => {
    const og = document.createElement('optgroup'); og.label = cat;
    list.forEach(m => og.append(new Option(withPrice ? `${m.short} · ${m.price || 'isi harga sendiri'}` : m.name, m.slug)));
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
  servis: m => withModel(m, x => `Halo Moto Ijo, saya mau tanya servis untuk ${x.name}.`, 'Halo Moto Ijo, saya mau tanya servis.'),
  sparepart: m => withModel(m, x => `Halo Moto Ijo, saya cari sparepart untuk ${x.name}.`, 'Halo Moto Ijo, saya cari sparepart.'),
  garansi: m => withModel(m, x => `Halo Moto Ijo, saya mau tanya klaim garansi untuk ${x.name}.`, 'Halo Moto Ijo, saya mau tanya klaim garansi.'),
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
const CHIPS = ['m1-laser', 'starship-gd299', 'venus-gd270', 'aura-gd008'];   // first four of the line-up; the rest sit under "Model lain"
const OTHER = 'lain', UNSURE = 'saran';
const thumb = m => m.img.replace(/\.webp$/, '-400.webp');

function initTestRide() {
  const form = $('#tr-form'); if (!form) return;
  const handoff = $('#handoff');
  const f = { nama: $('#f-nama'), model: $('#f-model'), catatan: $('#f-catatan') };

  /* step 1: model chips, "Model lain" opens the full list, "Belum yakin" asks for advice */
  const chipsEl = $('#mchips'), other = $('#mother');
  const chip = (value, inner, label) => `<label class="mchip"><input type="radio" name="mpick" value="${value}" aria-label="${esc(label)}"><span class="mchip__in">${inner}</span></label>`;
  chipsEl.innerHTML = CHIPS.map(bySlug).filter(Boolean).map(m => chip(m.slug,
    `<img src="${thumb(m)}" alt="" width="400" height="300" loading="eager" decoding="async"><span class="mchip__t"><b>${m.short}</b><small>${m.price || 'Tanya harga'}</small></span>`,
    `${m.name}, ${m.price || 'tanya harga'}`)).join('')
    + chip(OTHER, `<span class="mchip__ic">${icon('adjustments-horizontal')}</span><span class="mchip__t"><b>Model lain</b><small>${MODELS.length - CHIPS.length} model lagi</small></span>`, 'Model lain, pilih dari daftar')
    + chip(UNSURE, `<span class="mchip__ic">${icon('info-circle')}</span><span class="mchip__t"><b>Belum yakin</b><small>Minta saran</small></span>`, 'Belum yakin, minta saran');
  modelOptions(f.model);
  const picks = $$('input[name="mpick"]', chipsEl);
  const picked = () => picks.find(r => r.checked)?.value || '';
  const modelSlug = () => { const v = picked(); return v === OTHER ? f.model.value : v; };
  function syncOther() { other.hidden = picked() !== OTHER; }
  const qm = qModel();
  if (qm) {
    const r = picks.find(x => x.value === qm.slug);
    if (r) r.checked = true; else { picks.find(x => x.value === OTHER).checked = true; f.model.value = qm.slug; }
  }
  syncOther();
  chipsEl.addEventListener('change', () => { syncOther(); if (picked() === OTHER && !f.model.value) f.model.focus(); recheckIfErr('model'); paintSum(); });
  f.model.addEventListener('change', () => { recheckIfErr('model'); paintSum(); });

  /* step 2: day tiles + time chips */
  const daysEl = $('#days'), timesEl = $('#times');
  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + i));
  daysEl.innerHTML = dates.map((d, i) => `<label class="day"><input type="radio" name="hari" value="${i}" aria-label="${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]}"><span><small>${HARI[d.getDay()].slice(0, 3)}</small><b>${d.getDate()}</b><small>${BULAN[d.getMonth()]}</small></span></label>`).join('');
  timesEl.innerHTML = SLOTS.map(h => `<label class="tchip"><input type="radio" name="jam" value="${h}" aria-label="Jam ${slotText(h)}"><span class="chip">${slotText(h)}</span></label>`).join('');
  const dayRadios = $$('input[name="hari"]', daysEl), timeRadios = $$('input[name="jam"]', timesEl);
  const minutesLeft = h => { const n = new Date(); return h * 60 - (n.getHours() * 60 + n.getMinutes()); };
  const isToday = i => i === 0;
  function syncTimes() {
    const sel = dayRadios.find(r => r.checked);
    timeRadios.forEach(r => { r.disabled = !!sel && isToday(+sel.value) && minutesLeft(+r.value) < 60; if (r.disabled && r.checked) r.checked = false; });
  }
  dayRadios[0].disabled = SLOTS.every(h => minutesLeft(h) < 60);   // nothing left today
  daysEl.addEventListener('change', () => { syncTimes(); recheckIfErr('waktu'); paintSum(); });
  timesEl.addEventListener('change', () => { recheckIfErr('waktu'); paintSum(); });

  /* live summary right above the button: "M1 Laser · Sab 24 Okt · 10.00" */
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
  const MSG = { nama: 'Isi nama kamu.', model: 'Pilih model, atau pilih "Belum yakin".', lain: 'Pilih modelnya dari daftar.', waktu: 'Pilih hari dan jam.', hari: 'Pilih harinya.', jam: 'Pilih jamnya.', lewat: 'Jam itu sudah lewat. Pilih jam lain.' };
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
    model: () => { const v = picked(); if (!v) return MSG.model; if (v === OTHER && !bySlug(f.model.value)) return MSG.lain; return true; },
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
    if (k === 'model') return picked() === OTHER ? f.model : picks[0];
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
   Buyers pick model, DP chip and tenor only; the rate is fixed (CICIL.rate). Opens on M1 Laser, DP 20%, 12 bulan ---------- */
const DP_CHIPS = [0, 10, 20, 30];
function initCalc() {
  const form = $('#calc-form'); if (!form) return;
  const el = { model: $('#c-model'), harga: $('#c-harga'), eq: $('#dp-eq'),
    fixed: $('#harga-fixed'), manual: $('#harga-manual'), hv: $('#harga-v'), hn: $('#harga-note'),
    num: $('#res-num'), sr: $('#res-sr'), hint: $('#res-hint'), pokok: $('#res-pokok'), fee: $('#res-fee'), bungaOut: $('#res-bunga'), total: $('#res-total'), cta: $('#res-cta'),
    tr: $('#res-tr'), live: $('#res-live'), rate: $('#res-rate') };
  const pctTxt = n => String(Math.round(n * 10000) / 100).replace('.', ',');
  const st = { dp: CICIL.dpPct, tenor: CICIL.tenor, touched: false };
  modelOptions(el.model, { withPrice: true, custom: true });
  const qm = qModel();
  el.model.value = qm ? qm.slug : qs.get('m') === 'custom' ? 'custom' : 'm1-laser';
  /* ?tenor= and ?dp= (percent) come from the home's "Hitung lengkap"; dp snaps to the nearest chip */
  const qt = +qs.get('tenor'); if (CICIL.tenors.includes(qt)) st.tenor = qt;
  const qd = qs.get('dp') === null ? NaN : num(qs.get('dp'));
  if (Number.isFinite(qd)) st.dp = DP_CHIPS.reduce((a, c) => (Math.abs(c - qd) < Math.abs(a - qd) ? c : a), DP_CHIPS[0]);
  if (!DP_CHIPS.includes(st.dp)) st.dp = 20;
  $('#tenor').innerHTML = CICIL.tenors.map(t => `<button type="button" class="chip" data-tenor="${t}" aria-pressed="${t === st.tenor}">${t} bulan</button>`).join('');
  $('#dp-chips').innerHTML = DP_CHIPS.map(d => `<button type="button" class="chip" data-dp="${d}" aria-pressed="${d === st.dp}">${d}%</button>`).join('');
  el.rate.textContent = `Cicilan lewat Kredivo: bunga ${pctTxt(CICIL.rate)}% per bulan, biaya penanganan ${pctTxt(CICIL.handling)}%.`;

  const getPrice = () => {
    const m = bySlug(el.model.value);
    if (m && m.price) return Number(digits(m.price));
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
    const v = el.model.value, m = bySlug(v);
    const manual = v === 'custom' || (m && !m.price);
    el.fixed.hidden = manual || !m; el.manual.hidden = !manual;
    if (m && m.price) {
      el.hv.textContent = m.price.charAt(0).toUpperCase() + m.price.slice(1);
      el.hn.innerHTML = `Harga resmi GODA. <a href="${wa(`Halo Moto Ijo, berapa harga terbaru ${m.name}?`)}" target="_blank" rel="noopener">Tanya harga terbaru lewat WhatsApp</a>.`;
    }
  }

  function update() {
    paintPrice();
    const price = getPrice(), ok = price > 0, m = bySlug(el.model.value);
    const box = $('[data-field="harga"]'), err = $('#err-harga');
    const showErr = !el.manual.hidden && st.touched && !ok;
    box.classList.toggle('is-error', showErr); err.hidden = !showErr;
    showErr ? el.harga.setAttribute('aria-invalid', 'true') : el.harga.removeAttribute('aria-invalid');

    const dpRp = ok ? Math.round(price * st.dp / 100) : 0;
    const r = ok ? cicilan(price, dpRp, st.tenor) : null;
    roll(r ? r.bulan : 0);
    el.live.textContent = r ? rp(r.bulan) : 'Rp 0';
    el.eq.textContent = ok ? (st.dp ? `DP ${rp(dpRp)}` : 'Tanpa DP') : 'Isi harga dulu untuk melihat DP.';
    el.pokok.textContent = ok ? rp(price - dpRp) : 'Rp 0';
    el.fee.textContent = r ? rp(r.pokok - (price - dpRp)) : 'Rp 0';
    el.bungaOut.textContent = r ? rp(r.bunga) : 'Rp 0';
    el.total.textContent = r ? rp(r.total) : 'Rp 0';
    el.hint.textContent = ok ? `${st.tenor} bulan, ${st.dp ? `DP ${st.dp}% (${rp(dpRp)})` : 'tanpa DP'}.` : 'Isi harga motornya dulu.';
    clearTimeout(update.t);
    update.t = setTimeout(() => { el.sr.textContent = r ? `Perkiraan cicilan ${rp(r.bulan)} per bulan.` : el.hint.textContent; }, 700);

    const msg = r
      ? `Halo Moto Ijo, saya mau tanya cicilan${m ? ' ' + m.name : ''}. Hitungan saya di situs: harga ${rp(price)}, ${st.dp ? `DP ${st.dp}% (${rp(dpRp)})` : 'tanpa DP'}, tenor ${st.tenor} bulan, cicilan sekitar ${rp(r.bulan)} per bulan. Bisa diajukan lewat Kredivo?`
      : `Halo Moto Ijo, saya mau tanya cicilan${m ? ' ' + m.name : ''}. Bisa lewat Kredivo?`;
    el.cta.href = wa(msg);
    el.tr.href = m ? `test-ride.html?m=${m.slug}` : 'test-ride.html';
    return ok;
  }

  /* events */
  el.model.addEventListener('change', () => {
    if (el.model.value === 'custom' || (bySlug(el.model.value) && !bySlug(el.model.value).price)) { el.harga.value = ''; st.touched = false; }
    update();
  });
  el.harga.addEventListener('input', () => { groupInput(el.harga); st.touched = true; update(); });
  const chips = (sel, key) => $(sel).addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    st[key] = +b.dataset[key];
    $$('button', $(sel)).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    update();
  });
  chips('#tenor', 'tenor'); chips('#dp-chips', 'dp');
  form.addEventListener('submit', e => e.preventDefault());
  el.cta.addEventListener('click', e => { if (update()) return; e.preventDefault(); st.touched = true; update(); el.harga.focus(); });

  update();
}

initPicker();
if (page === 'test-ride') { initTestRide(); initShots(); }
if (page === 'simulasi-cicilan') initCalc();
