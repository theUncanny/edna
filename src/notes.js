import {
  blobFromUint8Array,
  fsDeleteFile,
  fsReadBinaryFile,
  fsReadTextFile,
  fsRenameFile,
  fsWriteBlob,
  fsWriteTextFile,
  openDirPicker,
  readDir,
} from "./fileutil";
import {
  clearModalMessage,
  setModalMessageHTML,
} from "./components/ModalMessage.svelte";
import { decryptBlobAsString, encryptStringAsBlob, hash } from "kiss-crypto";
import { formatDateYYYYMMDDDay, isDev, len, throwIf, trimSuffix } from "./util";
import { fromFileName, isValidFileName, toFileName } from "./filenamify";
import { getHelp, getInitialContent, getReleaseNotes } from "./initial-content";
import { getSettings, loadSettings, saveSettings } from "./settings";
import {
  getStats,
  incNoteCreateCount,
  incNoteDeleteCount,
  incNoteSaveCount,
} from "./state";
import { historyPush, removeNoteFromHistory, renameInHistory } from "./history";

import { KV } from "./dbutil";
import { dirtyState } from "./state.svelte";

// is set if we store notes on disk, null if in localStorage
/** @type {FileSystemDirectoryHandle | null} */
let storageFS = null;

/**
 * if we're storing notes on disk, returns dir handle
 * returns null if we're storing in localStorage
 * @returns {FileSystemDirectoryHandle | null}
 */
export function getStorageFS() {
  // console.log("getStorageFS:", storageFS);
  return storageFS;
}

/**
 * @param {FileSystemDirectoryHandle} dh
 */
export function setStorageFS(dh) {
  console.log("setStorageFS:", dh);
  storageFS = dh;
}

// some things, like FilesystemDirectoryHandle, we need to store in indexedDb
const db = new KV("edna", "keyval");

const kStorageDirHandleKey = "storageDirHandle";

const kLSPassowrdKey = "edna-password";

/**
 * @param {string} pwd
 */
function rememberPassword(pwd) {
  localStorage.setItem(kLSPassowrdKey, pwd);
}

function removePassword() {
  localStorage.removeItem(kLSPassowrdKey);
}

function getPasswordHash() {
  let pwd = localStorage.getItem(kLSPassowrdKey);
  if (!pwd) {
    return null;
  }
  let pwdHash = saltPassword(pwd);
  return pwdHash;
}

/**
 * @returns {Promise<FileSystemDirectoryHandle>}
 */
export async function dbGetDirHandle() {
  let dh = await db.get(kStorageDirHandleKey);
  setStorageFS(dh ? dh : null);
  return storageFS;
}

/**
 * @param {FileSystemDirectoryHandle} dh
 */
export async function dbSetDirHandle(dh) {
  await db.set(kStorageDirHandleKey, dh);
  storageFS = dh;
}

export async function dbDelDirHandle() {
  await db.del(kStorageDirHandleKey);
  storageFS = null;
}

const kEdnaFileExt = ".edna.txt";
const kEdnaEncrFileExt = ".encr.edna.txt";

function isEncryptedEdnaFile(fileName) {
  return fileName.endsWith(kEdnaEncrFileExt);
}
/**
 * @param {string} fileName
 * @returns {boolean}
 */
function isEdnaFile(fileName) {
  return fileName.endsWith(kEdnaFileExt);
}

/**
 * @param {string} name
 * @returns {string}
 */
function trimEdnaExt(name) {
  let s = trimSuffix(name, kEdnaEncrFileExt);
  s = trimSuffix(s, kEdnaFileExt);
  throwIf(s === name); // assumes we chacked before calling
  return s;
}

/**
 * @param {string} name
 * @param {boolean} [isEncr]
 * @returns {string}
 */
export function notePathFromNameFS(name, isEncr = null) {
  if (isEncr === null) {
    isEncr = isEncryptedNote(name);
  }
  name = toFileName(name); // note: must happen after isEncryptedNote() check
  let ext = isEncr ? kEdnaEncrFileExt : kEdnaFileExt;
  return name + ext;
}

const kLSKeyPrefix = "note:";
// TODO: we're not encrypting notes in local storage. maybe we never will
const kLSKeyEncrPrefix = "note.encr:";

