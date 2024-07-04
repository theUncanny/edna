import { EditorView } from "@codemirror/view";
import { getActiveNoteBlock } from "./editor/block/block";
import { setReadOnly } from "./editor/editor";
import { getLanguage, langSupportsRun } from "./editor/languages";
import { insertAfterActiveBlock } from "./editor/block/format-code";
import { isReadOnly } from "./editor/block/cmutils";
import { ensureStringEndsWithNL, len } from "./util";

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

async function evalWithConsoleCapture(js) {
  const originalConsole = console;
  const capturedLogs = [];
  function logFn(...args) {
    let all = "";
    for (let arg of args) {
      let s = JSON.stringify(arg);
      if (all != "") {
        all += " "
      }
      all += s;
    }
    capturedLogs.push(all);
  }
  console.log = logFn;
  console.debug = logFn;
  console.warn = logFn;
  console.error = logFn;
  let res = await eval(js);
  console.log = originalConsole.log;
  console.debug = originalConsole.debug;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  return [res, capturedLogs];
}

/*
 * @param {string} js
 */
export async function runJS(js) {
  // let res = await eval(js);
  let [res, logs] = await evalWithConsoleCapture(js);
  // this returns last returned javascript value or undefined
  let resTxt = `${res}`;
  if (len(logs) > 0) {
    resTxt = ensureStringEndsWithNL(resTxt);
    resTxt += "console output:\n";
    resTxt += logs.join("\n");
  }
  console.log(logs);
  return resTxt;
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
  // console.log("runBlockContent: lang:", lang);
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
