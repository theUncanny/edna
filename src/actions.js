/**
 * @param {HTMLElement} node
 */
export function focus(node, delay = 100) {
  // note: not sure why I need this but e.g. if I have CodeMirror,
  // the codemirror element regains focus if I set my focus
  // immediately on mount. Delay of 100 seems to fix it (50 was too low)
  // is it just with codemirror or more general?
  setTimeout(() => node.focus(), delay);
}

export function hasFocusedChild(element) {
  // Get the currently focused element
  const activeElement = document.activeElement;

  // Check if the active element is a child of the given element
  return element.contains(activeElement);
}

/**
 * focus but only if doesn't have focused children
 * @param {HTMLElement} node
 * @param {number} delay
 */
export function smartfocus(node, delay = 100) {
  if (hasFocusedChild(node)) {
    return;
  }
  focus(node, delay);
}

/**
 * @param {HTMLElement} node
 * @param {() => void} cb
 */
export function focusout(node, cb) {
  console.log("focusout:", node);
  function onfocusout(ev) {
    console.log("focusout:", ev);
    if (node !== ev.relatedTarget && !node.contains(ev.relatedTarget)) {
      cb();
    }
  }
  node.addEventListener("onfocusout", onfocusout);
  return {
    destroy() {
      console.log("focusout destroy:", node);
      node.removeEventListener("onfocusout", onfocusout);
    },
  };
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
    left: `${x}px`,
    top: `${y}px`,
  });
  console.log(`ensureVisible: x: ${x}, y: ${y}, r:`, r);
  // console.log(
  //   `ensurevisible: top: ${st.top}, left: ${st.left}, bottom: ${st.bottom}, right: ${st.right}`,
  // );
}
