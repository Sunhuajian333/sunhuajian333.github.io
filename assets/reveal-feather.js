const reveal = document.querySelector('#centerReveal');
const hero = document.querySelector('#hero');

if (reveal && hero) {
  let frame = 0;
  const clamp = (value) => Math.min(1, Math.max(0, value));

  const update = () => {
    frame = 0;
    const range = Math.max(1, hero.offsetHeight - window.innerHeight);
    const pageProgress = clamp(window.scrollY / range);
    const revealProgress = clamp((pageProgress - 0.59) / 0.41);
    const cut = 50 * (1 - revealProgress);
    const clip = `inset(0 ${cut}% round 0px)`;

    reveal.style.setProperty('--reveal-cut', `${cut}%`);
    reveal.style.clipPath = clip;
    reveal.style.webkitClipPath = clip;
    reveal.style.opacity = revealProgress > 0.001 ? '1' : '0';
    reveal.style.transform = `scale(${0.965 + revealProgress * 0.035})`;
    reveal.setAttribute('aria-hidden', revealProgress < 0.95 ? 'true' : 'false');
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  schedule();
}
