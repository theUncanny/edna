// https://github.com/sindresorhus/filename-reserved-regex/blob/main/index.js
// https://github.com/sindresorhus/filenamify/blob/main/filenamify.js
// https://gist.github.com/barbietunnie/7bc6d48a424446c44ff4

const reControlChars = /[\u0000-\u001F\u0080-\u009F]/g;
// file names that are invalid on windows
const reInvalidFileNames = /^(con|prn|aux|nul|com\d|lpt|\.|\.\.|\d)$/i;
var reIllegal = /[\/\?<>\\:\*\|":]/g;

/**
 * @param {string} s
 * @returns {string}
 */
function stringHexEscape(s) {
  let hexArray = [];
  for (let i = 0; i < s.length; i++) {
    let chex = "%" + s.charCodeAt(i).toString(16);
    hexArray.push(chex);
  }
  return hexArray.join("");
}

/**
 * @param {string} s
 * @returns {string}
 */
function hexReplacer(s) {
  return stringHexEscape(s);
}

/**
 * @param {string} s
 * @returns {string}
 */
export function toFileName(s) {
  if (reInvalidFileNames.test(s)) {
    return stringHexEscape(s);
  }
  s.replace("%", hexReplacer);
  s = s.normalize("NFD");
  s.replace(reControlChars, hexReplacer);
  s.replace(reIllegal, hexReplacer);
  return s;
}

/**
 * @param {string} s
 * @returns {string}
 */
export function fromFileName(s) {
  if (!s.includes("%")) {
    // perf: fast path for when not encoded
    return s;
  }
  var res = "";
  let n = s.length;
  for (var i = 0; i < n; i++) {
    let c = s.charAt(i);
    if (c !== "%") {
      res += c;
      continue;
    }
    let hex = s.substring(i + 1, i + 3);
    let cc = parseInt(hex, 16);
    res += String.fromCharCode(cc);
    i += 2;
  }
  return res;
}

/** @type {string[]} */
let failed = [];

/**
 * @param {string} s
 */
function test(s) {
  let fn = toFileName(s);
  let decoded = fromFileName(fn);
  if (s !== decoded) {
    console.log(`fail! '${s}' => '${fn}', decoded: '${decoded}'`);
    failed.push(s);
  } else {
    console.log(`ok! ${s} => ${fn} ok!`);
  }
}

function printFailed() {
  for (let s of failed) {
    let fn = toFileName(s);
    let decoded = fromFileName(fn);
    console.log(`failed encoding/decoding`);
    console.log(`  encoded: '${fn}`);
    console.log(`     orig: '${s}`);
    console.log(`  decoded: '${decoded}`);
  }
}

if (true) {
  let toTest = [
    "lala",
    "con",
    ".",
    "..",
    "foo  ",
    "gri<ll",
    "is%here",
    "og\u009F",
    "laé",
  ];
  for (let s of toTest) {
    test(s);
  }
  printFailed();
}