function notePathFromNameLS(name) {
  let isEncr = isEncryptedNote(name);
  if (isEncr) {
    return kLSKeyEncrPrefix + name;
  }
  return kLSKeyPrefix + name;
}

export function notePathFromName(name) {
  let dh = getStorageFS();
  if (dh) {
    return notePathFromNameFS(name);
  } else {
    return notePathFromNameLS(name);
  }
}

export const kScratchNoteName = "scratch";
export const kDailyJournalNoteName = "daily journal";
export const kInboxNoteName = "inbox";

export const kHelpSystemNoteName = "system:help";
export const kReleaseNotesSystemNoteName = "system:Release Notes";

const systemNotes = [kHelpSystemNoteName, kReleaseNotesSystemNoteName];
/**
 * @param {string} name
 * @returns {boolean}
 */
export function isSystemNoteName(name) {
  return systemNotes.includes(name);
}

export const blockHdrPlainText = "\n∞∞∞text-a\n";
export const blockHdrMarkdown = "\n∞∞∞markdown\n";

/**
 * @param {string[]} existingNotes
 * @returns {Promise<number>}
 */
export async function createDefaultNotes(existingNotes) {
  /**
   * @param {string} name
   * @param {string} md - markdown content
   * @returns {Promise<number>}
   */
  async function createIfNotExists(name, md) {
    if (existingNotes.includes(name)) {
      console.log("skipping creating note", name);
      return 0;
    }
    let content = blockHdrMarkdown + md;
    await createNoteWithName(name, content);
    return 1;
  }
  let isFirstRun = getStats().appOpenCount < 2;
  console.log("isFirstRun:", isFirstRun);

  const { initialContent, initialDevContent, initialJournal, initialInbox } =
    getInitialContent();

  const s = false && isDev ? initialDevContent : initialContent;
  let nCreated = await createIfNotExists(kScratchNoteName, s);
  // scratch note must always exist but the user can delete inbox / daily journal notes
  if (isFirstRun) {
    // re-create those notes if the user hasn't deleted them
    nCreated += await createIfNotExists(kDailyJournalNoteName, initialJournal);
    nCreated += await createIfNotExists(kInboxNoteName, initialInbox);
  }
  if (nCreated > 0) {
    await loadNoteNames();
  }
  if (isFirstRun) {
    await loadNotesMetadata(); // must pre-load to make them available
    reassignNoteShortcut("scratch", "1");
    reassignNoteShortcut("daily journal", "2");
    reassignNoteShortcut("inbox", "3");
  }
  return nCreated;
}

/**
 * @returns {string[][]}
 */
function loadNoteNamesLS() {
  /**
   * @param {string} notePath
   * @returns {string}
   */
  function getNoteNameLS(notePath) {
    const i = notePath.indexOf(":");
    return notePath.substring(i + 1);
  }

  let allNotes = [];
  let encryptedNotes = [];
  let nKeys = localStorage.length;
  for (let i = 0; i < nKeys; i++) {
    const key = localStorage.key(i);
    let isEncr = key.startsWith(kLSKeyEncrPrefix);
    let isRegular = key.startsWith(kLSKeyPrefix);
    if (isEncr || isRegular) {
      let name = getNoteNameLS(key);
      allNotes.push(name);
      if (isEncr) {
        encryptedNotes.push(name);
      }
    }
  }
  return [allNotes, encryptedNotes];
}

// we must cache those because loadNoteNames() is async and we can't always call it
// note: there's a potential of getting out of sync
/** @type {string[]} */
let latestNoteNames = [];
/** @type {string[]} */
let encryptedNoteNames = [];

/**
 * returns null if not a valid name
 * @param {string} fileName
 * @returns {string}
 */
function nameFromFileName(fileName) {
  throwIf(!isValidFileName(fileName));
  let encodedName = trimEdnaExt(fileName);
  let name = fromFileName(encodedName);
  return name;
}

/**
 * we might have non-escaped file names if:
 * - those are notes created before our escaping scheme
 * - user renmaed the note on disk
 * @param {FileSystemDirectoryHandle} dh
 * @returns {Promise<void>}
 */
