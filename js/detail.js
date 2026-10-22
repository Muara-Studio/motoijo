// Moto Ijo · produk-detail.html?m=<slug>: one template for all 12 GODA models (default m1-laser).
// v5 (22 Okt, conversion pass): hero = gallery + buy panel (price, colours, test ride + WhatsApp, small proof),
// specs open (no toggle), related cards, one "coba di Palmerah" block. Sticky buy bar, JSON-LD, title/meta.
import { wa, icon, arrow } from './site.js';
import { MODELS, bySlug, SPEC, esc, priceHTML, priceNum, priceFrom, isMotor, val, isUnknown, specLine, waStock, waStockText, cardHTML, proofHTML, askHTML, PAINT } from './produk.js';

const root = document.querySelector('[data-detail]');
const slug = new URLSearchParams(location.search).get('m') || 'm1-laser';
const m = bySlug(slug);

function setMeta(title, desc) {
  document.title = title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', desc);
}

function metaDesc(m, s) {
  const nums = s.strip.slice(0, 2).map(x => `${x.l.toLowerCase()} ${x.v} ${x.u}`).join(', ');
  const p = m.price ? `${m.price.replace(/^mulai/i, 'mulai')}` : 'harga lewat WhatsApp';
  let d = `${m.name}: ${nums}, ${p}. Tanya stok atau jadwalkan test ride di Moto Ijo, distributor resmi GODA di Palmerah.`;
  if (d.length > 158) d = `${m.name}: ${nums}, ${p}. Jadwalkan test ride di Moto Ijo Palmerah.`;
  return d;
}

function jsonLd(m, s, gallery) {
  const abs = p => new URL(p, 'https://motoijo.com/').href;
  const d = { '@context': 'https://schema.org', '@type': 'Product', name: m.name, brand: { '@type': 'Brand', name: 'GODA' }, category: m.category,
    image: gallery.map(g => abs(g.src)), url: `https://motoijo.com/produk-detail.html?m=${m.slug}`,
    description: `${m.name}, ${s.strip.map(x => `${x.l.toLowerCase()} ${x.v} ${x.u}`).join(', ')}. Spesifikasi dari halaman resmi GODA.` };
  if (m.price) d.offers = priceFrom(m)
    ? { '@type': 'AggregateOffer', priceCurrency: 'IDR', lowPrice: String(priceNum(m)), offerCount: 1, url: d.url }
    : { '@type': 'Offer', priceCurrency: 'IDR', price: String(priceNum(m)), url: d.url };
  const el = document.createElement('script'); el.type = 'application/ld+json'; el.textContent = JSON.stringify(d); document.head.appendChild(el);
}

function related(m) { return [...MODELS.filter(x => x !== m && isMotor(x) === isMotor(m)), ...MODELS.filter(x => isMotor(x) !== isMotor(m))].slice(0, 4); }

// rows that do not help a decision stay out: the category note, online-order claim rules, the price note (shown under the price)
const SKIP_ROW = /^(Kategori|Klaim kerusakan|Harga)$/;
// M1 close-ups join the gallery instead of a separate section
const CLOSEUPS = {
  'm1-laser': [
    { src: 'assets/img/3d/detail-headlight.webp', alt: 'Lampu depan GODA M1 Laser dari dekat, render 3D', fit: 'cover', w: 1600, h: 1000 },
    { src: 'assets/img/3d/detail-wheel.webp', alt: 'Roda depan dan rem cakram GODA M1 Laser dari dekat, render 3D', fit: 'cover', w: 1600, h: 1000 },
    { src: 'assets/img/3d/detail-dashboard.webp', alt: 'Dasbor digital GODA M1 Laser dari dekat, render 3D', fit: 'cover', w: 1600, h: 1000 },
  ],
};

