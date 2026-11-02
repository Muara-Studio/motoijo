// Moto Ijo · drag.js (1 Nov 2026): one horizontal drag for every carousel on the site (mouse, touch or pen).
// dragX(el, { start, move(dx), end(dx, velocity) }, skip): vertical moves stay the page's scroll, so give `el`
// `touch-action: pan-y`. A click right after a drag is swallowed (a drag that starts on a link does not open it).
// The element gets .is-drag while dragging (use it for cursor: grabbing and user-select: none).
export function dragX(el, on, skip = 'select, input, textarea') {
  let d = null, swallow = false;
  el.addEventListener('pointerdown', e => {
    if (e.button !== 0 || e.target.closest(skip)) return;
    d = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), dx: 0, on: false };
  });
  el.addEventListener('pointermove', e => {
    if (!d || e.pointerId !== d.id) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (!d.on) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      if (Math.abs(dy) > Math.abs(dx)) { d = null; return; }
      d.on = true; el.setPointerCapture(e.pointerId); el.classList.add('is-drag'); on.start && on.start();
    }
    d.dx = dx; on.move && on.move(dx);
  });
  const end = e => {
    if (!d || e.pointerId !== d.id) return;
    const { on: was, dx, t } = d; d = null;
    if (!was) return;
    el.classList.remove('is-drag');
    swallow = true; setTimeout(() => { swallow = false; }, 60);
    on.end(dx, Math.abs(dx) / Math.max(1, performance.now() - t));
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', e => { if (d && e.pointerId === d.id) { d.dx = 0; end(e); } });
  el.addEventListener('click', e => { if (swallow) { e.preventDefault(); e.stopPropagation(); swallow = false; } }, true);
  el.addEventListener('dragstart', e => e.preventDefault());
}
