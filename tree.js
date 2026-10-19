
(() => {
  const treeElement = document.querySelector("#tree");
  if (!treeElement) return;

  // ========================================
  // DISTANCE FROM POINT TO LINE SEGMENT
  // ========================================

  function pointToLineDistance(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const lenSq = C * C + D * D;

    const param = Math.max(
      0,
      Math.min(
        1,
        lenSq === 0 ? 0 : (A * C + B * D) / lenSq
      )
    );

    const xx = x1 + param * C;
    const yy = y1 + param * D;

    return Math.hypot(px - xx, py - yy);
  }

  // ========================================
  // CREATE BRANCH
  // ========================================

  function createLine(x1, y1, x2, y2, src, baseRotation = 0) {
    const group = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );

    const image = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image"
    );

    const width = 1000;
    const height = 240;

    image.setAttribute("href", src);
    image.setAttribute("width", width);
    image.setAttribute("height", height);
    image.setAttribute("x", x2 - width);
    image.setAttribute("y", y2 - height / 2);

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
      currentAngle: baseRotation
    };
  }

  // ========================================
  // ROTATE BRANCH
  // ========================================

  function updateLine(line, angle) {
    const { x2, y2 } = line.base;

    line.currentAngle = angle;

    line.el.setAttribute(
      "transform",
      `rotate(${angle}, ${x2}, ${y2})`
    );
  }

  // ========================================
  // CREATE TWO INDEPENDENT BRANCHES
  // ========================================

  const lines = [
    createLine(
      64, 130, 192, 130,
      "branch-art-3.svg", 15
    ),

    createLine(
      64, 240, 192, 240,
      "branch-art.svg", 0
    )
  ];

  lines.forEach(line => {
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

  let lastMouseX = null;
  let lastMouseY = null;

  // ========================================
  // GET MOUSE POSITION IN SVG COORDINATES
  // ========================================

  function getSVGMousePosition(e) {
    const matrix = treeElement.getScreenCTM();

    if (!matrix) return null;

    const point = treeElement.createSVGPoint();

    point.x = e.clientX;
    point.y = e.clientY;

    return point.matrixTransform(matrix.inverse());
  }

  // ========================================
  // GET ROTATED BRANCH POSITION
  // ========================================

  function getRotatedBranch(line) {
    const { x1, y1, x2, y2 } = line.base;

    const angle = line.currentAngle * Math.PI / 180;

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const dx = x1 - x2;
    const dy = y1 - y2;

    return {
      x1: x2 + dx * cos - dy * sin,
      y1: y2 + dx * sin + dy * cos,
      x2,
      y2
    };
  }

  // ========================================
  // MOUSE TRACKING
  // ========================================

  // Listen on the document so movement is detected
  // even when the mouse is outside the SVG element.
  document.addEventListener("mousemove", e => {
    const point = getSVGMousePosition(e);

    if (!point) return;

    const mouseX = point.x;
    const mouseY = point.y;

    if (lastMouseX === null || lastMouseY === null) {
      lastMouseX = mouseX;
      lastMouseY = mouseY;
      return;
    }

    const dx = mouseX - lastMouseX;
    const dy = mouseY - lastMouseY;

    // Find the distance to each branch independently.
    const distances = lines.map(line => {
      const branch = getRotatedBranch(line);

      return pointToLineDistance(
        mouseX,
        mouseY,
        branch.x1,
        branch.y1,
        branch.x2,
        branch.y2
      );
    });

    // Only the closest branch receives an impulse.
    // This prevents both branches reacting together.
    const closestIndex =
      distances[0] <= distances[1] ? 0 : 1;

    const closestDistance = distances[closestIndex];

    if (closestDistance < hoverRadius) {
      const line = lines[closestIndex];

      const movement =
        dy + dx * horizontalInfluence;

      const proximity =
        1 - closestDistance / hoverRadius;

      const impulse =
        movement * moveStrength * proximity;

      line.velocity += Math.max(
        -maxImpulse,
        Math.min(maxImpulse, impulse)
      );
    }

    lastMouseX = mouseX;
    lastMouseY = mouseY;
  });

  document.addEventListener("mouseleave", () => {
    lastMouseX = null;
    lastMouseY = null;
  });

  // ========================================
  // INDEPENDENT SPRING PHYSICS
  // ========================================

  const startTime = performance.now();

  function animate(time) {
    const delta = time - startTime;

    lines.forEach((line, index) => {
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

      // Slightly different natural sway per branch,
      // so they do not move in perfect sync.
      const baseAngle =
        Math.sin(delta / (3000 + index * 450) + index) * 1.5;

      updateLine(
        line,
        line.baseRotation +
        baseAngle +
        line.angleOffset
      );
    });

    requestAnimationFrame(animate);
  }

  // ========================================
  // REDUCED MOTION
  // ========================================

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (!prefersReducedMotion) {
    requestAnimationFrame(animate);
  }
})();
