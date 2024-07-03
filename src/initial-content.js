import { platformName } from "./util.js";

import dailyJournalRaw from "./note-daily-journal.md?raw";
import { fixUpNoteContent } from "./notes.js";
import helpRaw from "./note-help.md?raw";
import inboxRaw from "./note-inbox.md?raw";
import initialDevRaw from "./note-initial-dev.md?raw";
import scratchRaw from "./note-initial.md?raw";
import { fixUpShortcuts, keyHelpStr } from "./key-helper.js";
import releaseNotesRaw from "./note-release-notes.md?raw";
import builtInFunctionsRaw from "./note-built-in-functions.js?raw";

/**
 * @returns {string}
 */
export function getHelp(platform = platformName) {
  let keyHelp = keyHelpStr(platform);
  let help = fixUpShortcuts(helpRaw, platform);
  help = help.replace("{{keyHelp}}", keyHelp);
  // links are for generated html under /help
  // when showing as note, it's just noise
  help = help.replaceAll("[Edna](https://edna.arslexis.io)", "Edna");
  return fixUpNoteContent(help);
}

/**
 * @returns {string}
 */
export function getBuiltInFunctionsNote() {
  return builtInFunctionsRaw;
}

/**
 * @param {string} s
 * @returns {string}
 */
function fixUpNote(s) {
  s = fixUpNoteContent(s);
  s = fixUpShortcuts(s);
  let keyHelp = keyHelpStr(platformName);
  s = s.replace("{{keyHelp}}", keyHelp);
  return s;
}

/**
 * @returns {string}
 */
export function getReleaseNotes() {
  return fixUpNote(releaseNotesRaw);
}

/**
 * @returns {string}
 */
export function getInboxNote() {
  return fixUpNote(inboxRaw);
}

/**
 * @returns {string}
 */
export function getJournalNote() {
  return fixUpNote(dailyJournalRaw);
}

/**
 * @returns {string}
 */
export function getWelcomeNote() {
  return fixUpNote(scratchRaw);
}

/**
 * @returns {string}
 */
export function getWelcomeNoteDev() {
  return getWelcomeNote() + initialDevRaw;
}