export async function ensureValidNoteNamesFS(dh) {
  let fsEntries = await readDir(dh);
  for (let e of fsEntries.dirEntries) {
    if (e.isDir) {
      continue;
    }
    let oldName = e.name;
    if (!isEdnaFile(oldName)) {
      continue;
    }
    if (isValidFileName(oldName)) {
      continue;
    }
    let newName = toFileName(oldName);
    // note: if newName already exists, it'll be over-written
    fsRenameFile(dh, newName, oldName);
    console.log(`renamed '${oldName}' => '${newName}`);
  }
}

/**
 * @param {FileSystemDirectoryHandle} dh
 * @param {(fileName, noteName, isEncr) => Promise<void>} fn
 */

async function forEachNoteFileFS(dh, fn) {
  let fsEntries = await readDir(dh);
  // console.log("files", fsEntries);
  for (let e of fsEntries.dirEntries) {
    if (e.isDir) {
      continue;
    }
    let fileName = e.name;
    if (!isEdnaFile(fileName)) {
      continue;
    }
    if (!isValidFileName(fileName)) {
      continue;
    }
    let name = nameFromFileName(fileName);
    // filter out empty names, can be created maliciously or due to a bug
    if (name === "") {
      continue;
    }
    let isEncr = fileName.endsWith(kEdnaEncrFileExt);
    await fn(fileName, name, isEncr);
  }
}

/**
 * @param {FileSystemDirectoryHandle} dh
 * @returns {Promise<string[][]>}
 */
async function loadNoteNamesFS(dh) {
  /** @type {string[]} */
  let all = [];
  /** @type {string[]} */
  let encrypted = [];
  await forEachNoteFileFS(dh, async (fileName, name, isEncr) => {
    console.log("loadNoteNamesFS:", fileName);
    all.push(name);
    if (isEncr) {
      encrypted.push(name);
    }
  });
  // console.log("loadNoteNamesFS() res:", res);
  return [all, encrypted];
}

/**
 * after creating / deleting / renaming a note we need to update
 * cached latestNoteNames
 * @returns {Promise<string[]>}
 */
export async function loadNoteNames() {
  let dh = getStorageFS();
  /** @type {string[][]} */
  let res = [];
  if (!dh) {
    res = loadNoteNamesLS();
  } else {
    res = await loadNoteNamesFS(dh);
  }
  latestNoteNames = res[0];
  encryptedNoteNames = res[1];
  // console.log("loadNoteNames() res:", res);
  return latestNoteNames;
}

export function getLatestNoteNames() {
  return latestNoteNames;
}

// in case somehow a note doesn't start with the block header, fix it up
export function fixUpNoteContent(s) {
  // console.log("fixUpNote:", content)
  if (s === null) {
    // console.log("fixUpNote: null content")
    return blockHdrMarkdown;
  }
  if (!s.startsWith("\n∞∞∞")) {
    s = blockHdrMarkdown + s;
    console.log("fixUpNote: added header to content", s.substring(0, 80));
  }
  return s;
}

/**
 * @param {string} name
 * @returns {string}
 */
function getSystemNoteContent(name) {
  console.log("getSystemNoteContent:", name);
  switch (name) {
    case kHelpSystemNoteName:
      return getHelp();
    case kReleaseNotesSystemNoteName:
      return getReleaseNotes();
  }
  throw new Error("unknown system note:" + name);
}

/**
 * @param {string} base
 * @param {string[]} existingNames
 * @returns {string}
 */
function pickUniqueName(base, existingNames) {
  let name = base;
  let i = 1;
  while (existingNames.includes(name)) {
    name = base + "-" + i;
    i++;
  }
  return name;
}

/**
 * @param {string} content
 * @returns
 */
export async function saveCurrentNote(content) {
  let settings = getSettings();
  let name = settings.currentNoteName;
  console.log("note name:", name);
  if (isSystemNoteName(name)) {
    console.log("skipped saving system note", name);
    return;
  }
  let path = notePathFromName(name);
  let dh = getStorageFS();
  if (!dh) {
    localStorage.setItem(path, content);
  } else {
    await writeMaybeEncryptedFS(dh, name, content);
  }
  dirtyState.isDirty = false;
  incNoteSaveCount();
}

