import "./main.css";

import {
  createDefaultNotes,
  dbGetDirHandle,
  ensureValidNoteNamesFS,
  isSystemNoteName,
  kScratchNoteName,
  loadNoteNames,
  loadNotesMetadata,
  preLoadAllNotes,
  setStorageFS,
} from "./notes";
import { getSettings, loadInitialSettings, setSetting } from "./settings";
import { isDev, len } from "./util";
import { mount, unmount } from "svelte";

import App from "./components/App.svelte";
import AskFSPermissions from "./components/AskFSPermissions.svelte";
import { generateSalt } from "kiss-crypto";
// import Toast from "vue-toastification/dist/index.mjs";
// import { createApp } from "vue";
import { hasHandlePermission } from "./fileutil";
import { startLoadCurrencies } from "./currency";

/** @typedef {import("./settings").Settings} Settings */

startLoadCurrencies();

let appSvelte;

let s = generateSalt();
console.log("salt:", s);

export async function boot() {
  console.log("booting");
  loadInitialSettings();

  let dh = await dbGetDirHandle();
  if (dh) {
    console.log("storing data in the file system");
    let ok = await hasHandlePermission(dh, true);
    if (!ok) {
      console.log("no permission to write files in directory", dh.name);
      setStorageFS(null);
      const args = {
        target: document.getElementById("app"),
      };
      appSvelte = mount(AskFSPermissions, args);
      return;
    }
    await ensureValidNoteNamesFS(dh);
  } else {
    console.log("storing data in localStorage");
  }

  let noteNames = await loadNoteNames();
  let createdNotes = await createDefaultNotes(noteNames);
  await loadNotesMetadata(); // pre-load

  let settings = getSettings();
  // console.log("settings:", settings);

  // pick the note to open at startup:
  // - #${name} from the url
  // - settings.currentNoteName if it exists
  // - fallback to scratch note
  let toOpenAtStartup = kScratchNoteName; // default if nothing else matches
  let hashName = window.location.hash.slice(1);
  hashName = decodeURIComponent(hashName);
  let settingsName = settings.currentNoteName;

  // re-do because could have created default notes
  if (len(createdNotes) > 0) {
    noteNames = await loadNoteNames();
  }

  /**
   * @param {string} name
   * @returns {boolean}
   */
  function isValidNote(name) {
    if (!name) {
      return false;
    }
    return noteNames.includes(name) || isSystemNoteName(name);
  }

  // need to do this twice to make sure hashName takes precedence over settings.currentNoteName
  if (isValidNote(settingsName)) {
    toOpenAtStartup = settingsName;
    console.log("will open note from settings.currentNoteName:", settingsName);
  }
  if (isValidNote(hashName)) {
    toOpenAtStartup = hashName;
    console.log("will open note from url #hash:", hashName);
  }
  if (!isValidNote(settingsName)) {
    toOpenAtStartup = "scratch";
  }

  // will open this note in Editor.vue on mounted()
  setSetting("currentNoteName", toOpenAtStartup);
  console.log("mounting App");
  if (appSvelte) {
    unmount(appSvelte);
  }
  const args = {
    target: document.getElementById("app"),
  };
  appSvelte = mount(App, args);
  // app.use(Toast, {
  //   // transition: "Vue-Toastification__bounce",
  //   transition: "none",
  //   maxToasts: 20,
  //   newestOnTop: true,
  // });
}

boot().then(() => {
  console.log("finished booting");
  preLoadAllNotes().then((n) => {
    console.log(`finished pre-loading ${n} notes`);
  });
});

if (isDev) {
  // @ts-ignore
  window.resetApp = function () {
    console.log("unmounting app");
    unmount(appSvelte);
    console.log("clearing localStorage");
    localStorage.clear();
    console.log("reloading");
    window.location.reload();
  };
}
