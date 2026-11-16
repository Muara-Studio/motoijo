// Moto Ijo · spring.js (v11, 16 Nov 2026): the physics behind every drag on the site, after apple-design §3–6, §9.
// spring({ from, to, velocity, damping, response, onUpdate, onDone }) animates one number. damping 1 = no overshoot,
// < 1 = a little bounce (only after a flick); response ≈ seconds to settle (it is not a duration). velocity in units/s.
// It is interruptible: stop() returns the live value and velocity, so the next gesture or spring starts from there.
// project(v) = where a flick at v px/s would come to rest (Apple's deceleration formula, rate 0.998).
// rubberband(over, size) = how far an element follows a drag past its edge (progressive resistance).
export function spring({ from, to, velocity = 0, damping = 1, response = 0.4, onUpdate, onDone }) {
  const k = (2 * Math.PI / response) ** 2, c = 4 * Math.PI * damping / response;   // stiffness and damping, mass 1
  let x = from, v = velocity, last = performance.now(), raf = 0, live = true;
  const step = now => {
    const dt = Math.min(0.064, (now - last) / 1000); last = now;
    const n = Math.max(1, Math.ceil(dt / 0.004)), h = dt / n;   // small sub-steps keep stiff springs stable
    for (let i = 0; i < n; i++) { v += (-k * (x - to) - c * v) * h; x += v * h; }
    if (Math.abs(x - to) < 0.25 && Math.abs(v) < 4) { live = false; onUpdate(to); onDone && onDone(); return; }
    onUpdate(x); raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return {
    stop() { if (live) { cancelAnimationFrame(raf); live = false; } return { value: x, velocity: v }; },
    get live() { return live; },
  };
}
export const project = (v, rate = 0.998) => (v / 1000) * rate / (1 - rate);
export const rubberband = (over, size, c = 0.55) => (over * size * c) / (size + c * Math.abs(over));
