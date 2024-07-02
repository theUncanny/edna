// based mostly on https://github.com/IvanMathy/Boop/tree/main/Scripts

/** @typedef {{
  api: number,
  name: string,
  author: string,
  description: string,
  icon: string,
  tags: string,
  fn: (text: string) => any,
}} BlockFunction */

/** @type {BlockFunction[]} */
export const blockFunctions = [
  {
    api: 1,
    name: "Toggle Camel and Hyphen",
    description: "Turns camelCase to camel-case and vice versa",
    author: "Christian Heilmann",
    icon: "table",
    tags: "camelcase,hyphencase,syntax,codestandards",
    fn: toggleCamelHyphen,
  },
  {
    api: 1,
    name: "Join Lines",
    description: "Joins all lines without any delimiter.",
    author: "riesentoaster",
    icon: "collapse",
    tags: "join",
    fn: joinLines,
  },
];

// https://github.com/IvanMathy/Boop/blob/main/Scripts/toggleCamelHyphen.js
function toggleCamelHyphen(str) {
  let chunks = str.split(/\n/);
  chunks.forEach((c, k) => {
    if (c.indexOf("-") !== -1) {
      chunks[k] = c.replace(/\W+(.)/g, (x, chr) => {
        return chr.toUpperCase();
      });
    } else {
      chunks[k] = c
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .replace(/([0-9])([^0-9])/g, "$1-$2")
        .replace(/([^0-9])([0-9])/g, "$1-$2")
        .replace(/-+/g, "-")
        .toLowerCase();
    }
  });
  return chunks.join("\n");
}

// https://github.com/IvanMathy/Boop/blob/main/Scripts/JoinLines.js

function joinLines(input) {
  input = input.replace(/\n/g, "");
}
