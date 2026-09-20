const storyTrack = document.querySelector('#aboutStoryTrack');
const aboutHorizontal = document.querySelector('#aboutHorizontal');
const horizontalTrack = document.querySelector('#aboutHorizontalTrack');

if (storyTrack && aboutHorizontal && horizontalTrack) {
  const roleCards = [...storyTrack.querySelectorAll('.about-role-card')];
  const bioWords = [...storyTrack.querySelectorAll('.about-bio h2 > *')];
  const aurora = document.querySelector('#aboutAurora');
  const portrait = document.querySelector('#aboutPortrait');
  const prompt = storyTrack.querySelector('.about-scroll-prompt');
  const progress = document.querySelector('#aboutPanelProgress');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 960px)');
  let mouseX = 0;
  let mouseY = 0;
  let easedX = 0;
  let easedY = 0;
  let frame = 0;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const progressWithin = (element) => {
    const rect = element.getBoundingClientRect();
    const range = Math.max(1, element.offsetHeight - window.innerHeight);
    return clamp(-rect.top / range);
  };

  const setCardTransform = (card, x, y, rotation, scale) => {
    card.style.transform = `translate3d(${x}vw, ${y}vh, 0) rotate(${rotation}deg) scale(${scale})`;
  };

  const renderStory = () => {
    const p = progressWithin(storyTrack);
    const fan = clamp(p / 0.42);
    const fly = clamp((p - 0.54) / 0.17);
    const reveal = clamp((p - 0.58) / 0.34);
    const portraitIn = clamp((p - 0.08) / 0.24);
    const portraitOut = clamp((p - 0.55) / 0.15);
    const portraitOpacity = portraitIn * (1 - portraitOut);
    const mouseInfluence = 1 - fan;

    easedX += (mouseX - easedX) * 0.055;
    easedY += (mouseY - easedY) * 0.055;

    const poses = [
      [-7 - 13 * fan - 58 * fly, 4 + 12 * fan + 34 * fly, -7 - 11 * fan - 40 * fly, 1 + 0.08 * fan],
      [-2 - 5 * fan - 44 * fly, -2 - 7 * fan - 40 * fly, -2 - 5 * fan - 24 * fly, 1 + 0.12 * fan],
      [3 + 7 * fan + 44 * fly, -3 - 9 * fan - 46 * fly, 4 + 9 * fan + 30 * fly, 1 + 0.13 * fan],
      [8 + 16 * fan + 62 * fly, 3 + 13 * fan + 38 * fly, 9 + 19 * fan + 48 * fly, 1 + 0.17 * fan]
    ];

    roleCards.forEach((card, index) => {
      const pose = poses[index];
      const depth = index - 1.5;
      setCardTransform(
        card,
        pose[0] + easedX * depth * 0.8 * mouseInfluence,
        pose[1] + easedY * depth * 0.8 * mouseInfluence,
        pose[2],
        pose[3]
      );
      card.style.opacity = String(1 - fly * fly);
    });

    bioWords.forEach((word, index) => {
      const wordProgress = clamp(reveal * (bioWords.length + 1) - index);
      word.style.opacity = String(wordProgress);
      word.style.filter = `blur(${(1 - wordProgress) * 10}px)`;
      word.style.transform = `translateY(${(1 - wordProgress) * 18}px)`;
    });

    storyTrack.querySelector('.about-bio > p').style.opacity = String(clamp(reveal * 2));
    portrait.style.opacity = String(portraitOpacity);
    portrait.style.transform = `translate3d(-50%, ${5 - portraitIn * 5 + portraitOut * 2}%, 0) scale(${0.92 + portraitIn * 0.08 - portraitOut * 0.025})`;
    portrait.style.filter = `blur(${(1 - portraitIn) * 8 + portraitOut * 4}px) brightness(${0.72 + portraitIn * 0.18}) saturate(.82)`;
    prompt.style.opacity = String(clamp(1 - p * 7));
    aurora.style.opacity = String(0.38 - reveal * 0.16);
    aurora.style.transform = `translate3d(${easedX * 24}px, ${easedY * 24}px, 0) rotate(${p * 95}deg) scale(${1 + fan * 0.08})`;
  };

  const renderHorizontal = () => {
    if (mobile.matches) {
      horizontalTrack.style.transform = '';
      if (progress) progress.style.transform = 'scaleX(1)';
      return;
    }
    const p = progressWithin(aboutHorizontal);
    const panelCount = horizontalTrack.children.length;
    horizontalTrack.style.transform = `translate3d(${-p * (panelCount - 1) * 100}vw, 0, 0)`;
    if (progress) progress.style.transform = `scaleX(${p})`;
  };

  const render = () => {
    if (!reducedMotion.matches && !mobile.matches) renderStory();
    renderHorizontal();
    frame = requestAnimationFrame(render);
  };

  window.addEventListener('mousemove', (event) => {
    mouseX = event.clientX / window.innerWidth - 0.5;
    mouseY = event.clientY / window.innerHeight - 0.5;
  }, { passive: true });

  const syncMode = () => {
    cancelAnimationFrame(frame);
    if (mobile.matches || reducedMotion.matches) {
      roleCards.forEach((card) => {
        card.style.transform = '';
        card.style.opacity = '';
      });
      bioWords.forEach((word) => {
        word.style.opacity = '';
        word.style.filter = '';
        word.style.transform = '';
      });
      portrait.style.opacity = '';
      portrait.style.transform = '';
      portrait.style.filter = '';
    }
    frame = requestAnimationFrame(render);
  };

  mobile.addEventListener('change', syncMode);
  reducedMotion.addEventListener('change', syncMode);
  syncMode();
}
