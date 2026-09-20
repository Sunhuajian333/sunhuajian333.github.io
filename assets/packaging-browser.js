const packagingBrowser = document.querySelector('#packagingBrowser');

if (packagingBrowser) {
  const filters = {
    all: Array.from({ length: 21 }, (_, index) => index),
    paper: [0, 1, 2, 3, 4, 5, 6, 7, 10, 11, 12],
    gift: [3, 4, 8, 20],
    food: [8, 9, 13, 14, 15, 16, 20],
    ip: [7, 9, 10, 13, 17, 18, 19]
  };
  const imagePath = (index) => `/works/packaging-all/${String(index + 1).padStart(2, '0')}.webp`;
  const triggers = [...document.querySelectorAll('[data-project="packaging-all"]')].map((trigger) => {
    const cleanTrigger = trigger.cloneNode(true);
    trigger.replaceWith(cleanTrigger);
    return cleanTrigger;
  });
  const closeButton = document.querySelector('#packagingBrowserClose');
  const previousButton = document.querySelector('#packagingBrowserPrev');
  const nextButton = document.querySelector('#packagingBrowserNext');
  const cards = [...packagingBrowser.querySelectorAll('.packaging-browser-card')];
  const indexLabel = document.querySelector('#packagingBrowserIndex');
  const countLabel = document.querySelector('#packagingBrowserCount');
  const filterButtons = [...document.querySelectorAll('[data-packaging-filter]')];
  const kicker = document.querySelector('#packagingBrowserKicker');
  const name = document.querySelector('#packagingBrowserName');
  const zoom = document.querySelector('#packagingBrowserZoom');
  const zoomImage = document.querySelector('#packagingBrowserZoomImage');
  const zoomClose = document.querySelector('#packagingBrowserZoomClose');
  const stage = packagingBrowser.querySelector('.packaging-browser-stage');
  let activeIndex = 0;
  let activeItems = filters.all;
  let touchStartX = 0;
  let wheelAccumulator = 0;
  let fastTimer = 0;

  const wrap = (value) => (value + activeItems.length) % activeItems.length;

  const cardFor = (role) => packagingBrowser.querySelector(`.packaging-browser-card.${role}`);
  const setCardImage = (role, item) => {
    const image = cardFor(role).querySelector('img');
    image.src = imagePath(item);
    image.alt = `包装设计精选作品 ${item + 1}`;
  };

  const renderMeta = () => {
    const currentItem = activeItems[activeIndex];
    indexLabel.textContent = String(activeIndex + 1).padStart(2, '0');
    countLabel.textContent = String(activeItems.length).padStart(2, '0');
    kicker.textContent = `${String(currentItem + 1).padStart(2, '0')} // SELECTED PACKAGING`;
    name.textContent = `包装设计精选 ${String(currentItem + 1).padStart(2, '0')}`;
  };

  const resetCards = () => {
    wheelAccumulator = 0;
    window.clearTimeout(fastTimer);
    stage.classList.remove('is-fast');
    cards.forEach((card, index) => {
      card.classList.remove('is-prev', 'is-current', 'is-next', 'is-resetting');
      card.classList.add(['is-prev', 'is-current', 'is-next'][index]);
    });
    setCardImage('is-prev', activeItems[wrap(activeIndex - 1)]);
    setCardImage('is-current', activeItems[activeIndex]);
    setCardImage('is-next', activeItems[wrap(activeIndex + 1)]);
    renderMeta();
  };

  const move = (step, fast = false) => {
    if (!step) return;
    const direction = Math.sign(step);
    stage.classList.toggle('is-fast', fast);
    const current = cardFor('is-current');
    const incoming = cardFor(direction > 0 ? 'is-next' : 'is-prev');
    const wrapping = cardFor(direction > 0 ? 'is-prev' : 'is-next');
    wrapping.classList.add('is-resetting');
    activeIndex = wrap(activeIndex + step);
    incoming.querySelector('img').src = imagePath(activeItems[activeIndex]);
    if (direction > 0) {
      current.classList.replace('is-current', 'is-prev');
      incoming.classList.replace('is-next', 'is-current');
      wrapping.classList.replace('is-prev', 'is-next');
      wrapping.querySelector('img').src = imagePath(activeItems[wrap(activeIndex + 1)]);
    } else {
      current.classList.replace('is-current', 'is-next');
      incoming.classList.replace('is-prev', 'is-current');
      wrapping.classList.replace('is-next', 'is-prev');
      wrapping.querySelector('img').src = imagePath(activeItems[wrap(activeIndex - 1)]);
    }
    renderMeta();
    requestAnimationFrame(() => requestAnimationFrame(() => wrapping.classList.remove('is-resetting')));
    window.clearTimeout(fastTimer);
    fastTimer = window.setTimeout(() => stage.classList.remove('is-fast'), fast ? 205 : 590);
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      activeItems = filters.all;
      activeIndex = 0;
      filterButtons.forEach((button) => button.classList.toggle('active', button.dataset.packagingFilter === 'all'));
      resetCards();
      packagingBrowser.showModal();
    });
  });

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeItems = filters[button.dataset.packagingFilter] || filters.all;
      activeIndex = 0;
      filterButtons.forEach((item) => item.classList.toggle('active', item === button));
      resetCards();
    });
  });

  previousButton.addEventListener('click', () => move(-1));
  nextButton.addEventListener('click', () => move(1));
  closeButton.addEventListener('click', () => packagingBrowser.close());

  packagingBrowser.querySelector('.packaging-browser-stage').addEventListener('click', (event) => {
    const card = event.target.closest('.packaging-browser-card');
    if (!card) return;
    if (card.classList.contains('is-prev')) return move(-1);
    if (card.classList.contains('is-next')) return move(1);
    const currentImage = card.querySelector('img');
    zoomImage.src = imagePath(activeItems[activeIndex]);
    zoomImage.alt = currentImage.alt;
    zoom.classList.add('is-open');
    zoom.setAttribute('aria-hidden', 'false');
  });

  const closeZoom = () => {
    zoom.classList.remove('is-open');
    zoom.setAttribute('aria-hidden', 'true');
  };

  zoomClose.addEventListener('click', closeZoom);
  zoom.addEventListener('click', (event) => {
    if (event.target === zoom) closeZoom();
  });

  packagingBrowser.addEventListener('keydown', (event) => {
    if (zoom.classList.contains('is-open') && event.key === 'Escape') {
      event.preventDefault();
      closeZoom();
      return;
    }
    if (event.key === 'ArrowLeft') move(-1);
    if (event.key === 'ArrowRight') move(1);
  });

  packagingBrowser.addEventListener('wheel', (event) => {
    if (zoom.classList.contains('is-open')) return;
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    event.preventDefault();
    wheelAccumulator += delta;
    const threshold = 48;
    const steps = Math.trunc(wheelAccumulator / threshold);
    if (!steps) return;
    wheelAccumulator -= steps * threshold;
    move(Math.max(-7, Math.min(7, steps)), true);
  }, { passive: false });

  packagingBrowser.addEventListener('touchstart', (event) => {
    touchStartX = event.touches[0]?.clientX || 0;
  }, { passive: true });

  packagingBrowser.addEventListener('touchend', (event) => {
    const endX = event.changedTouches[0]?.clientX || touchStartX;
    const distance = endX - touchStartX;
    if (Math.abs(distance) > 45) move(distance > 0 ? -1 : 1);
  }, { passive: true });

  packagingBrowser.addEventListener('close', closeZoom);

  [0, 1, 2].forEach((index) => {
    const preload = new Image();
    preload.src = imagePath(index);
  });
}
