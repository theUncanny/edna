import { EditorView } from "@codemirror/view";
import { getActiveNoteBlock } from "./editor/block/block";
import { setReadOnly } from "./editor/editor";
import { getLanguage, langSupportsRun } from "./editor/languages";
import { insertAfterActiveBlock } from "./editor/block/format-code";
import { isReadOnly } from "./editor/block/cmutils";

function getError(res) {
  // TODO: don't get why there are Error and Errors
  // maybe can improve backend code?
  if (res.Error && res.Error !== "") {
    return res.Error;
  }
  if (res.Errors && res.Errors !== "") {
    return res.Errors;
  }
  return "";
}

export async function runGo(code) {
  const uri = "/api/goplay/compile";
  const rsp = await fetch(uri, {
    method: "POST",
    body: code,
  });
  if (!rsp.ok) {
    return `Error: ${rsp.status} ${rsp.statusText}`;
  }
  const res = await rsp.json();
  //console.log("res:", res);
  const err = getError(res);
  if (err != "") {
    return err;
  }
  let s = "";
  for (const ev of res.Events) {
    if (s !== "") {
      s += "\n";
    }
    if (ev.Kind === "stderr") {
      s += "Stderr:\n";
    }
    s += ev.Message;
  }
  return s;
}

/**
 * @param {string} js
 */
export async function runJS(js) {
  let res = eval(js);
  return res;
}

/**
 * @param {EditorView} view
 * @returns {Promise<boolean>}
 */
export async function runBlockContent(view) {
  const { state } = view;
  if (isReadOnly(view)) {
    return false;
  }
  const block = getActiveNoteBlock(state);
  const lang = getLanguage(block.language.name);
  console.log("runBlockContent: lang:", lang);
  if (!langSupportsRun(lang)) {
    return false;
  }

  const content = state.sliceDoc(block.content.from, block.content.to);

  setReadOnly(view, true);
  let output = "";
  let token = lang.token;
  try {
    if (token === "golang") {
      output = await runGo(content);
    } else if (token === "javascript") {
      output = await runJS(content);
    }
  } catch (e) {
    console.log(e);
    output = `error: ${e.message}`;
  }
  setReadOnly(view, false);
  if (!output) {
    output = "executed code returned empty output";
  }

  console.log("output of running code:", output);
  // const block = getActiveNoteBlock(state)
  let text = output;
  if (!output.startsWith("\n∞∞∞")) {
    // text = "\n∞∞∞text-a\n" + "output of running the code:\n" + output;
    text = "\n∞∞∞text-a\n" + output;
  }
  insertAfterActiveBlock(view, text);
  return true;
}
