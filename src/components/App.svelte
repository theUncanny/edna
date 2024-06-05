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
  import LanguageSelector from "./LanguageSelector.svelte";

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
