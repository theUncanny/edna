/**
 * @param {HTMLElement} node
 */
export function focus(node, delay = 50) {
  // note: not sure why I need this but e.g. if I have CodeMirror,
  // the codemirror element regains focus if I set my focus
  // immediately on mount. Delay of 100 seems to fix it (50 was too low)
  // is it just with codemirror or more general?
  setTimeout(() => {
    node.focus();
    // console.log("focused", node);
  }, delay);
}

export function hasFocusedChild(element) {
  // Get the currently focused element
  const activeElement = document.activeElement;
  // console.log("activeElement:", activeElement);

  // Check if the active element is a child of the given element
  return element.contains(activeElement);
}

/**
 * focus but only if doesn't have focused children
 * @param {HTMLElement} node
 */
export function smartfocus(node) {
  setTimeout(() => {
    if (hasFocusedChild(node)) {
      return;
    }
    node.focus();
  }, 150);
}

// return {x, y} position that ensures that rect is visible inside window
export function ensureRectVisibleInWindow(rect) {
  let x = rect.x;
  const winDx = window.innerWidth;
  const rEndX = x + rect.width;
  if (rEndX > winDx) {
    x = winDx - rect.width - 15;
  }
  if (x < 4) {
    x = 4;
  }

  let y = rect.y;
  const winDy = window.innerHeight;
  const rEndY = y + rect.height;
  if (rEndY > winDy) {
    y = winDy - rect.height - 15;
  }
  if (y < 4) {
    y = 4;
  }
  return { x: x, y: y };
}

/**
/* action that ensures that the node is fully visible in the window
 * @param {HTMLElement} node
 */
export function ensurevisible(node) {
  const r = node.getBoundingClientRect();
  const { x, y } = ensureRectVisibleInWindow(r);
  Object.assign(node.style, {
    // position: "fixed",
    left: `${x}px`,
    top: `${y}px`,
  });
  // console.log(`ensureVisible: x: ${x}, y: ${y}, r:`, r);
  // console.log(
  //   `ensurevisible: top: ${st.top}, left: ${st.left}, bottom: ${st.bottom}, right: ${st.right}`,
  // );
}

/**
 * @param {HTMLElement} node
 * @param {KeyboardEvent} ev
 */
export function trapFocusEvent(node, ev) {
  const focusableElements = node.querySelectorAll(
    'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]',
  );

  const firstElement = /** @type {HTMLElement} */ (focusableElements[0]);
  const lastElement = /** @type {HTMLElement} */ (
    focusableElements[focusableElements.length - 1]
  );

  if (ev.shiftKey && document.activeElement === firstElement) {
    ev.preventDefault();
    lastElement.focus();
  } else if (!ev.shiftKey && document.activeElement === lastElement) {
    ev.preventDefault();
    firstElement.focus();
  }
}

/**
 * @param {HTMLElement} node
 */
export function trapfocus(node) {
  function handleKeydown(ev) {
    if (ev.key === "Tab") {
      trapFocusEvent(node, ev);
    }
  }

  node.addEventListener("keydown", handleKeydown);
  return {
    destroy() {
      node.removeEventListener("keydown", handleKeydown);
    },
  };
}