/**
 * @param {string} name
 * @param {string} content
 * @returns {Promise<void>}
 */
export async function createNoteWithName(name, content = null) {
  let dh = getStorageFS();
  content = fixUpNoteContent(content);
  if (!dh) {
    const path = notePathFromName(name);
    // TODO: should it happen that note already exists?
    if (localStorage.getItem(path) == null) {
      localStorage.setItem(path, content);
      console.log("created note", name);
      incNoteCreateCount();
    } else {
      console.log("note already exists", name);
    }
    await loadNoteNames();
    return;
  }

  // TODO: check if exists
  await writeNoteFS(dh, name, content);
  incNoteCreateCount();
  await loadNoteNames();
}

/**
 * creates a new scratch-${N} note
 * @returns {Promise<string>}
 */
export async function createNewScratchNote() {
  let noteNames = await loadNoteNames();
  // generate a unique "scratch-${N}" note name
  let scratchName = pickUniqueName("scratch", noteNames);
  await createNoteWithName(scratchName);
  return scratchName;
}

/**
 * @param {string} name
 * @param {string} content
 * @returns {string}
 */
function autoCreateDayInJournal(name, content) {
  if (name != kDailyJournalNoteName) {
    return content;
  }
  // create block for a current day
  const dt = formatDateYYYYMMDDDay();
  if (content === null) {
    content = blockHdrMarkdown + "# " + dt + "\n";
  } else {
    if (!content.includes(dt)) {
      content = blockHdrMarkdown + "# " + dt + "\n" + content;
    }
  }
  return content;
}

function isEncryptedNote(name) {
  let res = encryptedNoteNames.includes(name);
  return res;
}

/**
 * @param {string} name
 * @returns {string}
 */
function loadNoteLS(name) {
  let key = kLSKeyPrefix + name;
  if (isEncryptedNote(name)) {
    key = kLSKeyEncrPrefix + name;
  }
  return localStorage.getItem(key);
}

/**
 * @param {string} name
 * @returns {Promise<string>}
 */
export async function loadNote(name) {
  console.log("loadNote:", name);
  let res;
  if (isSystemNoteName(name)) {
    res = getSystemNoteContent(name);
  } else {
    let dh = getStorageFS();
    if (!dh) {
      res = loadNoteLS(name);
    } else {
      res = await readMaybeEncryptedNoteFS(dh, name);
    }
  }
  historyPush(name);
  // TODO: this should happen in App.vue:onDocChange(); this was easier to write
  res = autoCreateDayInJournal(name, res);
  return fixUpNoteContent(res);
}

/**
 * @param {FileSystemDirectoryHandle} dh
 * @param {string} name
 * @returns {Promise<string>}
 */
async function readMaybeEncryptedNoteFS(dh, name) {
  let path = notePathFromNameFS(name);
  if (!isEncryptedEdnaFile(path)) {
    let res = await fsReadTextFile(dh, path);
    return res;
  }
  let res = await readEncryptedFS(dh, path);
  return res;
}

/**
 * @param {FileSystemDirectoryHandle} dh
 * @param {string} fileName
 * @returns {Promise<string>}
 */
async function readEncryptedFS(dh, fileName) {
  let pwdHash = getPasswordHash();
  // TODO: ask for password
  throwIf(!pwdHash, "need password");
  let d = await fsReadBinaryFile(dh, fileName);
  let s = decryptBlobAsString({ key: pwdHash, cipherblob: d });
  // TODO: if returns null, need to ask for password
  return s;
}

/**
 * @param {FileSystemDirectoryHandle} dh
 * @param {string} name
 * @param {string} content
 * @returns {Promise<void>}
 */
async function writeMaybeEncryptedFS(dh, name, content) {
  let path = notePathFromNameFS(name);
  if (!isEncryptedNote(name)) {
    await fsWriteTextFile(dh, path, content);
    return;
  }
  let pwdHash = getPasswordHash();
  // TODO: ask for password if not present
  throwIf(!pwdHash, "needs password");
  await writeEncryptedFS(dh, pwdHash, path, content);
}

