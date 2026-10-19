
// ========================================
// INTERACTIVE TREE BRANCHES
// ========================================

(() => {
  const treeElement = document.querySelector('#tree');

  if (!treeElement) return;

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

    return Math.hypot(px - xx, py - yy);
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
    // Upper branch
    createLine(
      64, 130, 192, 130,
      'branch-art-3.svg', 15
    ),

    // Middle branch
    createLine(
      64, 240, 192, 240,
      'branch-art.svg', 0
    )
  ];

  // Preserve the upper branch's original 15-degree angle.
  lines.forEach((line) => {
    updateLine(line, line.baseRotation);
  });

  // ========================================
  // INTERACTION SETTINGS
  // ========================================

  const hoverRadius = 50;
  const maxAngleOffset = 15;
  const moveStrength = 0.012;
  const horizontalInfluence = 0.15;
  const maxImpulse = 0.35;

  // ========================================
  // MOUSE TRACKING
  // ========================================

  treeElement.addEventListener('mousemove', (e) => {
    const screenMatrix = treeElement.getScreenCTM();

    if (!screenMatrix) return;

    const point = treeElement.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;

    const svgPoint = point.matrixTransform(
      screenMatrix.inverse()
    );

    const mouseX = svgPoint.x;
    const mouseY = svgPoint.y;

    lines.forEach((line) => {
      const { x1, y1, x2, y2 } = line.base;

      const dist = pointToLineDistance(
        mouseX, mouseY, x1, y1, x2, y2
      );

      if (
        dist < hoverRadius &&
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

        line.velocity += Math.max(
          -maxImpulse,
          Math.min(maxImpulse, impulse)
        );
      }

      line.lastMouseX = mouseX;
      line.lastMouseY = mouseY;
    });
  });

  // ========================================
  // RESET MOUSE TRACKING
  // ========================================

  treeElement.addEventListener('mouseleave', () => {
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

  // ========================================
  // REDUCED MOTION ACCESSIBILITY
  // ========================================

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (!prefersReducedMotion) {
    requestAnimationFrame(animate);
  }
})();
