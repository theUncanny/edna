import { expect, test } from "bun:test";
import { fromFileName, toFileName } from "./filenamify";

test("encode", () => {
  let toTest = [
    "%",
    "%0025",
    "lala",
    "lala",
    "con",
    "%0063%006f%006e",
    ".",
    "%002e",
    "..",
    "%002e%002e",
    "foo  ",
    "foo  ",
    "gri<ll",
    "gri%003cll",
    "is%he",
    "is%0025he",
    "og\u009F",
    "og%009f",
    "laé",
    "la%00e9",
    "✨",
    "%2728",
    "draft: hello",
    "draft%003a hello",
  ];
  let n = toTest.length / 2;
  for (let i = 0; i < n; i++) {
    let s = toTest[i * 2];
    let exp = toTest[i * 2 + 1];
    let encoded = toFileName(s);
    expect(encoded).toBe(exp);
    let decoded = fromFileName(encoded);
    expect(decoded).toBe(s);
  }
});
