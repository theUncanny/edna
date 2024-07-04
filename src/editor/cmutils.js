// codemirror utilities

import { EditorView } from "@codemirror/view";

/**
 * @param {EditorView} view
 * @returns {boolean}
 */
export function isReadOnly(view) {
  return view.state.readOnly;
}

/**
 * @param {EditorView} view
 * @returns {{from: number, to: number, selectedText: string}}
 */
export function getCurrentSelection(view) {
  const { from, to } = view.state.selection.main;
  const selectedText = view.state.doc.sliceString(from, to);
  return { from, to, selectedText };
}

/**
 * try real hard to put focus in EditorView
 * @param {EditorView} view
 */
export function focusEditorView(view) {
  if (!view || view.hasFocus) {
    // console.log("focusEditorView: no editorView or already has focus")
    return;
  }
  let max = 10; // limit to 1 sec
  const timer = setInterval(() => {
    view.focus();
    max -= 1;
    if (view.hasFocus || max < 0) {
      // if (max < 0) {
      //   console.log("focusEditorView: failed to focus")
      // }
      // if (editorView.hasFocus) {
      //   console.log("focusEditorView: focused")
      // }
      clearInterval(timer);
    }
  }, 100);
}
