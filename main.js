// Keep anchor destinations immediately below the fixed navigation.
const mainNavigation = document.querySelector('.horizontal-menu');

if (mainNavigation) {
  const updateNavigationHeight = () => {
    document.documentElement.style.setProperty(
      '--navigation-height',
      `${mainNavigation.getBoundingClientRect().height}px`
    );
  };

  updateNavigationHeight();
  new ResizeObserver(updateNavigationHeight).observe(mainNavigation);
}


// ========================================
// CUSTOM CURSOR
// ========================================

const cursor = document.querySelector('.cursor');
const cursorGlow = document.querySelector('.cursor-glow');

const hasCursor = Boolean(cursor && cursorGlow);

const finePointer = window.matchMedia(
  '(hover: hover) and (pointer: fine)'
);

const reducedMotionQuery = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
);

function canUseCustomCursor() {
  return (
    hasCursor &&
    finePointer.matches &&
    !reducedMotionQuery.matches
  );
}

if (hasCursor) {
  document.addEventListener('mousemove', (e) => {
    if (!canUseCustomCursor()) return;

    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';

    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
  });

  document.addEventListener('mousedown', () => {
    if (!canUseCustomCursor()) return;

    cursor.style.transform =
      'translate(-50%, -50%) scale(0.85)';
  });

  document.addEventListener('mouseup', () => {
    if (!canUseCustomCursor()) return;

    cursor.style.transform =
      'translate(-50%, -50%) scale(1)';
  });
}

// ========================================
// INTERACTIVE HERO LETTERS
// ========================================

function applyHoverEffects(elementId) {
  const element = document.getElementById(elementId);

  if (!element) return;

  const text = element.textContent || '';

  element.innerHTML = text
    .split('')
    .map((ch) =>
      ch === ' '
        ? '<span class="letter">&nbsp;</span>'
        : `<span class="letter">${ch}</span>`
    )
    .join('');

  if (reducedMotionQuery.matches) return;

  const letters = Array.from(
    element.querySelectorAll('.letter')
  );

  function updateLetterPositions() {
    letters.forEach((letter) => {
      const rect = letter.getBoundingClientRect();

      letter.centerX = rect.left + rect.width / 2;
      letter.centerY = rect.top + rect.height / 2;
    });
  }

  updateLetterPositions();

  window.addEventListener('resize', updateLetterPositions);
  window.addEventListener('load', updateLetterPositions);

  if (document.fonts) {
    document.fonts.ready.then(updateLetterPositions);
  }

  document.addEventListener('mousemove', (e) => {
    if (!finePointer.matches) return;

    let closestIndex = -1;
    let closestDistance = Infinity;

    letters.forEach((letter, index) => {
      const dx = e.clientX - letter.centerX;
      const dy = e.clientY - letter.centerY;

      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    letters.forEach((letter) => {
      letter.classList.remove(
        'hovered',
        'adjacent-1',
        'adjacent-2'
      );
    });

    if (closestDistance < 80 && closestIndex !== -1) {
      letters[closestIndex].classList.add('hovered');

      if (closestIndex > 0) {
        letters[closestIndex - 1].classList.add(
          'adjacent-1'
        );
      }

      if (closestIndex > 1) {
        letters[closestIndex - 2].classList.add(
          'adjacent-2'
        );
      }

      if (closestIndex < letters.length - 1) {
        letters[closestIndex + 1].classList.add(
          'adjacent-1'
        );
      }

      if (closestIndex < letters.length - 2) {
        letters[closestIndex + 2].classList.add(
          'adjacent-2'
        );
      }

      if (canUseCustomCursor()) {
        cursorGlow.style.opacity = '1';
        cursorGlow.style.transform =
          'translate(-50%, -50%) scale(1.18)';
      }
    } else if (hasCursor) {
      cursorGlow.style.opacity = '0.7';
      cursorGlow.style.transform =
        'translate(-50%, -50%) scale(1)';
    }
  });
}

applyHoverEffects('hi-word');
applyHoverEffects('name-text');

// ========================================
// RESPONSIVE LIVE TIFF WEBSITE PREVIEW
// ========================================

const livePreviews = document.querySelectorAll(
  '.project-live-preview'
);

const desktopPreviewWidth = 1440;

function resizeLivePreview(preview) {
  const iframe = preview.querySelector('iframe');

  if (!iframe) return;

  const width = preview.clientWidth;

  if (width <= 0) return;

  const scale = width / desktopPreviewWidth;

  iframe.style.transform = `scale(${scale})`;
}

if (livePreviews.length > 0) {
  livePreviews.forEach((preview) => {
    resizeLivePreview(preview);
  });

  if ('ResizeObserver' in window) {
    const previewObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        resizeLivePreview(entry.target);
      });
    });

    livePreviews.forEach((preview) => {
      previewObserver.observe(preview);
    });
  } else {
    window.addEventListener('resize', () => {
      livePreviews.forEach(resizeLivePreview);
    });
  }
}

// ========================================
// AI ISSUE: PRESENTATION SLIDESHOW
// ========================================

// Select the presentation specifically, rather than
// whichever slideshow appears first in the HTML.

const presentationSlideshow = document.querySelector(
  '.ai-presentation-section .project-slideshow'
);

