import fs from "node:fs";
import { keyHelpStr } from "./key-helper.js";
import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import path from "node:path";

console.log("Generting html-win.html and html-mac.html from note-help.md");

/**
 * @param {string} platform
 * @returns {string}
 */
export function getModChar(platform) {
  return platform === "darwin" ? "⌘" : "Ctrl";
}

/**
 * @param {string} platform
 * @returns {string}
 */
export function getAltChar(platform) {
  return platform === "darwin" ? "⌥" : "Alt";
}

/**
 * @param {string} s
 * @param {string} platform
 * @returns {string}
 */
function fixUpShortcuts(s, platform) {
  let modChar = getModChar(platform);
  let altChar = getAltChar(platform);
  s = s.replace(/Alt/g, altChar);
  s = s.replace(/Mod/g, modChar);
  return s;
}

/**
 * @param {string} s
 * @returns {string}
 */
function removeMathBlock(s) {
  // remove text between "∞∞∞math" and "∞∞∞"
  // that part is not appropriate for HTML
  return s.replace(/(\n)(∞∞∞math[\s\S]*)(∞∞∞markdown\n# Privacy)/gm, "$1$3");
}

/**
 * @param {string[]} lines
 * @param {string} s
 * @returns {string[]}
 */
function removeLineStartingWith(lines, s) {
  return lines.filter((line) => !line.startsWith(s));
}

/**
 * @param {string[]} lines
 * @returns {string[]}
 */
function collapseMultipleEmptyLines(lines) {
  let newLines = [];
  let lastLineWasEmpty = false;
  for (let line of lines) {
    if (line === "") {
      if (!lastLineWasEmpty) {
        newLines.push(line);
        lastLineWasEmpty = true;
      }
    } else {
      newLines.push(line);
      lastLineWasEmpty = false;
    }
  }
  return newLines;
}

/**
 * @param {string} platform
 * @returns {string}
 */
function getHelp(platform) {
  let path = "./src/note-help.md";
  let helpRaw = fs.readFileSync(path, "utf8");
  helpRaw = removeMathBlock(helpRaw);

  let lines = helpRaw.split("\n");
  lines = removeLineStartingWith(lines, "This is a help note");
  lines = removeLineStartingWith(lines, "To see help in HTML");
  lines = collapseMultipleEmptyLines(lines);
  helpRaw = lines.join("\n");

  let keyHelp = keyHelpStr(platform);
  keyHelp = "```\n" + keyHelp + "\n```";

  let help = fixUpShortcuts(helpRaw, platform);
  help = help.replace("{{keyHelp}}", keyHelp);
  // link Edna to website
  // help = help.replace(/Edna/g, "[Edna](https://edna.arslexis.io)");

  return help;
}

/**
 * @param {string} str
 * @returns {string}
 */
function cleanMd(str) {
  return str
    .split("\n")
    .filter((line) => !line.startsWith("∞∞∞"))
    .join("\n");
}

let htmlStart = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Security-Policy" content="script-src 'self' 'unsafe-inline';" />
    <meta name="color-scheme" content="light dark">
    <title>About Edna</title>
    <link rel="stylesheet" href="help.css">
  </head>
  <body>
    <div class="content">
  `;

let htmlEnd = `
    </div>
  </body>
</html>
`;

/**
 * @param {markdownIt} md
 */
function addTargetBlank(md) {
  // Remember old renderer, if overridden, or proxy to default renderer
  var defaultRender =
    md.renderer.rules.link_open ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };

  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    // If you are using linkify to automatically detect links, you might want to
    // check if it's an external link here. You can do so based on tokens[idx].href

    // Add target="_blank" to all links
    var aIndex = tokens[idx].attrIndex("target");
    if (aIndex < 0) {
      tokens[idx].attrPush(["target", "_blank"]); // add new attribute
    } else {
      tokens[idx].attrs[aIndex][1] = "_blank"; // replace existing attribute
    }

    // pass token to default renderer.
    return defaultRender(tokens, idx, options, env, self);
  };
}

function genHTMLFromMarkdown() {
  let md = markdownIt({
    linkify: true,
  });
  md.use(markdownItAnchor, {
    // Here you can pass options to markdown-it-anchor
    // For example, setting the permalink option:
    permalink: markdownItAnchor.permalink.headerLink(),
  });

  md.use(addTargetBlank);

  {
    let mdText = cleanMd(getHelp("windows"));
    let htmlText = md.render(mdText);
    htmlText = htmlStart + htmlText + htmlEnd;
    let fpath = path.join("public", "help-win.html");
    fs.writeFileSync(fpath, htmlText);
    console.log("wrote", fpath);
  }
  {
    let mdText = cleanMd(getHelp("darwin"));
    let htmlText = md.render(mdText);
    htmlText = htmlStart + htmlText + htmlEnd;
    let fpath = path.join("public", "help-mac.html");
    fs.writeFileSync(fpath, htmlText);
    console.log("wrote", fpath);
  }
}

genHTMLFromMarkdown();
