import { getAltChar, getModChar, platformName } from "./util.js";

import dailyJournalRaw from "./note-daily-journal.md?raw";
import { fixUpNoteContent } from "./notes.js";
import helpRaw from "./note-help.md?raw";
import inboxRaw from "./note-inbox.md?raw";
import initialDevRaw from "./note-initial-dev.md?raw";
import initialRaw from "./note-initial.md?raw";
import { keyHelpStr } from "./key-helper.js";
import releaseNotesRaw from "./note-release-notes.md?raw";

function fixUpShortcuts(s, platform = platformName) {
  let modChar = getModChar(platform);
  let altChar = getAltChar(platform);
  s = s.replace(/Alt/g, altChar);
  s = s.replace(/Mod/g, modChar);
  return s;
}

export function getHelp(platform = platformName) {
  let keyHelp = keyHelpStr(platform);
  let help = fixUpShortcuts(helpRaw, platform);
  help = help.replace("{{keyHelp}}", keyHelp);
  // links are for generated html under /help
  // when showing as note, it's just noise
  help = help.replaceAll("[Edna](https://edna.arslexis.io)", "Edna");
  return fixUpNoteContent(help);
}

export function getReleaseNotes() {
  return fixUpShortcuts(releaseNotesRaw);
}

export function getInitialContent(platform = platformName) {
  let keyHelp = keyHelpStr(platform);

  let initial = fixUpNoteContent(initialRaw);
  initial = fixUpShortcuts(initial);
  initial = initial.replace("{{keyHelp}}", keyHelp);

  let initialDev = initialDevRaw;
  initialDev = fixUpShortcuts(initialDev);
  let initialDevContent = initial + initialDev;
  initialDevContent = fixUpNoteContent(initialDevContent);

  let initialJournal = fixUpNoteContent(dailyJournalRaw);
  initialJournal = fixUpShortcuts(initialJournal);

  let initialInbox = fixUpNoteContent(inboxRaw);
  initialInbox = fixUpShortcuts(initialInbox);

  return {
    initialContent: initial,
    initialDevContent,
    initialJournal,
    initialInbox,
  };
}
