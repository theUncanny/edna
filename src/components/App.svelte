<script>
  import { getAltChar } from "../util";
  import Loading from "./Loading.svelte";
  import StatusBar from "./StatusBar.svelte";
  import TopNav from "./TopNav.svelte";
  import {
    onOpenSettings,
    getSettings,
    onSettingsChange,
    setSetting,
  } from "../settings";
  import { logAppExit, logAppOpen, logNoteOp } from "../log";
  import RenameNote from "./RenameNote.svelte";
  import NoteSelector from "./NoteSelector.svelte";
  import LanguageSelector from "./LanguageSelector.svelte";
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

  let initialSettings = getSettings();

  let column = $state(1);
  let development = $state(window.location.href.indexOf("dev=1") !== -1);
  let docSize = $state(0);
  let helpAnchor = $state("");
  let language = $state("plaintext");
  let languageAuto = $state(true);
  let line = $state(1);
  let noteName = $state(initialSettings.currentNoteName);
  let selectionSize = $state(0);
  let settings = $state(initialSettings);
  let showingMenu = $state(false);
  let showingLanguageSelector = $state(false);
  let showingNoteSelector = $state(false);
  let showingSettings = $state(false);
  let showingRenameNote = $state(false);
  let showingHistorySelector = $state(false);
  let theme = $state(initialSettings.theme);
  let isSpellChecking = $state(false);
  let spellcheckToastID = $state(0);
  let altChar = $state(getAltChar());
  let loadingNoteName = $state("");

  let noteShortcut = $state("");

  showingNoteSelector = true;

  noteName = "a test note";
  $effect(() => {
    console.log(settings);
  });

  function openNoteSelector() {
    showingNoteSelector = true;
  }

  function openLanguageSelector() {
    showingLanguageSelector = true;
  }

  function oncontextmenu() {
    // TODO: implement me
  }

  function throwNYI() {
    throw new Error("NYI");
  }

  function getEditor() {
    throwNYI();
  }

  function formatCurrentBlock() {
    // getEditor().formatCurrentBlock();
    logNoteOp("noteFormatBlock");
  }

  function runCurrentBlock() {
    // getEditor().runCurrentBlock();
    logNoteOp("noteRunBlock");
  }

  function toggleSpellCheck() {
    isSpellChecking = !isSpellChecking;
    //getEditor().setSpellChecking(isSpellChecking)
    // if (this.isSpellChecking) {
    //   this.toast("Press Shift + right mouse click for context menu when spell checking is enabled", toastOptions)
    // }
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

  function onCloseRename() {
    showingRenameNote = false;
    // getEditor().focus();
  }

  async function onRename(newName) {
    showingRenameNote = false;
    // let s = getEditor().getContent() || "";
    // await renameNote(noteName, newName, s);
    // await openNote(newName, true);
    console.log("onRename: newName:", newName);
  }

  function onSelectLanguage(language) {
    showingLanguageSelector = false;
    //getEditor().setLanguage(language)
  }

  function closeLanguageSelector() {
    showingLanguageSelector = false;
    //getEditor().focus()
  }

  function closeNoteSelector() {
    showingNoteSelector = false;
    //getEditor().focus()
    // console.log("closeNoteSelector")
  }

  async function openNote(name, skipSave = false) {
    console.log("App.openNote:", name);
    // let editor = getEditor();
    // editor.editor.setReadOnly(true);
    // loadingNoteName = name;
    // await editor.openNote(name, skipSave);
    // // await sleep(400);
    // loadingNoteName = "";
    // editor.focus();
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
    await createNoteWithName(name);
    openNote(name);
    // TODO: add a way to undo creation of the note
    // this.toast(`Created note '${name}'`, toastOptions);
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
    // getEditor().focus();
    console.log("deleted note", name);
    // TODO: add a way to undo deletion of the note
    // this.toast(`Deleted note '${name}'`, toastOptions);
    logNoteOp("noteDelete");
  }
</script>

<div>This is app Svelte.</div>

<TopNav {noteName} shortcut={noteShortcut} {openNoteSelector} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="grid w-screen max-h-screen h-screen fixed grid-rows-[1fr_auto]"
  {oncontextmenu}
>
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
    {openLanguageSelector}
    {openNoteSelector}
    {formatCurrentBlock}
    {runCurrentBlock}
    {toggleSpellCheck}
    openSettings={onOpenSettings}
  />
</div>
<div class="overlay">
  {#if showingNoteSelector}
    <NoteSelector
      openNote={onOpenNote}
      createNote={onCreateNote}
      deleteNote={onDeleteNote}
      close={closeNoteSelector}
    />
  {/if}

  {#if showingLanguageSelector}
    <LanguageSelector
      selectLanguage={onSelectLanguage}
      close={closeLanguageSelector}
    />
  {/if}
</div>

{#if loadingNoteName}
  <Loading {loadingNoteName} />
{/if}

{#if showingRenameNote}
  <RenameNote close={onCloseRename} rename={onRename} oldName={noteName} />
{/if}
