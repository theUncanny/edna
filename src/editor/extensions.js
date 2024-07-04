import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { EditorState } from "@codemirror/state";
import { keymap } from "@codemirror/view";

export const customCloseBracketsConfig = EditorState.languageData.of(() => [
  {
    closeBrackets: {
      brackets: ["(", "[", "{", "'", '"', "*"],
      before: ")]}:;>*",
    },
  },
]);

export const customCloseBracketsExtension = [
  closeBrackets(),
  keymap.of(closeBracketsKeymap),
  customCloseBracketsConfig,
];
