// Moto Ijo · drag.js (1 Nov 2026): one horizontal drag for every carousel on the site (mouse, touch or pen).
// dragX(el, { start, move(dx), end(dx, velocity, releaseVelocity) }, skip): vertical moves stay the page's scroll, so give `el`
// `touch-action: pan-y`. A click right after a drag is swallowed (a drag that starts on a link does not open it).
// The element gets .is-drag while dragging (use it for cursor: grabbing and user-select: none).
// velocity = average px/ms over the whole drag (kept for older callers); releaseVelocity = signed px/s over the last
// ~100 ms, for a spring hand-off and momentum projection (js/spring.js; apple-design §5–6). start() fires on press too
// (on.press), so a running spring can be stopped at once and the element grabbed mid-flight.
export function dragX(el, on, skip = 'select, input, textarea') {
  let d = null, swallow = false;
  el.addEventListener('pointerdown', e => {
    if (e.button !== 0 || e.target.closest(skip)) return;
    d = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), dx: 0, on: false, hist: [[performance.now(), e.clientX]] };
    on.press && on.press();
  });
  el.addEventListener('pointermove', e => {
    if (!d || e.pointerId !== d.id) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (!d.on) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      if (Math.abs(dy) > Math.abs(dx)) { d = null; return; }
      d.on = true; el.setPointerCapture(e.pointerId); el.classList.add('is-drag'); on.start && on.start();
    }
    d.dx = dx; const now = performance.now(); d.hist.push([now, e.clientX]); while (d.hist.length > 2 && now - d.hist[0][0] > 100) d.hist.shift();
    on.move && on.move(dx);
  });
  const end = e => {
    if (!d || e.pointerId !== d.id) return;
    const { on: was, dx, t, hist } = d; d = null;
    const [t0, x0] = hist[0], [t1, x1] = hist[hist.length - 1], vRel = t1 > t0 ? (x1 - x0) / (t1 - t0) * 1000 : 0;
    if (!was) { on.cancel && on.cancel(); return; }
    el.classList.remove('is-drag');
    swallow = true; setTimeout(() => { swallow = false; }, 60);
    on.end(dx, Math.abs(dx) / Math.max(1, performance.now() - t), vRel);
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', e => { if (d && e.pointerId === d.id) { d.dx = 0; end(e); } });
  el.addEventListener('click', e => { if (swallow) { e.preventDefault(); e.stopPropagation(); swallow = false; } }, true);
  el.addEventListener('dragstart', e => e.preventDefault());
}
