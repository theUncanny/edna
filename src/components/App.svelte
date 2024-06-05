<script>
  import { getSettings } from "../settings";
  import { getAltChar } from "../util";
  import TopNav from "./TopNav.svelte";

  let initialSettings = getSettings();
  console.log("initialSettings:", initialSettings);

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

  $effect(() => {
    console.log(settings);
  });

  function openNoteSelector() {
    console.log("openNoteSelector");
    showingNoteSelector = true;
  }
</script>

<div>This is app Svelte.</div>

<TopNav {noteName} shortcut={noteShortcut} {openNoteSelector} />
