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
