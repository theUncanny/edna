// based mostly on https://github.com/IvanMathy/Boop/tree/main/Scripts

import { blockHdrJSON, blockHdrMarkdown, blockHdrPHP } from "./notes";

/** @typedef {{
  api: number,
  name: string,
  author: string,
  description: string,
  icon: string,
  tags: string,
  bias?: number,
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
  {
    api: 1,
    name: "Calculate Size (Bytes)",
    description: "Calculates size of text in Bytes",
    author: "zzz",
    icon: "counter",
    tags: "calc,size,bytes,storage",
    fn: fnCalcSize,
  },
  {
    api: 1,
    name: "Contrasting Color",
    description:
      "Determine whether black or white contrasts better with the given color(s) (one per line).",
    author: "Sunny Walker",
    icon: "color-wheel",
    tags: "contrast,color,wcag",
    fn: fnContrastingColor,
  },
  {
    api: 1,
    name: "Convert to pretty markdown table",
    description:
      "Converts csv, tsv or markdown table into pretty markdown table format.",
    author: "xshoji",
    icon: "term",
    tags: "csv,tsv,md,markdown",
    fn: fnCovertToMarkdownTable,
  },
  {
    api: 1,
    name: "CSV to JSON (headerless)",
    description: "Converts comma-separated, headerless tables to JSON.",
    author: "Flare576",
    icon: "table",
    tags: "table,convert",
    bias: -0.2,
    fn: fnCsvToJSONHeaderless,
  },
  {
    api: 1,
    name: "Digi to ASCII",
    description: "Digi to ASCII",
    author: "Joseph Ng Rong En",
    icon: "dice",
    tags: "ascii,digi",
    fn: fnDigi2ascii,
  },
  {
    api: 1,
    name: "Unicode: un-escape string",
    description:
      "Returns a readable string from unicode escaped string (js format)",
    author: "luisfontes19",
    icon: "broom",
    tags: "string,normalize,convert,readable,unicode",
    fn: fnFromUnicode,
  },
  {
    api: 1,
    name: "Unicode: escape string",
    description: "Converts a UTF8 string to unicode escape chars(js format)",
    author: "luisfontes19",
    icon: "broom",
    tags: "string,unicode,convert,escape",
    fn: fnToUnicode,
  },
  {
    api: 1,
    name: "Generate hashtag",
    description: "Generate hashtag from a word or sentence",
    author: "Armand Salle",
    icon: "metamorphose",
    tags: "hashtag,word",
    fn: fnGenHashtag,
  },
  {
    api: 1,
    name: "Join Lines With Comma",
    description: "Joins all lines with a comma.",
    author: "riesentoaster",
    icon: "collapse",
    tags: "join, comma",
    bias: -0.1,
    fn: fsJoinLinesComma,
  },
  {
    api: 1,
    name: "Join Lines With Space",
    description: "Joins all lines with a space",
    author: "riesentoaster",
    icon: "collapse",
    tags: "join, space",
    bias: -0.1,
    fn: fsJoinLinesSpace,
  },
  {
    api: 1,
    name: "JS Object to JSON",
    description: "Converts a javascript object to JSON format",
    author: "luisfontes19",
    icon: "HTML",
    tags: "json,js,object,convert",
    bias: -0.1,
    fn: fnJsObjToJSON,
  },
  {
    api: 1,
    name: "JS To PHP",
    description: "Convert JS Object or Array to PHP.",
    author: "jtolj",
    icon: "elephant",
    tags: "js,php,convert",
    fn: fnJSToPHP,
  },
  {
    api: 1,
    name: "Line compare",
    description: "Check if existing lines have all the same content",
    author: "Luis Fontes",
    icon: "type",
    tags: "string,match,text,compare,line",
    bias: -0.1,
    fn: fnLineCompare,
  },
  {
    api: 1,
    name: "List to HTML list",
    description: "Turns comma separated list to HTML Lists",
    author: "Christian Heilmann",
    icon: "table",
    tags: "HTML,Lists",
    fn: fnListToHTML,
  },
  {
    api: 1,
    name: "RGB to Hex",
    description: "Convert color in RGB to hexadecimal",
    author: "luisfontes19",
    icon: "color-wheel",
    tags: "rgb,hex,convert,color",
    fn: fnRgbToHex,
  },
];

// ----------------

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

// ---------------- join lines

// https://github.com/IvanMathy/Boop/blob/main/Scripts/JoinLines.js

function joinLines(input) {
  return input.replace(/\n/g, "");
}

// ---------------- calc size

//From https://stackoverflow.com/a/12206089
function getUTF8Length(s) {
  var len = 0;
  for (var i = 0; i < s.length; i++) {
    var code = s.charCodeAt(i);
    if (code <= 0x7f) {
      len += 1;
    } else if (code <= 0x7ff) {
      len += 2;
    } else if (code >= 0xd800 && code <= 0xdfff) {
      // Surrogate pair: These take 4 bytes in UTF-8 and 2 chars in UCS-2
      // (Assume next char is the other [valid] half and just skip it)
      len += 4;
      i++;
    } else if (code < 0xffff) {
      len += 3;
    } else {
      len += 4;
    }
  }
  return len;
}

function fnCalcSize(input) {
  let bytes = getUTF8Length(input);
  if (bytes > 1000000) {
    bytes /= 1000000;
    return `${bytes.toFixed(2)} Mb`;
  }
  if (bytes > 100000) {
    bytes /= 1000;
    return `${bytes.toFixed(2)} Kb`;
  } else {
    return `${bytes} bytes`;
  }
}

// ---------------- contrasting color

function fnContrastingColor(input) {
  let lines = input.split("\n");
  let o = lines.map((c) => betterColor(c));
  return o.join("\n");
}

// convert #rrggbb into its integer r, g, b components
const hex2Rgb = (hex) => {
  const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return rgb
    ? {
        r: parseInt(rgb[1], 16),
        g: parseInt(rgb[2], 16),
        b: parseInt(rgb[3], 16),
      }
    : null;
};

// calculate the luminance of a color
const luminance = (hex) => {
  var rgb = hex2Rgb(hex);
  var a = [rgb.r, rgb.g, rgb.b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

// calculate the contrast ratio between two colors
const contrast = (c1, c2) => {
  const l1 = luminance(c1) + 0.05;
  const l2 = luminance(c2) + 0.05;
  let ratio = l1 / l2;
  if (l2 > l1) {
    ratio = 1 / ratio;
  }
  return Math.floor(ratio * 100) / 100;
};

// convert #rbg to #rrggbb
const normalizeHex = (hex) =>
  hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, "#$1$1$2$2$3$3");

// determine the WCAG 2.0 contrast ratio level
const wcagLevel = (ratio) =>
  ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : "fail";

// determine the better contrasting color for a color
const betterColor = (hex) => {
  const h = normalizeHex(hex);
  if (!h.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)) {
    return hex;
  }
  var w = contrast(h, "#ffffff");
  var b = contrast(h, "#000000");
  var r = Math.max(w, b);
  return (
    hex +
    " // contrasts best with " +
    (w > b ? "#fff" : "#000") +
    " with a ratio of " +
    r +
    " to 1; WCAG 2.0: " +
    wcagLevel(r)
  );
};

// ----------------

function fnCovertToMarkdownTable(input) {
  let res = convertToPrettyMarkdownTableFormat(input);
  return blockHdrMarkdown + res;
}

function convertToPrettyMarkdownTableFormat(input) {
  const list = input
    .trim()
    .replace(/^(\r?\n)+$/g, "\n")
    .split("\n")
    .map((v) => v.replace(/^\||\|$/g, ""));
  const delimiter = [`|`, `\t`, `","`, `,`].find(
    (v) => list[0].split(v).length > 1,
  );
  if (delimiter === `|`) {
    // If input text is markdown table format, removes header separator.
    list.splice(1, 1);
  }
  const tableElements = list.map((record) =>
    record.split(delimiter).map((v) => v.trim()),
  );
  const calcBytes = (character) => {
    let length = 0;
    for (let i = 0; i < character.length; i++) {
      const c = character.charCodeAt(i);
      // Multibyte handling
      (c >= 0x0 && c < 0x81) ||
      c === 0xf8f0 ||
      (c >= 0xff61 && c < 0xffa0) ||
      (c >= 0xf8f1 && c < 0xf8f4)
        ? (length += 1)
        : (length += 2);
    }
    return length;
  };
  const columnMaxLengthList = tableElements[0]
    .map((v, i) => i)
    .reduce((map, columnIndex) => {
      let maxLength = 0;
      tableElements.forEach((record) =>
        maxLength < calcBytes(record[columnIndex])
          ? (maxLength = calcBytes(record[columnIndex]))
          : null,
      );
      if (maxLength === 1) {
        // Avoids markdown header line becomes only ":" ( ":-" is correct. ).
        maxLength = 2;
      }
      map[columnIndex] = maxLength;
      return map;
    }, {});
  const formattedTableElements = tableElements.map((record) =>
    record.map(
      (value, columnIndex) =>
        value +
        "".padEnd(columnMaxLengthList[columnIndex] - calcBytes(value), " "),
    ),
  );
  const headerValues = formattedTableElements.shift();
  const tableLine = headerValues.map((v) =>
    "".padStart(calcBytes(v), "-").replace(/^./, ":"),
  );
  formattedTableElements.unshift(tableLine);
  formattedTableElements.unshift(headerValues);
  return formattedTableElements
    .map((record) => "| " + record.join(" | ") + " |")
    .join("\n");
}

// ----------------

async function fnCsvToJSONHeaderless(text) {
  // @ts-ignore
  const m = await import("https://esm.sh/papaparse@5.4.1");
  const Papa = m.default;
  console.log("Papa:", Papa);
  let res = "";
  try {
    const { data } = Papa.parse(text, { header: false });
    res = JSON.stringify(data, null, 2);
    res = blockHdrJSON + res;
  } catch (e) {
    res = `Error: ${e.message}`;
  }
  return res;
}

// ----------------

function digi2a(str) {
  var split = str.split(/[ ,]+/);
  var arr = [];
  for (var i = 0, l = split.length; i < l; i++) {
    var ascii = String.fromCharCode(split[i]);
    arr.push(ascii);
  }
  return arr.join("");
}

function fnDigi2ascii(text) {
  return digi2a(text);
}

// ----------------

function fnFromUnicode(text) {
  return fromUnicode(text);
}

function fromUnicode(str) {
  return str
    .split("\\u")
    .map((u) => {
      return String.fromCharCode(parseInt(u, 16));
    })
    .join("");
}

// ----------------

function fnToUnicode(text) {
  return toUnicode(text);
}

function toUnicode(str) {
  return [...str]
    .map((c) => {
      let hex = c.charCodeAt(0).toString(16);
      if (hex.length == 2) hex = "00" + hex;
      return ("\\u" + hex).slice(-7);
    })
    .join("");
}

// ----------------

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function createHashtag(str) {
  if (str === "") {
    throw new Error("Invalid text :(");
  } else {
    const result = str.replace(/\n+/gm, " ");
    const text = result.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ0-9\s]+/gm, " ");

    return "#" + text.toLowerCase().split(" ").map(capitalize).join("");
  }
}

function fnGenHashtag(text) {
  let res = "";
  try {
    const generatedHashatag = createHashtag(text);
    res = generatedHashatag;
  } catch (e) {
    res = `Error: ${e.message}`;
  }
  return res;
}

// ----------------

function fsJoinLinesComma(text) {
  return text.replace(/\n/g, ",");
}

// ----------------

function fsJoinLinesSpace(text) {
  return text.replace(/\n/g, " ");
}

// ----------------

function fnJsObjToJSON(text) {
  let res = "";
  try {
    const data = text;
    eval("window.parsed = " + data);
    // @ts-ignore
    res = JSON.stringify(window.parsed);
  } catch (e) {
    res = `Error: ${e.message}`;
  }
  return res;
}

// ----------------

function fnJSToPHP(text) {
  const js = text.replace(/\n\n\/\/ Result:[\s\S]*$/, "");
  let res = "";
  try {
    const result = new Function(`return ${js}`)();
    res = convert(result) + ";";
  } catch (e) {
    res = `Error: ${e.message}`;
  }
  return blockHdrPHP + res;
}

const toPHP = function (value, indentation) {
  switch (typeof value) {
    case "undefined":
      value = null;
      break;
    case "object":
      if (value !== null) {
        value = convert(value, indentation + 1);
      }
      break;
    case "string":
      value = value.replace(/"/g, '\\"');
      value = `"${value}"`;
      break;
  }

  return value;
};

const convert = function (result, indentation = 1) {
  const isArray = Array.isArray(result);
  let str = Object.keys(result).reduce((acc, key) => {
    const value = toPHP(result[key], indentation);
    acc += " ".repeat(indentation * 4);
    acc += isArray ? value : `'${key}' => ${value}`;
    acc += ",\n";
    return acc;
  }, "");
  const endingIndentation = " ".repeat((indentation - 1) * 4);
  return `[\n${str}${endingIndentation}]`;
};

// ----------------

function fnLineCompare(text) {
  const lines = text.split(/\n/);
  const first = lines[0];
  const differentLines = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (first !== line) {
      differentLines.push(i + 1);
    }
  }

  let res = "";
  if (differentLines.length === 0) {
    res = "Lines are equal";
  } else if (differentLines.length === 1) {
    res = `Line ${differentLines[0]} is not equal to the line 1`;
  } else {
    res = `Lines [${differentLines.join(", ")}] are not equal to line 1`;
  }
}

// ----------------

function listToHTML(str) {
  if (str.indexOf("<ul>") === -1) {
    let chunks = str.split(",");
    let out = `<ul>
  <li>${chunks.join("</li>\n  <li>")}`;
    return out + "</li>\n</ul>";
  } else {
    let chunks = str.split("<li>");
    let out = [];
    chunks.forEach((c) => {
      out.push(c.match(/[^<]*/));
    });
    out.shift();
    return out.join(",");
  }
}

function fnListToHTML(text) {
  return listToHTML(text);
}

// ----------------

function fnRgbToHex(text) {
  const rgb = text;
  const rgbArray = rgb.includes(",") ? rgb.split(",") : rgb.split(" ");

  if (rgbArray.length !== 3) {
    return "Invalid RGB format";
  }

  let hex = "#";

  try {
    rgbArray.forEach((c) => {
      hex += parseInt(c).toString(16);
    });
  } catch (error) {
    return "Invalid RGB value";
  }

  return hex.toUpperCase();
}
