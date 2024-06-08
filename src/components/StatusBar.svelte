<script>
  import {
    getLanguage,
    getLanguageNameFromToken,
    langSupportsFormat,
    langSupportsRun,
  } from "../editor/languages.js";
  import { fmtSize, getScrollbarWidth, platform } from "../util";
  import { dirtyState } from "../state.svelte";
  import SettingsIcon from "./SettingsIcon.svelte";
  import { globalFuncs } from "../globals.js";

  /** @type { {
    noteName: string,
    shortcut: string,
    line: number,
    column: number,
    docSize: number,
    selectionSize: number,
    language: string,
    languageAuto: boolean,
    isSpellChecking: boolean,
    toggleSpellCheck: (ev) => void,
    runCurrentBlock: (ev) => void,
    formatCurrentBlock: (ev) => void,
} } */
  let {
    noteName = "",
    shortcut = "",
    line = 0,
    column = 0,
    docSize = 0,
    selectionSize = 0,
    language = "",
    languageAuto = false,
    isSpellChecking = false,
    toggleSpellCheck,
    runCurrentBlock,
    formatCurrentBlock,
  } = $props();

  let isMac = $state(platform.isMac);
  let style = $state("");
  $effect(() => {
    let dx = getScrollbarWidth();
    style = `right: ${dx}px`;
  });

  let languageName = $derived(getLanguageNameFromToken(language));

  let lang = $derived(getLanguage(language));
  let supportsFormat = $derived(langSupportsFormat(lang));
  let supportsRun = $derived(langSupportsRun(lang));
  let cmdKey = $derived(isMac ? "⌘" : "Ctrl"); // TODO: no need to be derived;
  // TODO: depend on platform
  let formatBlockTitle = $derived(`Format Block (Alt + Shift + F)`);
  let runBlockTitle = $derived(`Run Block Code (Alt + Shift + R)`);
  let formatSize = $derived(fmtSize(docSize));
  let changeLanguageTitle = $derived(
    `Change language for current block (${cmdKey} + L)`,
  );
</script>

<div
  {style}
  class="fixed bottom-0 text-sm text-[13px] flex justify-end items-center z-10 px-1 select-none dark:text-gray-300 border-gray-300 dark:border-gray-500 border-t border-l rounded-tl-lg bg-white dark:bg-gray-700"
>
  <div class="ml-[0px] w-[4px]">
    {#if dirtyState.isDirty}&bull;{:else}&nbsp;{/if}
  </div>
  <button
    class="clickable max-w-48 truncate"
    onclick={() => {
      globalFuncs().openNoteSelector();
    }}
    title="Change or create new note"
  >
    {noteName} ⏶
  </button>
  {#if shortcut}
    <div class="text-gray-500 dark:text-gray-400 text-xs ml-1">
      {shortcut}
    </div>
  {/if}

  <div class="px-[6px] ml-2">
    Ln <span class="num">{line}</span>
    &nbsp;Col <span class="num">{column}</span>
    {#if selectionSize > 0}
      Sel <span class="num">{{ selectionSize }}</span>
    {/if}
  </div>
  <div class="doc-size px-[6px]">{formatSize}</div>
  <button onclick={toggleSpellCheck} class="clickable">
    <span
      >{#if isSpellChecking}Disable{:else}Enable{/if} spell checking</span
    >
  </button>
  <button
    onclick={() => globalFuncs().openLanguageSelector()}
    class="clickable"
    title={changeLanguageTitle}
  >
    {languageName}
    {#if languageAuto}
      <span class="auto">(auto)</span>
    {/if}
  </button>
  {#if supportsRun}
    <button onclick={runCurrentBlock} class="clickable" title={runBlockTitle}>
      Run
    </button>
  {/if}

  {#if supportsFormat}
    <button
      title={formatBlockTitle}
      onclick={formatCurrentBlock}
      class="clickable-icon"
    >
      <svg
        width="1em"
        height="1em"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2.75 4.5a.75.75 0 0 0 0 1.5h14.5a.75.75 0 0 0 0-1.5H2.75ZM2.75 7.5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5ZM2.75 10.5a.75.75 0 0 0 0 1.5h6.633a1.496 1.496 0 0 1-.284-1.5H2.75ZM2.75 13.5h6.628L7.876 15H2.75a.75.75 0 0 1 0-1.5ZM14.496 7.439a.5.5 0 0 0-.992 0l-.098.791a2.5 2.5 0 0 1-2.176 2.176l-.791.098a.5.5 0 0 0 0 .992l.791.098a2.5 2.5 0 0 1 2.176 2.176l.098.791a.5.5 0 0 0 .992 0l.098-.791a2.5 2.5 0 0 1 2.176-2.176l.791-.098a.5.5 0 0 0 0-.992l-.791-.098a2.5 2.5 0 0 1-2.176-2.176l-.098-.791ZM11.853 13.147a.5.5 0 0 1 0 .707l-4 3.996a.5.5 0 0 1-.706-.707l3.999-3.997a.5.5 0 0 1 .707 0Z"
        >
        </path>
      </svg>
    </button>
  {/if}

  <button
    onclick={() => {
      globalFuncs().openSettings();
    }}
    class="clickable-icon"
    title="Settings"
  >
    <SettingsIcon></SettingsIcon>
  </button>
  <a href="/help" title="Documentation" target="_blank" class="clickable"
    >Help</a
  >
</div>

<style scoped>
  .clickable,
  .clickable-icon {
    cursor: pointer;

    @apply px-[6px];
    @apply py-[4px];

    &:hover {
      @apply bg-gray-100;
    }
  }

  .clickable-icon {
    @apply px-[4px];
  }

  :global(html.dark) .clickable,
  :global(html.dark) .clickable-icon {
    &:hover {
      @apply bg-gray-500;
    }
  }
</style>