/**
 * @param {FileSystemDirectoryHandle} dh
 * @param {string} pwdHash
 * @param {string} fileName
 * @param {string} s
 * @returns {Promise<void>}
 */
async function writeEncryptedFS(dh, pwdHash, fileName, s) {
  let d = encryptStringAsBlob({ key: pwdHash, plaintext: s });
  let blob = blobFromUint8Array(d);
  await fsWriteBlob(dh, fileName, blob);
}

/**
 * @param {FileSystemDirectoryHandle} dh
 * @param {string} name
 * @param {string} content
 */
export async function writeNoteFS(dh, name, content) {
  let pwdHash = getPasswordHash();
  let isEncr = !!pwdHash;
  const path = notePathFromNameFS(name, isEncr);
  if (isEncr) {
    await writeEncryptedFS(dh, pwdHash, path, content);
  } else {
    await fsWriteTextFile(dh, path, content);
  }
}

/**
 * @returns {Promise<string>}
 */
export async function loadCurrentNote() {
  let settings = getSettings();
  return loadNote(settings.currentNoteName);
}

/**
 * @returns {Promise<string>}
 */
export async function loadCurrentNoteIfOnDisk() {
  let settings = getSettings();
  let name = settings.currentNoteName;
  if (isSystemNoteName(name)) {
    return null;
  }
  let dh = getStorageFS();
  if (!dh) {
    return null;
  }
  return await readMaybeEncryptedNoteFS(dh, name);
}

/**
 * @param {string} name
 * @returns {boolean}
 */
export function canDeleteNote(name) {
  if (name === kScratchNoteName) {
    return false;
  }
  return !isSystemNoteName(name);
}

/**
 * @param {string} name
 */
export async function deleteNote(name) {
  let dh = getStorageFS();
  if (!dh) {
    let key = notePathFromName(name);
    localStorage.removeItem(key);
  } else {
    let fileName = notePathFromNameFS(name);
    await fsDeleteFile(dh, fileName);
  }
  incNoteDeleteCount();
  removeNoteFromHistory(name);
  await removeNoteFromMetadata(name);
  await loadNoteNames();
}

/**
 * @param {string} oldName
 * @param {string} newName
 * @param {string} content
 */
export async function renameNote(oldName, newName, content) {
  await createNoteWithName(newName, content);
  // update metadata and history before deleteNote() because it'll
  // remove from history and metadata
  await renameInMetadata(oldName, newName);
  renameInHistory(oldName, newName);
  await deleteNote(oldName);
}

/**
 * @param {string} noteName
 * @param {string[]} diskNoteNames
 * @param {FileSystemDirectoryHandle} dh
 */
async function migrateNote(noteName, diskNoteNames, dh) {
  let name = noteName;
  /** @type {string} */
  let noteInfoOnDisk;
  for (let ni of diskNoteNames) {
    if (ni === name) {
      noteInfoOnDisk = ni;
      break;
    }
  }
  let content = loadNoteLS(noteName);
  if (!noteInfoOnDisk) {
    // didn't find a note with the same name so create
    let fileName = notePathFromNameFS(name);
    await fsWriteTextFile(dh, fileName, content);
    console.log(
      "migrateNote: created new note",
      fileName,
      "from note with name",
      name,
    );
    return;
  }
  let path = notePathFromNameFS(name);
  let diskContent = await fsReadTextFile(dh, path);
  if (content === diskContent) {
    console.log("migrateNote: same content, skipping", noteName);
    return;
  }
  // if the content is different, create a new note with a different name
  let newName = pickUniqueName(name, diskNoteNames);
  let fileName = notePathFromName(newName);
  await fsWriteTextFile(dh, fileName, content);
  console.log(
    "migrateNote: created new note",
    fileName,
    "because of different content with",
    name,
  );
}

// when notes are stored on disk, they can be stored on replicated online
// storage like OneDrive
// just in case we pre-load them to force downloading them to local drive
// to make future access faster
/**
 * @returns {Promise<number>}
 */
