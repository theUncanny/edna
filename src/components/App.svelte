<script>
  import RenameNote from "./RenameNote.svelte";
  import History from "./History.svelte";
  import NoteSelector from "./NoteSelector.svelte";
  import LanguageSelector from "./LanguageSelector.svelte";
  import Editor from "./Editor.svelte";
  import Loading from "./Loading.svelte";
  import StatusBar from "./StatusBar.svelte";
  import TopNav from "./TopNav.svelte";
  import Settings from "./Settings.svelte";
  import Toaster, { addToast } from "./Toaster.svelte";
  import Menu, {
    kMenuIdJustText,
    kMenuSeparator,
    kMenuStatusDisabled,
    kMenuStatusNormal,
    kMenuStatusRemoved,
  } from "../Menu.svelte";
  import Overlay from "./Overlay.svelte";
  import CreateNewNote from "./CreateNewNote.svelte";

  import { getSettings, setSetting } from "../settings";
  import { logAppExit, logAppOpen, logNoteOp } from "../log";
  import {
    createNewScratchNote,
    createNoteWithName,
    dbDelDirHandle,
    deleteNote,
    getNotesMetadata,
    getMetadataForNote,
    getStorageFS,
    pickAnotherDirectory,
    switchToStoringNotesOnDisk,
    kScratchNoteName,
    canDeleteNote,
    renameNote,
    isSystemNoteName,
    kDailyJournalNoteName,
    kHelpSystemNoteName,
    kReleaseNotesSystemNoteName,
    preLoadAllNotes,
  } from "../notes";
  import {
    getAltChar,
    isAltNumEvent,
    setURLHashNoReload,
    stringSizeInUtf8Bytes,
    throwIf,
  } from "../util";
  import { supportsFileSystem, openDirPicker } from "../fileutil";
  import { boot } from "../webapp-boot";
  import {
    getLanguage,
    langSupportsFormat,
    langSupportsRun,
  } from "../editor/languages";
  import { exportNotesToZip } from "../notes-export";
  import { setGlobalFuncs } from "../globals";

  let initialSettings = getSettings();

  let column = $state(1);
  let docSize = $state(0);
  let language = $state("plaintext");
  let languageAuto = $state(true);
  let line = $state(1);
  let noteName = $state(initialSettings.currentNoteName);
  let selectionSize = $state(0);
  let settings = $state(initialSettings);
  let showingMenu = $state(false);
  let showingLanguageSelector = $state(false);
  let showingNoteSelector = $state(false);
  let showingCreateNewNote = $state(false);
  let showingSettings = $state(false);
  let showingRenameNote = $state(false);
  let showingHistorySelector = $state(false);
  let isSpellChecking = $state(false);
  let altChar = getAltChar();
  let loadingNoteName = $state("");

  let contextMenuEv = $state(null);

  // /** @type {import("../editor/editor").EdnaEditor} */
  // let ednaEditor = $state(null);

  /** @type {Editor} */
  let editor;

  let isShowingDialog = $derived.by(() => {
    return (
      showingHistorySelector ||
      showingLanguageSelector ||
      showingMenu ||
      showingRenameNote ||
      showingNoteSelector ||
      showingCreateNewNote ||
      showingSettings
    );
  });

  let gf = {
    openSettings: openSettings,
    openLanguageSelector: openLanguageSelector,
    openCreateNewNote: openCreateNewNote,
    openNoteSelector: openNoteSelector,
    openHistorySelector: openHistorySelector,
    createScratchNote: createScratchNote,
  };
  setGlobalFuncs(gf);

  let noteShortcut = $derived.by(() => {
    let name = noteName;
    let m = getMetadataForNote(name);
    if (m && m.altShortcut) {
      return `${altChar} + ${m.altShortcut}`;
    }
    return "";
  });

  let mcStyle = $derived.by(() => {
    return {
      display: showingMenu ? "block" : "none",
    };
  });

  $effect(() => {
    getEditor().setSpellChecking(isSpellChecking);
    window.addEventListener("keydown", onKeyDown);

    window.addEventListener("beforeunload", async () => {
      logAppExit(); // TODO: not sure if this async func will complete
      await getEditor().saveCurrentNote();
    });
    logAppOpen();

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  });

  /**
   * @param {KeyboardEvent} event
   */
  function onKeyDown(event) {
    if (event.key === "Escape") {
      if (isShowingDialog) {
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      openHistorySelector();
      return;
    }

    // if (event.key === "F2") {
    //   console.log("F2");
    //   let undoAction = () => {
    //     console.log("undoAction")
    //   }
    //   toast({
    //     component: ToastUndo,
    //     props: {
    //       message: "F2 pressed",
    //       undoText: "Undo delete",
    //       undoAction: undoAction,
    //     },
    //   }, toastOptions)
    // }

    // TODO: can I do this better? The same keydown event that sets the Alt-N shortcut
    // in NoteSelector also seems to propagate here and immediately opens the note.
    if (!showingNoteSelector) {
      let altN = isAltNumEvent(event);
      // console.log("onKeyDown: e:", e, "altN:", altN)
      if (altN) {
        let meta = getNotesMetadata();
        for (let o of meta) {
          if (o.altShortcut == altN && o.name !== noteName) {
            // console.log("onKeyDown: opening note: ", o.name, " altN:", altN, " e:", e)
            openNote(o.name);
            event.preventDefault();
            return;
          }
        }
      }
    }

    // hack: stop Ctrl + O unless it originates from code mirror (because then it
    // triggers NoteSelector.vue)
    if (event.key == "o" && event.ctrlKey && !event.altKey && !event.shiftKey) {
      let target = /** @type {HTMLElement} */ (event.target);
      let fromCodeMirror = target && target.className.includes("cm-content");
      if (!fromCodeMirror) {
        event.preventDefault();
      }
    }
  }

  async function storeNotesOnDisk() {
    let dh = await openDirPicker(true);
    if (!dh) {
      return;
    }
    // TODO: await getEditor().saveCurrentNote() ?
    await switchToStoringNotesOnDisk(dh);
    let settings = getSettings();
    await openNote(settings.currentNoteName, true);
  }

  async function pickAnotherDirectory2() {
    let ok = await pickAnotherDirectory();
    if (!ok) {
      return;
    }
    await boot();
    await preLoadAllNotes();
  }

  function exportNotesToZipFile() {
    exportNotesToZip();
  }

  function openSettings() {
    showingSettings = true;
  }

  function onCloseSettings() {
    showingSettings = false;
    getEditor().focus();
  }

  async function deleteCurrentNote() {
    let name = noteName;
    console.log("deleteNote:", name);
    if (!canDeleteNote(name)) {
      console.log("cannot delete note:", name);
      return;
    }
    await openNote(kScratchNoteName, true);
    await deleteNote(name);
    // TODO: add a way to undo deletion of the note
    addToast(`Deleted note '${name}'`);
    logNoteOp("noteDelete");
  }

  async function createScratchNote() {
    let name = await createNewScratchNote();
    await onOpenNote(name);
    // TODO: add a way to undo creation of the note
    addToast(`Created scratch note '${name}'`);
    logNoteOp("noteCreate");
  }

  async function switchToBrowserStorage() {
    console.log("switchToBrowserStorage(): deleting dir handle");
    await dbDelDirHandle();
    await boot();
  }

  function openCreateNewNote() {
    showingCreateNewNote = true;
  }

  function closeCreateNewNote() {
    showingCreateNewNote = false;
    getEditor().focus();
  }

  function openNoteSelector() {
    showingNoteSelector = true;
  }

  function closeNoteSelector() {
    showingNoteSelector = false;
    getEditor().focus();
  }

  function openLanguageSelector() {
    showingLanguageSelector = true;
  }

  function closeLanguageSelector() {
    showingLanguageSelector = false;
    getEditor().focus();
  }

  function onSelectLanguage(language) {
    showingLanguageSelector = false;
    getEditor().setLanguage(language);
  }

  let nextMenuID = 1000;
  function nmid() {
    nextMenuID++;
    return nextMenuID;
  }

  export const MENU_OPEN_NOTE = nmid();
  export const MENU_CREATE_NEW_NOTE = nmid();
  export const MENU_RENAME_CURRENT_NOTE = nmid();
  export const MENU_DELETE_CURRENT_NOTE = nmid();
  export const MENU_CREATE_SCRATCH_NOTE = nmid();
  export const MENU_BLOCK_AFTER_CURR = nmid();
  export const MENU_BLOCK_BEFORE_CURR = nmid();
  export const MENU_BLOCK_AT_END = nmid();
  export const MENU_BLOCK_AT_START = nmid();
  export const MENU_BLOCK_SPLIT_AT_CURSOR = nmid();
  export const MENU_BLOCK_GOTO_NEXT = nmid();
  export const MENU_BLOCK_GOTO_PREV = nmid();
  export const MENU_BLOCK_CHANGE_LANG = nmid();
  export const MENU_BLOCK_SELECTALL = nmid();
  export const MENU_BLOCK_FORMAT = nmid();
  export const MENU_BLOCK_RUN = nmid();
  export const MENU_TOGGLE_SPELL_CHECKING = nmid();
  export const MENU_HELP = nmid();
  export const MENU_HELP_AS_NOTE = nmid();
  export const MENU_HELP_RELEASE_NOTES = nmid();
  export const MENU_MOVE_NOTES_TO_DIRECTORY = nmid();
  export const MENU_SWITCH_TO_NOTES_IN_DIR = nmid();
  export const MENU_SWITCH_TO_LOCAL_STORAGE = nmid();
  export const MENU_EXPORT_NOTES = nmid();
  export const MENU_SHOW_EXPORT_HELP = nmid();

  function buildMenuDef() {
    let lang = getLanguage(language);

    const menuNote = [
      ["Rename current note", MENU_RENAME_CURRENT_NOTE],
      ["Delete current note", MENU_DELETE_CURRENT_NOTE],
      ["Create new scratch note\tAlt + N", MENU_CREATE_SCRATCH_NOTE],
    ];

    const menuBlock = [
      ["And after current\tMod + Enter", MENU_BLOCK_AFTER_CURR],
      ["Add before current\tAlt + Enter", MENU_BLOCK_BEFORE_CURR],
      ["Add at end\tMod + Shift + Enter", MENU_BLOCK_AT_END],
      ["Add at start\tAlt + Shift + Enter", MENU_BLOCK_AT_START],
      [
        "Split at cursor position\tMod + Alt + Enter",
        MENU_BLOCK_SPLIT_AT_CURSOR,
      ],
      ["Goto next\tMod + Down", MENU_BLOCK_GOTO_NEXT],
      ["Goto previous\tMod + Up", MENU_BLOCK_GOTO_PREV],
      ["Change language\tMod + L", MENU_BLOCK_CHANGE_LANG],
      ["Select all text\tMod + A", MENU_BLOCK_SELECTALL],
      ["Format as " + lang + "\tAlt + Shift + F", MENU_BLOCK_FORMAT],
      ["Run " + lang + "\tAlt + Shift + R", MENU_BLOCK_RUN],
    ];

    let dh = getStorageFS();
    let currStorage = "Current store: browser (localStorage)";
    if (dh) {
      currStorage = `Current store: directory ${dh.name}`;
    }
    const menuStorage = [
      [currStorage, kMenuIdJustText],
      ["Move notes from browser to directory", MENU_MOVE_NOTES_TO_DIRECTORY],
      ["Switch to browser (localStorage)", MENU_SWITCH_TO_LOCAL_STORAGE],
      ["Switch to notes in a directory", MENU_SWITCH_TO_NOTES_IN_DIR],
      kMenuSeparator,
      ["Export notes to .zip file", MENU_EXPORT_NOTES],
      kMenuSeparator,
      ["Show help", MENU_SHOW_EXPORT_HELP],
    ];

    const menuHelp = [
      ["Show help", MENU_HELP],
      ["Show help as note", MENU_HELP_AS_NOTE],
      ["Release notes", MENU_HELP_RELEASE_NOTES],
    ];

    let spelling = (isSpellChecking ? "Disable" : "Enable") + " spell checking";

    const contextMenu = [
      ["Open note\tMod + P", MENU_OPEN_NOTE],
      ["Create new note", MENU_CREATE_NEW_NOTE],
      ["Note", menuNote],
      ["Block", menuBlock],
      ["Notes storage", menuStorage],
      [spelling, MENU_TOGGLE_SPELL_CHECKING],
      kMenuSeparator,
      ["Help", menuHelp],
      ["Tip: Ctrl + click for browser's context menu", kMenuIdJustText],
    ];

    return contextMenu;
  }

  /**
   * @param {import("../Menu.svelte").MenuItemDef} mi
   */
  function menuItemStatus(mi) {
    let s = mi[0];
    let mid = mi[1];
    if (mid === kMenuIdJustText) {
      return kMenuStatusDisabled;
    }
    // console.log("menuItemStatus:", mi);
    // console.log("s:", s, "mid:", mid);
    let lang = getLanguage(language);
    let dh = getStorageFS();
    // console.log("dh:", dh);
    let hasFS = supportsFileSystem();
    if (mid === MENU_BLOCK_FORMAT) {
      if (!langSupportsFormat(lang)) {
        return kMenuStatusRemoved;
      }
    } else if (mid === MENU_BLOCK_RUN) {
      if (!langSupportsRun(lang)) {
        return kMenuStatusRemoved;
      }
    } else if (mid === MENU_MOVE_NOTES_TO_DIRECTORY) {
      if (!hasFS) {
        return kMenuStatusRemoved;
      }
      if (dh) {
        // currently using directory
        return kMenuStatusRemoved;
      }
    } else if (mid == MENU_SWITCH_TO_LOCAL_STORAGE) {
      if (!hasFS) {
        return kMenuStatusRemoved;
      }
      if (dh === null) {
        // currently using local storage
        return kMenuStatusRemoved;
      }
    } else if (mid == MENU_SWITCH_TO_NOTES_IN_DIR) {
      if (!hasFS) {
        return kMenuStatusRemoved;
      }
    }
    return kMenuStatusNormal;
  }

  /**
   * @param {number} cmdId
   * @param ev
   */
  async function onmenucmd(cmdId, ev) {
    console.log("cmd:", cmdId);
    showingMenu = false;
    if (cmdId == MENU_OPEN_NOTE) {
      openNoteSelector();
    } else if (cmdId == MENU_CREATE_NEW_NOTE) {
      openCreateNewNote();
    } else if (cmdId == MENU_RENAME_CURRENT_NOTE) {
      showingRenameNote = true;
    } else if (cmdId == MENU_DELETE_CURRENT_NOTE) {
      deleteCurrentNote();
    } else if (cmdId == MENU_CREATE_SCRATCH_NOTE) {
      await createScratchNote();
    } else if (cmdId == MENU_BLOCK_AFTER_CURR) {
      getEditor().addNewBlockAfterCurrent();
    } else if (cmdId == MENU_BLOCK_BEFORE_CURR) {
      getEditor().addNewBlockBeforeCurrent();
    } else if (cmdId == MENU_BLOCK_AT_END) {
      getEditor().addNewBlockAfterLast();
    } else if (cmdId == MENU_BLOCK_AT_START) {
      getEditor().addNewBlockBeforeFirst();
    } else if (cmdId == MENU_BLOCK_SPLIT_AT_CURSOR) {
      getEditor().insertNewBlockAtCursor();
    } else if (cmdId == MENU_BLOCK_GOTO_NEXT) {
      getEditor().gotoNextBlock();
    } else if (cmdId == MENU_BLOCK_GOTO_PREV) {
      getEditor().gotoPreviousBlock();
    } else if (cmdId == MENU_BLOCK_CHANGE_LANG) {
      openLanguageSelector();
    } else if (cmdId == MENU_BLOCK_SELECTALL) {
      getEditor().selectAll();
    } else if (cmdId == MENU_BLOCK_FORMAT) {
      getEditor().formatCurrentBlock();
    } else if (cmdId == MENU_BLOCK_RUN) {
      getEditor().runCurrentBlock();
    } else if (cmdId == MENU_TOGGLE_SPELL_CHECKING) {
      toggleSpellCheck();
    } else if (cmdId == MENU_HELP) {
      showHelp();
    } else if (cmdId == MENU_HELP_AS_NOTE) {
      showHelpAsNote();
    } else if (cmdId == MENU_HELP_RELEASE_NOTES) {
      showReleaseNotes();
    } else if (cmdId == MENU_MOVE_NOTES_TO_DIRECTORY) {
      storeNotesOnDisk();
    } else if (cmdId == MENU_SWITCH_TO_NOTES_IN_DIR) {
      await pickAnotherDirectory();
    } else if (cmdId == MENU_SWITCH_TO_LOCAL_STORAGE) {
      await switchToBrowserStorage();
    } else if (cmdId == MENU_EXPORT_NOTES) {
      exportNotesToZipFile();
    } else if (cmdId == MENU_SHOW_EXPORT_HELP) {
      showHelp("#storing-notes-on-disk");
    } else {
      console.log("unknown menu cmd id");
    }
  }

  function closeMenu() {
    showingMenu = false;
    getEditor().focus();
  }

  let contextMenu = $state(null);
  /**
   * @param {MouseEvent} ev
   */
  function oncontextmenu(ev) {
    if (isShowingDialog) {
      return;
    }
    // show native context menu if ctrl or shift is pressed
    // especially important for spell checking
    let forceNativeMenu = ev.ctrlKey;
    if (forceNativeMenu) {
      return;
    }
    ev.preventDefault();
    ev.stopPropagation();
    contextMenuEv = ev;
    contextMenu = buildMenuDef();
    showingMenu = true;
  }

  /**
   * @returns {Editor}
   */
  function getEditor() {
    return editor;
  }

  function formatCurrentBlock() {
    getEditor().formatCurrentBlock();
    logNoteOp("noteFormatBlock");
  }

  function runCurrentBlock() {
    getEditor().runCurrentBlock();
    logNoteOp("noteRunBlock");
  }

  function toggleSpellCheck() {
    isSpellChecking = !isSpellChecking;
    getEditor().setSpellChecking(isSpellChecking);
    if (isSpellChecking) {
      addToast(
        "Press Shift + right mouse click for context menu when spell checking is enabled",
      );
    }
  }

  /**
   * @param {string} anchor
   */
  function showHelp(anchor = "") {
    // let uri = window.location.origin + "/help"
    let uri = "/help";
    if (anchor != "") {
      uri += anchor;
    }
    window.open(uri, "_blank");
  }

  function closeRename() {
    showingRenameNote = false;
    getEditor().focus();
  }

  function closeSettings() {
    console.log("closeSettings");
    showingSettings = false;
    getEditor().focus();
  }

  async function onRename(newName) {
    showingRenameNote = false;
    let s = getEditor().getContent() || "";
    await renameNote(noteName, newName, s);
    await openNote(newName, true);
    console.log("onRename: newName:", newName);
  }

  function openHistorySelector() {
    showingHistorySelector = true;
    getEditor().focus();
  }

  function closeHistorySelector() {
    showingHistorySelector = false;
    getEditor().focus();
  }

  function onSelectHistory(name) {
    showingHistorySelector = false;
    console.log("onSelectHistory:", name);
    if (name != noteName) {
      openNote(name);
    } else {
      console.log("onSelectHistory: skipping opening becase same note");
    }
  }

  async function openNote(name, skipSave = false) {
    console.log("App.openNote:", name);
    let editor = getEditor();
    editor.setReadOnly(true);
    loadingNoteName = name;
    await editor.openNote(name, skipSave);
    // await sleep(400);
    loadingNoteName = "";
    editor.focus();
  }

  /**
   * @param {string} name
   */
  function onOpenNote(name) {
    showingNoteSelector = false;
    openNote(name);
  }

  /**
   * @param {string} name
   */
  async function onCreateNote(name) {
    showingNoteSelector = false;
    showingCreateNewNote = false;
    await createNoteWithName(name);
    openNote(name);
    // TODO: add a way to undo creation of the note
    addToast(`Created note '${name}'`);
    logNoteOp("noteCreate");
  }

  /**
   * @param {string} name
   */
  async function onDeleteNote(name) {
    showingNoteSelector = false;
    let settings = getSettings();
    // if deleting current note, first switch to scratch note
    // TODO: maybe switch to the most recently opened
    if (name === settings.currentNoteName) {
      console.log("deleted current note, opening scratch note");
      await openNote(kScratchNoteName);
    }
    // must delete after openNote() because openNote() saves
    // current note
    await deleteNote(name);
    getEditor().focus();
    console.log("deleted note", name);
    // TODO: add a way to undo deletion of the note
    addToast(`Deleted note '${name}'`);
    logNoteOp("noteDelete");
  }

  /** @typedef {import("../editor/event.js").SelectionChangeEvent} SelectionChangeEvent */

  /**
   * @param {SelectionChangeEvent} e
   */
  function onCursorChange(e) {
    line = e.cursorLine.line;
    column = e.cursorLine.col;
    selectionSize = e.selectionSize;
    language = e.language;
    languageAuto = e.languageAuto;
  }

  function showHelpAsNote() {
    openNote(kHelpSystemNoteName);
  }

  function showReleaseNotes() {
    openNote(kReleaseNotesSystemNoteName);
  }

  function updateDocSize() {
    let editor = getEditor();
    const c = editor.getContent() || "";
    docSize = stringSizeInUtf8Bytes(c);
  }

  /**
   * @param {string} name
   */
  function didOpenNote(name) {
    console.log("didOpenNote:", name);
    throwIf(!name);
    noteName = name;
    console.log("onDocChanged: just opened");
    let readOnly = isSystemNoteName(name);
    editor.setReadOnly(readOnly);
    if (name === kDailyJournalNoteName) {
      console.log("journal, so going to next block");
      // editor.gotoNextBlock();
    }

    window.document.title = name;
    setURLHashNoReload(name);
    setSetting("currentNoteName", name);
    updateDocSize();
  }

  function docDidChange() {
    updateDocSize();
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="grid w-screen max-h-screen h-screen fixed grid-rows-[1fr_auto]"
  {oncontextmenu}
>
  <TopNav {noteName} shortcut={noteShortcut} />
  <Editor
    cursorChange={onCursorChange}
    debugSyntaxTree={false}
    keymap={settings.keymap}
    emacsMetaKey={settings.emacsMetaKey}
    showLineNumberGutter={settings.showLineNumberGutter}
    showFoldGutter={settings.showFoldGutter}
    bracketClosing={settings.bracketClosing}
    fontFamily={settings.fontFamily}
    fontSize={settings.fontSize}
    bind:this={editor}
    {didOpenNote}
    {docDidChange}
  />
  <StatusBar
    shortcut={noteShortcut}
    {noteName}
    {line}
    {column}
    {docSize}
    {selectionSize}
    {language}
    {languageAuto}
    {isSpellChecking}
    {formatCurrentBlock}
    {runCurrentBlock}
    {toggleSpellCheck}
  />
</div>

{#if showingCreateNewNote}
  <Overlay onclose={closeCreateNewNote}>
    <CreateNewNote createNewNote={onCreateNote} onclose={closeCreateNewNote}
    ></CreateNewNote>
  </Overlay>
{/if}

{#if showingNoteSelector}
  <Overlay onclose={closeNoteSelector}>
    <NoteSelector
      openNote={onOpenNote}
      createNote={onCreateNote}
      deleteNote={onDeleteNote}
    />
  </Overlay>
{/if}

{#if showingLanguageSelector}
  <Overlay onclose={closeLanguageSelector}>
    <LanguageSelector selectLanguage={onSelectLanguage} />
  </Overlay>
{/if}

{#if showingHistorySelector}
  <Overlay onclose={closeHistorySelector}>
    <History selectHistory={onSelectHistory} />
  </Overlay>
{/if}

{#if loadingNoteName}
  <Loading {loadingNoteName} />
{/if}

{#if showingRenameNote}
  <Overlay onclose={closeRename}>
    <RenameNote onclose={closeRename} rename={onRename} oldName={noteName} />
  </Overlay>
{/if}

{#if showingSettings}
  <Overlay onclose={closeSettings}>
    <Settings></Settings>
  </Overlay>
{/if}
<Toaster></Toaster>

{#if showingMenu}
  <Overlay onclose={closeMenu}>
    <Menu
      nest={1}
      {menuItemStatus}
      {onmenucmd}
      menuDef={contextMenu}
      ev={contextMenuEv}
    />
  </Overlay>
{/if}
