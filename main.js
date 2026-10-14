
// ========================================
// CUSTOM CURSOR
// ========================================

const cursor = document.querySelector('.cursor');
const cursorGlow = document.querySelector('.cursor-glow');

const hasCursor = Boolean(cursor && cursorGlow);

// Detect whether the device has a precise pointer
// that supports hovering.
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

  // Move custom cursor with the mouse
  document.addEventListener('mousemove', (e) => {

    if (!canUseCustomCursor()) return;

    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';

    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';

  });

  // Shrink cursor on mouse press
  document.addEventListener('mousedown', () => {

    if (!canUseCustomCursor()) return;

    cursor.style.transform =
      'translate(-50%, -50%) scale(0.85)';

  });

  // Restore cursor after mouse release
  document.addEventListener('mouseup', () => {

    if (!canUseCustomCursor()) return;

    cursor.style.transform =
      'translate(-50%, -50%) scale(1)';

  });

}


// ========================================
// REDUCED MOTION PREFERENCE
// ========================================

const reducedMotion = reducedMotionQuery.matches;


// ========================================
// LETTER HOVER ANIMATION
// ========================================

function applyHoverEffects(elementId) {

  const element = document.getElementById(elementId);

  if (!element) return;

  const text = element.textContent || '';

  // Wrap individual characters in spans
  element.innerHTML = text
    .split('')
    .map((ch) =>
      ch === ' '
        ? '<span class="letter">&nbsp;</span>'
        : `<span class="letter">${ch}</span>`
    )
    .join('');

  if (reducedMotion) return;

  const letters = Array.from(
    element.querySelectorAll('.letter')
  );


  // ========================================
  // LETTER POSITION CALCULATIONS
  // ========================================

  function updateLetterPositions() {

    letters.forEach((letter) => {

      const rect = letter.getBoundingClientRect();

      letter.centerX = rect.left + rect.width / 2;
      letter.centerY = rect.top + rect.height / 2;

    });

  }

  updateLetterPositions();

  window.addEventListener(
    'resize',
    updateLetterPositions
  );


  // ========================================
  // MOUSE PROXIMITY DETECTION
  // ========================================

  document.addEventListener('mousemove', (e) => {

    if (!finePointer.matches) return;

    letters.forEach((letter, index) => {

      const dx = e.clientX - letter.centerX;
      const dy = e.clientY - letter.centerY;

      const distance = Math.sqrt(
        dx * dx + dy * dy
      );

      const radius = 80;

      if (distance < radius) {

        // Clear previous letter effects
        letters.forEach((l) =>
          l.classList.remove(
            'hovered',
            'adjacent-1',
            'adjacent-2'
          )
        );

        // Highlight current letter
        letter.classList.add('hovered');

        // Animate neighboring letters
        if (index > 0) {
          letters[index - 1].classList.add(
            'adjacent-1'
          );
        }

        if (index > 1) {
          letters[index - 2].classList.add(
            'adjacent-2'
          );
        }

        if (index < letters.length - 1) {
          letters[index + 1].classList.add(
            'adjacent-1'
          );
        }

        if (index < letters.length - 2) {
          letters[index + 2].classList.add(
            'adjacent-2'
          );
        }

        // Increase cursor glow
        if (canUseCustomCursor()) {

          cursorGlow.style.opacity = '1';

          cursorGlow.style.transform =
            'translate(-50%, -50%) scale(1.18)';

        }

      } else if (letter.classList.contains('hovered')) {

        // Remove effects when mouse moves away
        letters.forEach((l) =>
          l.classList.remove(
            'hovered',
            'adjacent-1',
            'adjacent-2'
          )
        );

        if (hasCursor) {

          cursorGlow.style.opacity = '0.7';

          cursorGlow.style.transform =
            'translate(-50%, -50%) scale(1)';

        }

      }

    });

  });

}


// ========================================
// APPLY LETTER EFFECTS
// ========================================

applyHoverEffects('hi-word');
applyHoverEffects('name-text');
