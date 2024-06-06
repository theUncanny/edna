<script>
  import {
    getLanguage,
    getLanguageNameFromToken,
    langSupportsFormat,
    langSupportsRun,
  } from "../editor/languages.js";
  import { fmtSize, getScrollbarWidth, platform } from "../util";
  import { dirtyState } from "../state.svelte";

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
    openSettings: (ev) => void,
    openNoteSelector: (ev) => void ,
    toggleSpellCheck: (ev) => void,
    openLanguageSelector: (ev) => void ,
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
    openSettings,
    openNoteSelector,
    toggleSpellCheck,
    openLanguageSelector,
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
    `Change language for current block (${cmdKey} + L)`
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
    onclick={openNoteSelector}
    title="Change or create new note"
  >
    {noteName}
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
    onclick={openLanguageSelector}
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

  <button onclick={openSettings} class="clickable-icon" title="Settings">
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 512 512"
      fill="none"
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M262.29 192.31a64 64 0 1 0 57.4 57.4 64.13 64.13 0 0 0-57.4-57.4ZM416.39 256a154.34 154.34 0 0 1-1.53 20.79l45.21 35.46a10.81 10.81 0 0 1 2.45 13.75l-42.77 74a10.81 10.81 0 0 1-13.14 4.59l-44.9-18.08a16.11 16.11 0 0 0-15.17 1.75A164.48 164.48 0 0 1 325 400.8a15.94 15.94 0 0 0-8.82 12.14l-6.73 47.89a11.08 11.08 0 0 1-10.68 9.17h-85.54a11.11 11.11 0 0 1-10.69-8.87l-6.72-47.82a16.07 16.07 0 0 0-9-12.22 155.3 155.3 0 0 1-21.46-12.57 16 16 0 0 0-15.11-1.71l-44.89 18.07a10.81 10.81 0 0 1-13.14-4.58l-42.77-74a10.8 10.8 0 0 1 2.45-13.75l38.21-30a16.05 16.05 0 0 0 6-14.08c-.36-4.17-.58-8.33-.58-12.5s.21-8.27.58-12.35a16 16 0 0 0-6.07-13.94l-38.19-30A10.81 10.81 0 0 1 49.48 186l42.77-74a10.81 10.81 0 0 1 13.14-4.59l44.9 18.08a16.11 16.11 0 0 0 15.17-1.75A164.48 164.48 0 0 1 187 111.2a15.94 15.94 0 0 0 8.82-12.14l6.73-47.89A11.08 11.08 0 0 1 213.23 42h85.54a11.11 11.11 0 0 1 10.69 8.87l6.72 47.82a16.07 16.07 0 0 0 9 12.22 155.3 155.3 0 0 1 21.46 12.57 16 16 0 0 0 15.11 1.71l44.89-18.07a10.81 10.81 0 0 1 13.14 4.58l42.77 74a10.8 10.8 0 0 1-2.45 13.75l-38.21 30a16.05 16.05 0 0 0-6.05 14.08c.33 4.14.55 8.3.55 12.47Z"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="32px"
      ></path>
    </svg>
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
