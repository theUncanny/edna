// based mostly on https://github.com/IvanMathy/Boop/tree/main/Scripts

import { getBuiltInFunctionsJS } from "./initial-content";
import { len } from "./util";

/** @typedef {{
  api: number,
  name: string,
  author: string,
  description: string,
  icon: string,
  tags: string,
  bias?: number,
  code: string,
}} BoopFunction */

/** @typedef {{
 text: string,
 fullText: string,
 postInfo: (s: string) => void,
 postError: (s: string) => void,
}} BoopFunctionArg */

/**
 * @param {string} s
 * @returns {BoopFunction}
 */
export function parseBoopFunction(s) {
  let metaStart = s.indexOf("/**");
  let metaEnd = s.indexOf("**/");
  if (metaStart < 0 && metaEnd < 0) {
    return null;
  }
  let metaStr = s.substring(metaStart + 3, metaEnd);
  let meta = null;
  try {
    meta = JSON.parse(metaStr);
  } catch (e) {
    return null;
  }
  if (!meta.name || typeof meta.name !== "string") {
    return null;
  }
  meta.code = s.substring(metaEnd + 3).trim();
  return meta;
}

/**
 * @param {BoopFunction[]} funcs
 * @param {string} name
 * @returns {BoopFunction}
 */
export function findFunctionByName(funcs, name) {
  for (let f of funcs) {
    if (f.name === name) {
      return f;
    }
  }
  return null;
}

/**
 * @param {string} s
 * @returns {BoopFunction[]}
 */
export function parseBoopFunctions(s) {
  let parts = s.split("// ----------------------------");
  let n = len(parts);
  /** @type {BoopFunction[]} */
  let res = Array(n);
  let i = 0;
  for (let p of parts) {
    let meta = parseBoopFunction(p);
    if (meta) {
      res[i++] = meta;
    }
  }
  res.length = i;
  return res;
}

/** @tye {BoopFunction[]} */
export let boopFunctions = [];

export function getBoopFunctions() {
  if (len(boopFunctions) === 0) {
    let jsRaw = getBuiltInFunctionsJS();
    boopFunctions = parseBoopFunctions(jsRaw);
  }
  return boopFunctions;
}

/**
 * @param {BoopFunction} f
 * @param {BoopFunctionArg} arg
 * @return {Promise<void>}
 */
export async function runBoopFunction(f, arg) {
  let jsCode =
    f.code +
    `
export const fnMain = main;
  `;
  const blobData = new Blob([jsCode], {
    type: "text/javascript",
  });
  const url = URL.createObjectURL(blobData);
  const mod = await import(url);
  console.log(mod);
  await mod.fnMain(arg);
}

/**
 * @param {BoopFunction} f
 * @param {string} txt
 */
export async function runBoopFunctionWithText(f, txt) {
  /** @type {import("./functions").BoopFunctionArg} */
  let input = {
    text: txt,
    fullText: txt,
    postInfo: (s) => {
      console.log("info:", s);
    },
    postError: (s) => {
      console.log("error:", s);
    },
  };
  let res = await runBoopFunction(f, input);
  console.log("res:", res);
}
