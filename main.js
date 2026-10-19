
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

      const distance = Math.sqrt(
        dx * dx + dy * dy
      );

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
// INTERACTIVE TREE BRANCHES
// ========================================

const treeElement = document.querySelector('#tree');

if (treeElement) {

  // ========================================
  // DISTANCE FROM POINT TO LINE SEGMENT
  // ========================================

  function pointToLineDistance(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;

    let param = lenSq === 0 ? 0 : dot / lenSq;

    if (param < 0) param = 0;
    else if (param > 1) param = 1;

    const xx = x1 + param * C;
    const yy = y1 + param * D;

    const dx = px - xx;
    const dy = py - yy;

    return Math.sqrt(dx * dx + dy * dy);
  }

  // ========================================
  // CREATE BRANCH
  // ========================================

  function createLine(x1, y1, x2, y2, src, baseRotation = 0) {
    const group = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'g'
    );

    const image = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'image'
    );

    image.setAttribute('href', src);

    const width = 1000;
    const height = 240;

    image.setAttribute('width', width);
    image.setAttribute('height', height);
    image.setAttribute('x', x2 - width);
    image.setAttribute('y', y2 - height / 2);

    group.appendChild(image);
    treeElement.appendChild(group);

    if (baseRotation !== 0) {
      group.setAttribute(
        'transform',
        `rotate(${baseRotation}, ${x2}, ${y2})`
      );
    }

    return {
      el: group,

      base: {
        x1: x2 - width,
        y1: y2,
        x2,
        y2
      },

      baseRotation,
      angleOffset: 0,
      velocity: 0,
      lastMouseX: null,
      lastMouseY: null
    };
  }

  // ========================================
  // ROTATE BRANCH
  // ========================================

  function updateLine(lineObj, angle) {
    const { x2, y2 } = lineObj.base;

    lineObj.el.setAttribute(
      'transform',
      `rotate(${angle}, ${x2}, ${y2})`
    );
  }

  // ========================================
  // CREATE TWO BRANCHES
  // ========================================

  const lines = [
    createLine(
      64, 130, 192, 130,
      'branch-art-3.svg', 15
    ),

    createLine(
      64, 240, 192, 240,
      'branch-art.svg', 0
    )
  ];

  // ========================================
  // INTERACTION SETTINGS
  // ========================================

  const hoverRadius = 50;
  const maxAngleOffset = 15;
  const moveStrength = 0.012;
  const horizontalInfluence = 0.15;
  const maxImpulse = 0.35;

  let mouseX = -1000;
  let mouseY = -1000;

  // ========================================
  // MOUSE TRACKING
  // ========================================

  treeElement.addEventListener('mousemove', (e) => {
    const point = treeElement.createSVGPoint();

    point.x = e.clientX;
    point.y = e.clientY;

    const screenMatrix = treeElement.getScreenCTM();

    if (!screenMatrix) return;

    const svgPoint = point.matrixTransform(
      screenMatrix.inverse()
    );

    mouseX = svgPoint.x;
    mouseY = svgPoint.y;

    lines.forEach((line) => {
      const { x1, y1, x2, y2 } = line.base;

      const dist = pointToLineDistance(
        mouseX,
        mouseY,
        x1,
        y1,
        x2,
        y2
      );

      if (dist < hoverRadius) {
        if (
          line.lastMouseX !== null &&
          line.lastMouseY !== null
        ) {
          const dx = mouseX - line.lastMouseX;
          const dy = mouseY - line.lastMouseY;

          const movement =
            dy + dx * horizontalInfluence;

          const proximity =
            1 - dist / hoverRadius;

          const impulse =
            movement * moveStrength * proximity;

          const limitedImpulse = Math.max(
            -maxImpulse,
            Math.min(maxImpulse, impulse)
          );

          line.velocity += limitedImpulse;
        }
      }

      line.lastMouseX = mouseX;
      line.lastMouseY = mouseY;
    });
  });

  // ========================================
  // RESET ON MOUSE LEAVE
  // ========================================

  treeElement.addEventListener('mouseleave', () => {
    mouseX = -1000;
    mouseY = -1000;

    lines.forEach((line) => {
      line.lastMouseX = null;
      line.lastMouseY = null;
    });
  });

  // ========================================
  // BRANCH PHYSICS ANIMATION
  // ========================================

  const startTime = performance.now();

  function animate(time) {
    const delta = time - startTime;

    const baseAngle =
      Math.sin(delta / 3000) * 1.5;

    lines.forEach((line) => {
      const linearStiffness = 0.03;
      const cubicStiffness = 0.0003;
      const damping = 0.92;

      const force =
        -linearStiffness * line.angleOffset -
        cubicStiffness * Math.pow(line.angleOffset, 3);

      line.velocity += force;
      line.velocity *= damping;
      line.angleOffset += line.velocity;

      line.angleOffset = Math.max(
        -maxAngleOffset,
        Math.min(maxAngleOffset, line.angleOffset)
      );

      updateLine(
        line,
        line.baseRotation + baseAngle + line.angleOffset
      );
    });

    requestAnimationFrame(animate);
  }

  // Keep branches at their intended starting angles
  // even when reduced motion is enabled.
  lines.forEach((line) => {
    updateLine(line, line.baseRotation);
  });

  if (!reducedMotionQuery.matches) {
    requestAnimationFrame(animate);
  }
}