export async function preLoadAllNotes() {
  let dh = getStorageFS();
  if (dh === null) {
    return;
  }
  let noteNames = await loadNoteNames();
  for (let name of noteNames) {
    if (isSystemNoteName(name)) {
      continue;
    }
    let path = notePathFromNameFS(name);
    await fsReadBinaryFile(dh, path);
  }
  return len(noteNames);
}

/**
 * @param {FileSystemDirectoryHandle} dh
 */
export async function switchToStoringNotesOnDisk(dh) {
  console.log("switchToStoringNotesOnDisk");
  let diskNoteNames = await loadNoteNamesFS(dh)[0];

  // migrate notes
  for (let name of latestNoteNames) {
    if (isSystemNoteName(name)) {
      continue;
    }
    migrateNote(name, diskNoteNames, dh);
  }
  // remove migrated notes
  for (let name of latestNoteNames) {
    if (isSystemNoteName(name)) {
      continue;
    }
    let key = notePathFromNameLS(name);
    localStorage.removeItem(key);
  }

  storageFS = dh;
  // save in indexedDb so that it persists across sessions
  await dbSetDirHandle(dh);
  let noteNames = await loadNoteNames();

  // migrate settings, update currentNoteName
  let settings = loadSettings();
  let name = settings.currentNoteName;
  if (!noteNames.includes(name)) {
    settings.currentNoteName = kScratchNoteName;
    saveSettings(settings);
  }
  return noteNames;
}

export async function pickAnotherDirectory() {
  try {
    let newDh = await openDirPicker(true);
    if (!newDh) {
      return;
    }
    await dbSetDirHandle(newDh);
    return true;
  } catch (e) {
    console.error("pickAnotherDirectory", e);
  }
  return false;
}

// meta-data about notes
export const kMetadataName = "notes.metadata.edna.json";

/**
 * @typedef {Object} NoteMetadata
 * @property {string} name
 * @property {string} [altShortcut]
 */

/** @type {NoteMetadata[]} */
let notesMetadata = [];

export function getNotesMetadata() {
  return notesMetadata;
}

/**
 * @param {string} noteName
 * @returns {NoteMetadata}
 */
export function getMetadataForNote(noteName) {
  console.log("getMetadataForNote:", noteName);
  let meta = notesMetadata;
  for (let m of meta) {
    if (m.name === noteName) {
      return m;
    }
  }
  return null;
}

/**
 * @param {string} noteName
 */
export async function removeNoteFromMetadata(noteName) {
  console.log("deleteMetadataForNote:", noteName);
  let meta = notesMetadata;
  let res = [];
  for (let m of meta) {
    if (m.name !== noteName) {
      res.push(m);
    }
  }
  await saveNotesMetadata(res);
}

export async function loadNotesMetadata() {
  console.log("loadNotesMetadata: started");
  let dh = getStorageFS();
  let s;
  if (!dh) {
    s = localStorage.getItem(kMetadataName);
  } else {
    try {
      s = await fsReadTextFile(dh, kMetadataName);
    } catch (e) {
      // it's ok if doesn't exist
      console.log("loadNotesMetadata: no metadata file", e);
      s = "[]";
    }
  }
  s = s || "[]";
  notesMetadata = JSON.parse(s);
  console.log("loadNotesMetadata: finished", notesMetadata);
  return notesMetadata;
}

/**
 * @param {NoteMetadata[]} m
 */
async function saveNotesMetadata(m) {
  let s = JSON.stringify(m, null, 2);
  let dh = getStorageFS();
  if (!dh) {
    localStorage.setItem(kMetadataName, s);
  } else {
    await fsWriteTextFile(dh, kMetadataName, s);
  }
  notesMetadata = m;
  return m;
}

/**
 * @param {string} oldName
 * @param {string} newName
 * @returns {Promise<NoteMetadata[]>}
 */
async function renameInMetadata(oldName, newName) {
  let m = notesMetadata;
  for (let o of notesMetadata) {
    if (o.name === oldName) {
      o.name = newName;
      break;
    }
  }
  return await saveNotesMetadata(m);
}

/**
 * @param {string} name
 * @param {string} altShortcut - "0" ... "9"
 * @returns {Promise<NoteMetadata[]>}
 */
