
const treeElement = document.querySelector("#tree");


// ========================================
// DISTANCE FROM POINT TO LINE SEGMENT
// ========================================

function pointToLineDistance(px, py, x1, y1, x2, y2) {

  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const len_sq = C * C + D * D;

  let param = dot / len_sq;

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
    "http://www.w3.org/2000/svg",
    "g"
  );

  const image = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "image"
  );

  image.setAttribute(
    "href",
    src
  );

  const width = 1000;
  const height = 240;

  image.setAttribute("width", width);
  image.setAttribute("height", height);
  image.setAttribute("x", x2 - width);
  image.setAttribute("y", y2 - height / 2);

  group.appendChild(image);
  treeElement.appendChild(group);

  if (baseRotation !== 0) {
    group.setAttribute(
      "transform",
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
    "transform",
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
    "branch-art-3.svg", 15
  ),

  // Middle branch
  createLine(
    64, 240, 192, 240,
    "branch-art.svg", 0
  )

];


// ========================================
// INTERACTION SETTINGS
// ========================================

// How close the mouse must be to a branch
const hoverRadius = 50;

// Maximum rotation caused by interaction
const maxAngleOffset = 15;

// Lower value = gentler movement
const moveStrength = 0.012;

// Horizontal movement has only 15% influence
const horizontalInfluence = 0.15;

// Prevent sudden exaggerated impulses
const maxImpulse = 0.35;

let mouseX = -1000;
let mouseY = -1000;


// ========================================
// MOUSE TRACKING
// ========================================

treeElement.addEventListener("mousemove", (e) => {

  const rect = treeElement.getBoundingClientRect();

  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;

  lines.forEach((l) => {

    const { x1, y1, x2, y2 } = l.base;

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
        l.lastMouseX !== null &&
        l.lastMouseY !== null
      ) {

        const dx = mouseX - l.lastMouseX;
        const dy = mouseY - l.lastMouseY;

        // Vertical movement has a stronger effect.
        // Horizontal movement contributes much less.
        const movement =
          dy + dx * horizontalInfluence;

        // Reduce the effect near the edge
        // of the interaction radius.
        const proximity =
          1 - dist / hoverRadius;

        const impulse =
          movement *
          moveStrength *
          proximity;

        // Prevent sudden spikes in rotation.
        const limitedImpulse = Math.max(
          -maxImpulse,
          Math.min(maxImpulse, impulse)
        );

        l.velocity += limitedImpulse;

      }

    }

    l.lastMouseX = mouseX;
    l.lastMouseY = mouseY;

  });

});


// ========================================
// RESET MOUSE TRACKING ON LEAVE
// ========================================

treeElement.addEventListener("mouseleave", () => {

  mouseX = -1000;
  mouseY = -1000;

  lines.forEach((l) => {
    l.lastMouseX = null;
    l.lastMouseY = null;
  });

});


// ========================================
// BRANCH PHYSICS ANIMATION
// ========================================

let startTime = performance.now();

function animate(time) {

  const delta = time - startTime;

  // Gentle natural sway
  const baseAngle = Math.sin(delta / 3000) * 1.5;

  lines.forEach((l) => {

    // Spring physics
    const linearStiffness = 0.03;
    const cubicStiffness = 0.0003;
    const damping = 0.92;

    // Force pulling the branch back
    // toward its resting position.
    const force =
      -linearStiffness * l.angleOffset -
      cubicStiffness * Math.pow(l.angleOffset, 3);

    l.velocity += force;
    l.velocity *= damping;
    l.angleOffset += l.velocity;

    // Limit how far the branch can rotate.
    l.angleOffset = Math.max(
      -maxAngleOffset,
      Math.min(maxAngleOffset, l.angleOffset)
    );

    updateLine(
      l,
      baseAngle + l.angleOffset
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
