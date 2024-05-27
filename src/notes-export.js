import {
  kMetadataName,
  loadNote,
  loadNoteNames,
  loadNotesMetadata,
  notePathFromNameFS,
} from "./notes";
import { kSettingsPath, loadSettings } from "./settings";

import { formatDateYYYYMMDD } from "./util";

/**
 * @param {any} libZip
 * @param {any} zipWriter
 * @param {string} fileName
 * @param {string} text
 */
async function addTextFile(libZip, zipWriter, fileName, text) {
  let fileBlob = new Blob([text], { type: "text/plain" });
  let blobReader = new libZip.BlobReader(fileBlob);
  let opts = {
    level: 9,
  };
  await zipWriter.add(fileName, blobReader, opts);
}

export async function exportNotesToZip() {
  console.log("exportNotesToZip");
  let libZip = await import("@zip.js/zip.js");
  console.log("zipJS:", libZip);
  let blobWriter = new libZip.BlobWriter("application/zip");
  let zipWriter = new libZip.ZipWriter(blobWriter);
  let noteNames = await loadNoteNames();
  for (let name of noteNames) {
    let s = await loadNote(name);
    let fileName = notePathFromNameFS(name);
    await addTextFile(libZip, zipWriter, fileName, s);
  }
  {
    let meta = await loadNotesMetadata();
    let s = JSON.stringify(meta, null, 2);
    await addTextFile(libZip, zipWriter, kMetadataName, s);
  }
  {
    // note: note sure if I should export this
    let settings = await loadSettings();
    let s = JSON.stringify(settings, null, 2);
    await addTextFile(libZip, zipWriter, kSettingsPath, s);
  }
  let blob = await zipWriter.close();
  let name = "edna.notes.export-" + formatDateYYYYMMDD() + ".zip";
  browserDownloadBlob(blob, name);
}

/**
 * @param {Blob} blob
 * @param {string} name
 */
function browserDownloadBlob(blob, name) {
  let url = URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
