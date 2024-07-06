import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { EditorState } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { getActiveNoteBlock } from "./block/block.js";

const defaultCloseBracketsConfig = {
  closeBrackets: {
    brackets: ["(", "[", "{", "'", '"'],
    before: ")]}:;>",
  },
};

const markdownCloseBracketsConfig = {
  closeBrackets: {
    brackets: ["(", "[", "{", "'", '"', "*", "_", "`"],
    before: ")]}:;>*_`",
  },
};

/**
 * Creates a dynamic close brackets extension that changes behavior based on the current block's language.
 * @returns {import("@codemirror/state").Extension}
 */
export function createDynamicCloseBracketsExtension() {
  return [
    closeBrackets(),
    keymap.of(closeBracketsKeymap),
    EditorState.languageData.of((state) => {
      const block = getActiveNoteBlock(state);
      if (block && block.language && block.language.name === "markdown") {
        return [markdownCloseBracketsConfig];
      } else {
        return [defaultCloseBracketsConfig];
      }
    }),
  ];
}