export async function reassignNoteShortcut(name, altShortcut) {
  // console.log("reassignNoteShortcut:", name, altShortcut);
  let m = getNotesMetadata();
  for (let o of m) {
    if (o.altShortcut === altShortcut) {
      if (o.name === name) {
        // same note: just remove shortcut
        o.altShortcut = undefined;
        m = m.filter((o) => o.altShortcut);
        return await saveNotesMetadata(m);
      } else {
        // a different note: remove shortcut and then assign to the new note
        o.altShortcut = undefined;
        break;
      }
    }
  }

  /** @type {NoteMetadata} */
  let found;
  for (let o of m) {
    if (o.name === name) {
      found = o;
      console.log("reassignNoteShortcut: found note", name);
      break;
    }
  }
  if (!found) {
    found = { name: name };
    m.push(found);
    console.log("reassignNoteShortcut: created for note", name);
  }
  found.altShortcut = altShortcut;
  m = m.filter((o) => o.altShortcut);
  return await saveNotesMetadata(m);
}

/**
 * @param {string} name
 * @returns {string}
 */
export function sanitizeNoteName(name) {
  let res = name.trim();
  return res;
}

/**
 * @returns {number}
 */
export function getNotesCount() {
  return len(latestNoteNames);
}

/**
 * @returns {boolean}
 */
export function isUsingEncryption() {
  let dh = getStorageFS();
  if (!dh) {
    // no encryption for local storage
    return false;
  }
  let pwdHash = getPasswordHash();
  if (pwdHash) {
    return true;
  }
  return len(encryptedNoteNames) > 0;
}

// salt for hashing the password. not sure if it helps security wise
// but it's the best we can do. We can't generate unique salts for
// each password
const kEdnaSalt = "dbd71826401a4fca6c360f065a281063";

async function encryptNoteFS(dh, oldFileName, pwdHash) {
  if (isEncryptedEdnaFile(oldFileName)) {
    console.log("encryptNoteFS:", oldFileName, "already encrypted");
    return;
  }
  console.log("encryptNoteFS:", oldFileName);
  let s = await fsReadTextFile(dh, oldFileName);
  let newFileName = trimSuffix(oldFileName, kEdnaFileExt);
  newFileName += kEdnaEncrFileExt;
  await writeEncryptedFS(dh, pwdHash, newFileName, s);
  await dh.removeEntry(oldFileName);
}

async function decryptNoteFS(dh, oldFileName) {
  if (!isEncryptedEdnaFile(oldFileName)) {
    console.log("encryptNoteFS:", oldFileName, "already decrypted");
    return;
  }
  console.log("decryptNoteFS:", oldFileName);
  let s = await readEncryptedFS(dh, oldFileName);
  let newFileName = trimSuffix(oldFileName, kEdnaEncrFileExt);
  newFileName += kEdnaFileExt;
  await fsWriteTextFile(dh, newFileName, s);
  await dh.removeEntry(oldFileName);
}

/**
 * @param {string} pwd
 * @returns {string}
 */
function saltPassword(pwd) {
  let pwdHash = hash({ key: pwd, salt: kEdnaSalt });
  return pwdHash;
}

/**
 * @param {string} pwd
 */
export async function encryptAllNotes(pwd) {
  let dh = getStorageFS();
  throwIf(!db, "no encryption for local storage notes");

  rememberPassword(pwd);

  let pwdHash = saltPassword(pwd);
  await forEachNoteFileFS(dh, async (fileName, name, isEncr) => {
    if (isEncr) {
      return;
    }
    let msg = `Encrypting <b>${name}</b>`;
    setModalMessageHTML(msg);
    await encryptNoteFS(dh, fileName, pwdHash);
  });
  clearModalMessage();

  await loadNoteNames();
}

export async function decryptAllNotes() {
  let dh = getStorageFS();
  throwIf(!db, "no decryption for local storage notes");

  await forEachNoteFileFS(dh, async (fileName, name, isEncr) => {
    if (!isEncr) {
      return;
    }
    let msg = `Decrypting <b>${name}</b>`;
    setModalMessageHTML(msg);
    await decryptNoteFS(dh, fileName);
  });
  clearModalMessage();

  removePassword();
  await loadNoteNames();
}