if (presentationSlideshow) {
  const slide = presentationSlideshow.querySelector(
    '.project-slide'
  );

  const counter = presentationSlideshow.querySelector(
    '.slide-counter'
  );

  const previous = presentationSlideshow.querySelector(
    '.slide-prev'
  );

  const next = presentationSlideshow.querySelector(
    '.slide-next'
  );

  if (slide && counter && previous && next) {
    const total = 12;
    let current = 0;

    function showSlide(index) {
      current = Math.max(
        0,
        Math.min(total - 1, index)
      );

      // The background image contains 12 stacked slides.
      const position = current * 100 / (total - 1);

      slide.style.backgroundPosition =
        `center ${position}%`;

      slide.setAttribute(
        'aria-label',
        `Presentation slide ${current + 1} of ${total}`
      );

      counter.textContent =
        `${current + 1} / ${total}`;

      previous.disabled = current === 0;
      next.disabled = current === total - 1;
    }

    presentationSlideshow.addEventListener(
      'click',
      (event) => {
        event.stopPropagation();
      }
    );

    previous.addEventListener('click', () => {
      showSlide(current - 1);
    });

    next.addEventListener('click', () => {
      showSlide(current + 1);
    });

    presentationSlideshow.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          event.stopPropagation();
          showSlide(current - 1);
        }

        if (event.key === 'ArrowRight') {
          event.preventDefault();
          event.stopPropagation();
          showSlide(current + 1);
        }
      }
    );

    showSlide(0);
  }
}

// ========================================
// AI ISSUE: ZINE IMAGE SLIDESHOW
// ========================================

const zineSlideshow = document.querySelector(
  '.zine-image-slideshow'
);

if (zineSlideshow) {
  const image = zineSlideshow.querySelector(
    '.zine-slide-image'
  );

  const counter = zineSlideshow.querySelector(
    '.slide-counter'
  );

  const previous = zineSlideshow.querySelector(
    '.slide-prev'
  );

  const next = zineSlideshow.querySelector(
    '.slide-next'
  );

  if (image && counter && previous && next) {
    const images = [
      'AI-Issue-1.jpg',
      'AI-Issue-2+3.jpg',
      'GD missing slide.jpg',
      'AI-Issue-4+5.jpg',
      'AI-Issue-6+7.jpg',
      'AI-Issue-8.jpg'
    ];

    
    let currentImage = 0;

    function showZineImage(index) {
      currentImage = Math.max(
        0,
        Math.min(images.length - 1, index)
      );

      image.src = `assets/${images[currentImage]}`;

      image.alt =
        `The AI Issue Zine, image ${currentImage + 1} of ${images.length}`;

      // First and last images are single pages.
      // The middle three are double-page spreads.
      const isSinglePage =
        currentImage === 0 ||
        currentImage === images.length - 1;

      image.classList.toggle(
        'is-single',
        isSinglePage
      );

      image.classList.toggle(
        'is-spread',
        !isSinglePage
      );

      counter.textContent =
        `${currentImage + 1} / ${images.length}`;

      previous.disabled = currentImage === 0;
      next.disabled = currentImage === images.length - 1;
    }

    zineSlideshow.addEventListener(
      'click',
      (event) => {
        event.stopPropagation();
      }
    );

    previous.addEventListener('click', () => {
      showZineImage(currentImage - 1);
    });

    next.addEventListener('click', () => {
      showZineImage(currentImage + 1);
    });

    zineSlideshow.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          event.stopPropagation();
          showZineImage(currentImage - 1);
        }

        if (event.key === 'ArrowRight') {
          event.preventDefault();
          event.stopPropagation();
          showZineImage(currentImage + 1);
        }
      }
    );

    showZineImage(0);
  }
}

// Align the resume button with the portrait’s lower edge as its size changes.
const aboutHeadshot = document.querySelector('.about-headshot');
if (aboutHeadshot) {
  const updateHeadshotHeight = () => {
    aboutHeadshot.closest('.about-section').style.setProperty(
      '--headshot-height',
      `${aboutHeadshot.getBoundingClientRect().height}px`
    );
  };
  updateHeadshotHeight();
  new ResizeObserver(updateHeadshotHeight).observe(aboutHeadshot);
}


/* GALLERY SECTION */
/* Load with defer. Duplicate a tile in gallery.html to add more artwork. */
(() => {
  const init = () => document.querySelectorAll('[data-ml-gallery]').forEach(section => {
    if (section.dataset.ready) return;
    section.dataset.ready = 'true';
    const track = section.querySelector('.ml-gallery__track');
    const previous = section.querySelector('[data-gallery-prev]');
    const next = section.querySelector('[data-gallery-next]');
    const dialog = section.querySelector('dialog');
    const largeImage = dialog.querySelector('img');
    const caption = dialog.querySelector('figcaption');
    let opener;
    const update = () => {
      previous.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
    };
    const move = direction => track.scrollBy({ left: direction * (track.clientWidth + 20), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    track.addEventListener('scroll', update, { passive: true });
    track.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        move(event.key === 'ArrowRight' ? 1 : -1);
      }
    });
    section.querySelectorAll('.ml-gallery__tile').forEach(tile => {
      tile.addEventListener('focus', () => tile.scrollIntoView({ block: 'nearest', inline: 'nearest' }));
      tile.addEventListener('click', () => {
        opener = tile;
        const thumbnail = tile.querySelector('img');
        largeImage.src = tile.dataset.full || thumbnail.src;
        largeImage.alt = thumbnail.alt;
        caption.textContent = tile.dataset.caption || thumbnail.alt;
        dialog.showModal();
        document.documentElement.classList.add('ml-gallery-modal-open');
      });
    });
    dialog.querySelector('button').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      const rect = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.documentElement.classList.remove('ml-gallery-modal-open');
      opener?.focus({ preventScroll: true });
    });
    new ResizeObserver(update).observe(track);
    update();
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