function render(m) {
  const s = SPEC[m.slug];
  const gallery = [...(s.gallery || [{ src: m.img, alt: `${m.name} tampak samping`, fit: 'contain', w: 800, h: 590 }]), ...(CLOSEUPS[m.slug] || [])];
  const colors = s.colors || [];
  let ci = s.colorDefault || 0;
  const colorName = () => colors.length ? colors[ci].n : '';
  const testRide = `test-ride.html?m=${m.slug}`;
  const thumbs = gallery.length > 1;
  // a row that only repeats a key number already shown in the strip stays out
  const squash = t => String(t).replace(/\s+/g, '').toLowerCase();
  const inStrip = new Set(s.strip.map(x => squash(x.v + x.u)));
  // known values first; unpublished or conflicting ones follow as "Tanya di showroom" WhatsApp asks
  const keep = s.rows.filter(([l, v]) => !SKIP_ROW.test(l) && !(typeof v === 'string' && inStrip.has(squash(v))));
  // unknown specs: one row with one WhatsApp question (six separate "Tanya di showroom" links read as unfinished)
  const unk = keep.filter(([, v]) => isUnknown(v)).map(([l]) => l);
  const rows = unk.length > 1 ? keep.filter(([, v]) => !isUnknown(v)) : [...keep.filter(([, v]) => !isUnknown(v)), ...keep.filter(([, v]) => isUnknown(v))];
  const unkText = unk.map(l => l.replace(/\.$/, '').toLowerCase()).join(', ');
  const unkRow = unk.length > 1 ? `<div class="spec__row spec__row--wide"><dt>Spesifikasi lain</dt><dd>${esc(unkText.charAt(0).toUpperCase() + unkText.slice(1))}. <a class="spec-ask" href="${wa(`Halo Moto Ijo, saya mau tanya spesifikasi ${m.name}: ${unkText}. Bisa dibantu?`)}" target="_blank" rel="noopener">${icon('brand-whatsapp')}Tanya di showroom</a></dd></div>` : '';
  const offRoad = s.rows.some(([l, v]) => l === 'Harga' && /off the road/i.test(v));
  const motor = isMotor(m);

  setMeta(`${m.name} | Moto Ijo`, metaDesc(m, s));
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', `https://motoijo.com/produk-detail.html?m=${m.slug}`);
  jsonLd(m, s, gallery);

  const stripHTML = s.strip.map(x => `<li><p class="strip__v num">${esc(x.v)}<small>${esc(x.u)}</small></p><p class="strip__l">${esc(x.l)}</p></li>`).join('');
  const LABEL = { 'Bonus di halaman GODA': 'Bonus dari GODA' };
  const wide = v => typeof v === 'string' && !isUnknown(v) && v.length > 60;
  const rowsHTML = [...rows.filter(([, v]) => !wide(v)), ...rows.filter(([, v]) => wide(v))]
    .map(([l, v]) => `<div class="spec__row${wide(v) ? ' spec__row--wide' : ''}"><dt>${esc(LABEL[l] || l)}</dt><dd>${val(v, m, l)}</dd></div>`).join('') + unkRow;
  const proof = ['resmi', 'rating', 'jam', ...(s.garansi ? ['garansi'] : [])];

  root.innerHTML = `
  <section class="pd-hero">
    <div class="wrap">
      <nav class="pd-crumb" aria-label="Lokasi halaman"><a href="produk.html">Semua model</a><span aria-hidden="true">/</span><a href="produk.html#${motor ? 'motor' : 'sepeda'}">${motor ? 'Motor listrik' : 'Sepeda listrik'}</a></nav>
    </div>
    <div class="wrap pd-top">
      <div class="gal" data-gal>
        <div class="gal__stage" tabindex="0" aria-roledescription="galeri" aria-label="Foto ${esc(m.name)}">
          ${gallery.map((g, i) => `<img class="gal__img${g.fit === 'cover' ? ' is-cover' : ''}${i === 0 ? ' is-on' : ''}" src="${g.src}" alt="${esc(g.alt)}" width="${g.w}" height="${g.h}" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" data-i="${i}">`).join('')}
          ${thumbs ? `<div class="gal__nav"><button type="button" class="gal__btn gal__btn--prev" data-prev aria-label="Foto sebelumnya">${icon('chevron-right')}</button><button type="button" class="gal__btn" data-next aria-label="Foto berikutnya">${icon('chevron-right')}</button></div>` : ''}
        </div>
        ${thumbs ? `<div class="gal__thumbs" role="group" aria-label="Pilih foto">${gallery.map((g, i) => `<button type="button" class="gal__thumb${g.fit === 'cover' ? ' is-cover' : ''}" data-go="${i}" aria-pressed="${i === 0}" aria-label="${esc(g.alt)}"><img src="${g.src}" alt="" width="${g.w}" height="${g.h}" loading="lazy" decoding="async"></button>`).join('')}</div>` : ''}
      </div>

      <div class="buy">
        <p class="buy__meta"><span class="pc__dot" style="--paint:${PAINT[m.slug]}" aria-hidden="true"></span>${esc(m.category)}${m.badge ? '<span class="pc__badge">Best Seller di Moto Ijo</span>' : ''}</p>
        <h1 class="buy__h">${esc(m.name)}</h1>
        <p class="buy__spec">${esc(specLine(m))}</p>
        <div class="buy__price">
          ${priceHTML(m)}
          ${m.price ? `<a class="link buy__cicil" href="simulasi-cicilan.html?m=${m.slug}">${icon('calculator')}Hitung cicilan</a>` : ''}
        </div>
        ${offRoad ? '<p class="buy__note">Harga belum termasuk surat-surat (off the road).</p>' : ''}
        ${colors.length ? `<div class="sw">
          <p class="sw__label" id="sw-l">Warna: <strong data-color-name>${esc(colors[ci].n)}</strong></p>
          <div class="sw__row" role="radiogroup" aria-labelledby="sw-l">${colors.map((c, i) => `<button type="button" class="sw__dot" role="radio" aria-checked="${i === ci}" tabindex="${i === ci ? 0 : -1}" aria-label="${esc(c.n)}" title="${esc(c.n)}" data-color="${i}" style="--c:${c.hex}"></button>`).join('')}</div>
        </div>` : ''}
        <div class="buy__cta" data-buy-cta>
          <a class="btn" href="${testRide}">Jadwalkan test ride${arrow()}</a>
          <a class="btn btn--line" href="${waStock(m, colorName())}" target="_blank" rel="noopener" data-wa>${icon('brand-whatsapp')}${m.price ? 'Tanya stok' : 'Tanya harga'}<span class="sr"> lewat WhatsApp</span></a>
        </div>
        ${proofHTML(proof)}
      </div>
    </div>
  </section>

  <section class="pd-spec" aria-labelledby="spec-h">
    <div class="wrap">
      <div class="pd-head">
        <h2 class="pd-h2" id="spec-h">Spesifikasi ${esc(s.word)}</h2>
        <a class="link" href="bandingkan.html?m=${m.slug}">${icon('arrows-left-right')}Bandingkan dengan model lain</a>
      </div>
      <ul class="strip strip--${s.strip.length}">${stripHTML}</ul>
      ${rows.length ? `<dl class="spec">${rowsHTML}</dl>` : ''}
    </div>
  </section>

  <section class="pd-rel" aria-labelledby="rel-h">
    <div class="wrap">
      <div class="pd-head">
        <h2 class="pd-h2" id="rel-h">${motor ? 'Motor listrik' : 'Sepeda listrik'} lainnya</h2>
        <a class="link" href="produk.html">Lihat semua model${icon('arrow-right')}</a>
      </div>
      <ul class="kat-grid">${related(m).map(r => cardHTML(r, { h: 'h3' })).join('')}</ul>
    </div>
  </section>

  <section class="ask pd-ask" aria-labelledby="ask-h">${askHTML({
    h: `Coba ${esc(s.word)} langsung di Palmerah`,
    p: 'Pilih jadwal test ride, lalu datang ke showroom. Mau tanya dulu? Chat kami di WhatsApp.',
    tr: testRide,
    waText: waStockText(m),
    waLabel: m.price ? 'Tanya stok lewat WhatsApp' : 'Tanya harga lewat WhatsApp',
    proof: ['alamat', 'jam'],
  })}</section>

  <div class="buybar f-aspal" data-buybar inert>
    <div class="wrap buybar__in">
      <img class="buybar__img" src="${m.img}" alt="" width="80" height="60">
      <p class="buybar__name"><span>${esc(m.name)}</span><span class="num">${m.price ? esc(m.price.replace(/^mulai/i, 'Mulai')) : 'Harga lewat WhatsApp'}</span></p>
      <a class="btn btn--sm btn--line btn--line-light buybar__wa" href="${waStock(m, colorName())}" target="_blank" rel="noopener" data-wa>${icon('brand-whatsapp')}<span class="t">${m.price ? 'Tanya stok' : 'Tanya harga'}</span><span class="sr"> ${esc(m.name)} lewat WhatsApp</span></a>
      <a class="btn btn--sm buybar__go" href="${testRide}"><span class="bb-l">Jadwalkan test ride</span><span class="bb-s">Test ride</span>${arrow()}</a>
    </div>
  </div>`;

  /* gallery */
  const imgs = [...root.querySelectorAll('.gal__img')]; const tbs = [...root.querySelectorAll('[data-go]')];
  let gi = 0;
  const show = i => {
    gi = (i + imgs.length) % imgs.length;
    imgs.forEach((im, k) => im.classList.toggle('is-on', k === gi));
    tbs.forEach((t, k) => t.setAttribute('aria-pressed', k === gi));
    const ck = colors.findIndex(c => c.img === imgs[gi].getAttribute('src')); if (ck > -1 && ck !== ci) setColor(ck, false);
  };
  root.querySelector('[data-prev]')?.addEventListener('click', () => show(gi - 1));
  root.querySelector('[data-next]')?.addEventListener('click', () => show(gi + 1));
  tbs.forEach((t, k) => t.addEventListener('click', () => show(k)));
  root.querySelector('.gal__stage').addEventListener('keydown', e => { if (e.key === 'ArrowRight') show(gi + 1); if (e.key === 'ArrowLeft') show(gi - 1); });
  imgs.forEach((im, k) => im.addEventListener('error', () => { im.remove(); tbs[k]?.remove(); }));

  /* colours (swatches only where GODA lists official colours); the WhatsApp text names the colour */
  function setColor(i, move = true) {
    ci = i;
    root.querySelectorAll('[data-color]').forEach((b, k) => { b.setAttribute('aria-checked', k === ci); b.tabIndex = k === ci ? 0 : -1; });
    const nm = root.querySelector('[data-color-name]'); if (nm) nm.textContent = colors[ci].n;
    root.querySelectorAll('[data-wa]').forEach(a => a.href = waStock(m, colorName()));
    if (move && colors[ci].img) { const gk = imgs.findIndex(im => im.getAttribute('src') === colors[ci].img); if (gk > -1) show(gk); }
  }
  const dots = [...root.querySelectorAll('[data-color]')];
  dots.forEach(b => b.addEventListener('click', () => setColor(+b.dataset.color)));
  root.querySelector('.sw__row')?.addEventListener('keydown', e => {
    if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return; e.preventDefault();
    const n = (ci + (e.key === 'ArrowRight' ? 1 : -1) + colors.length) % colors.length; setColor(n); dots[n].focus();
  });

  /* sticky buy bar: always on a phone, on desktop once the hero buttons leave the screen; hidden at the closing block */
  const bar = root.querySelector('[data-buybar]'); const cta = root.querySelector('[data-buy-cta]'); const end = root.querySelector('.pd-ask');
  let pastCta = false, atEnd = false;
  const phone = matchMedia('(max-width: 860px)');
  const sync = () => { const on = (phone.matches || pastCta) && !atEnd; bar.classList.toggle('is-on', on); bar.inert = !on; document.body.classList.toggle('has-buybar', on); };
  new IntersectionObserver(([e]) => { pastCta = !e.isIntersecting && e.boundingClientRect.top < 0; sync(); }).observe(cta);
  new IntersectionObserver(([e]) => { atEnd = e.isIntersecting || e.boundingClientRect.top < 0; sync(); }, { rootMargin: '0px 0px -30% 0px' }).observe(end);
  phone.addEventListener('change', sync); sync();
}

function fallback(slug) {
  setMeta('Model tidak ditemukan | Moto Ijo', 'Model itu tidak ada di katalog Moto Ijo. Lihat 12 model resmi GODA atau tanya lewat WhatsApp.');
  const r = document.createElement('meta'); r.name = 'robots'; r.content = 'noindex'; document.head.appendChild(r);
  root.innerHTML = `<section class="pd-miss page-top">
    <div class="wrap pd-miss__in">
      <h1 class="t-xl">Model ini belum ada.</h1>
      <p class="t-lead">Tautannya mungkin lama atau salah ketik. Dua belas model GODA ada di katalog.</p>
      <div class="btns"><a class="btn btn--dark" href="produk.html">Lihat semua model${arrow()}</a><a class="link" href="${wa(`Halo Moto Ijo, saya mencari model: ${slug}`)}" target="_blank" rel="noopener">Tanya lewat WhatsApp${icon('arrow-up-right')}</a></div>
    </div>
  </section>`;
}

if (m) render(m); else fallback(slug);
