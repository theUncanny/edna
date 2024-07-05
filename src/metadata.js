import { fsReadTextFile, fsWriteTextFile } from "./fileutil";
import { getStorageFS } from "./notes";

// meta-data about notes and functions
export const kMetadataName = "__metadata.edna.json";

/** @typedef {{
    name: string,
    altShortcut?: string,
    isStarred?: boolean,
}} NoteMetadata */

/** @typedef {{
    name: string,
    isStarred?: boolean,
}} FunctionMetadata */

/** @typedef {NoteMetadata[]} MetadataOld */

/** @typedef {{
  ver: number,
  files: NoteMetadata[],
  functions: FunctionMetadata[],
}} Metadata */

/** @type {NoteMetadata[]} */
let notesMetadata = [];

export function getNotesMetadata() {
  return notesMetadata;
}

/**
 * @param {string} noteName
 * @param {boolean} createIfNotExists
 * @returns {NoteMetadata}
 */
export function getMetadataForNote(noteName, createIfNotExists = false) {
  // console.log("getMetadataForNote:", noteName);
  let meta = notesMetadata;
  for (let m of meta) {
    if (m.name === noteName) {
      return m;
    }
  }
  if (!createIfNotExists) {
    return null;
  }
  let m = {
    name: noteName,
  };
  notesMetadata.push(m);
  return m;
}

/** @typedef {(meta: NoteMetadata) => void} UpdateNoteMetadataFn */

/**
 * @param {string} noteName
 * @param {UpdateNoteMetadataFn} updateMetaFn
 * @param {boolean} save
 * @returns {Promise<NoteMetadata[]>}
 */
export async function updateMetadataForNote(
  noteName,
  updateMetaFn,
  save = false,
) {
  let meta = getMetadataForNote(noteName, true);
  updateMetaFn(meta);
  let res = [];
  if (save) {
    res = await saveNotesMetadata(notesMetadata);
  }
  return res;
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
export async function renameInMetadata(oldName, newName) {
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
  console.log("reassignNoteShortcut:", name, altShortcut);
  let m = getNotesMetadata();
  for (let o of m) {
    if (o.altShortcut === altShortcut) {
      if (o.name === name) {
        // same note: just remove shortcut
        delete o.altShortcut;
        return await saveNotesMetadata(m);
      } else {
        // a different note: remove shortcut and then assign to the new note
        delete o.altShortcut;
        break;
      }
    }
  }

  let res = await updateMetadataForNote(
    name,
    (meta) => {
      meta.altShortcut = altShortcut;
    },
    true,
  );
  return res;
}

// TODO: temporary
/**
 * @param {any} o
 * @return {Metadata}
 */
export function updateMetadata(o) {
  /** @type {Metadata} */
  let res = {
    ver: 1,
    files: [],
    functions: [],
  };
  if (Array.isArray(o)) return res;
}
