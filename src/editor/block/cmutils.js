// codemirror utilities

import { EditorView } from "@codemirror/view";

/**
 * @param {EditorView} view
 * @returns {boolean}
 */
export function isReadOnly(view) {
  return view.state.readOnly;
}