// ========================================
// PROJECT PANEL INTERACTIONS
// ========================================

const projectFrames = document.querySelectorAll(
  '.project-frame'
);

projectFrames.forEach((frame) => {
  const button = frame.querySelector('.project-toggle');

  if (!button) return;

  const detailsId = button.getAttribute('aria-controls');
  const details = document.getElementById(detailsId);

  const icon = button.querySelector('.toggle-icon');
  const label = button.querySelector('.toggle-label');

  if (!details) return;

  let isExpanded = false;

  // Enable CSS height animation
  details.hidden = false;
  details.style.height = '0px';
  details.classList.remove('is-expanded');

  frame.classList.remove('is-open');

  details.inert = true;
  details.setAttribute('aria-hidden', 'true');
  button.setAttribute('aria-expanded', 'false');

  if (icon) {
    icon.textContent = '+';
  }

  // ========================================
  // OPEN / CLOSE PROJECT
  // ========================================

  function setProjectState(expand) {
    const reduceMotion = reducedMotionQuery.matches;

    const currentHeight =
      details.getBoundingClientRect().height;

    details.style.height = `${currentHeight}px`;

    void details.offsetHeight;

    isExpanded = expand;

    frame.classList.toggle('is-open', expand);
    details.classList.toggle('is-expanded', expand);

    button.setAttribute(
      'aria-expanded',
      String(expand)
    );

    details.inert = !expand;

    details.setAttribute(
      'aria-hidden',
      String(!expand)
    );

    if (label) {
      label.textContent = expand
        ? 'Close project'
        : 'Explore project';
    }

    if (icon) {
      icon.textContent = expand ? '−' : '+';
    }

    if (reduceMotion) {
      details.style.height = expand ? 'auto' : '0px';
      return;
    }

    if (expand) {
      details.style.height = `${details.scrollHeight}px`;
    } else {
      details.style.height = '0px';
    }
  }

  // ========================================
  // CLICK ANYWHERE EXCEPT LINKS
  // ========================================

  frame.addEventListener('click', (event) => {
    // Let TIFF website links work normally.
    if (event.target.closest('a')) {
      return;
    }

    setProjectState(!isExpanded);
  });

  // ========================================
  // COMPLETE HEIGHT ANIMATION
  // ========================================

  details.addEventListener('transitionend', (event) => {
    if (
      event.target !== details ||
      event.propertyName !== 'height'
    ) {
      return;
    }

    if (isExpanded) {
      details.style.height = 'auto';
    }
  });
});

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
