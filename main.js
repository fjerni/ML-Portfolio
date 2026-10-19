
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
 