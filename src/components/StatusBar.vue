<script>
import { getLanguage, getLanguageNameFromToken, langSupportsFormat, langSupportsRun } from '../editor/languages.js'
import { fmtSize, getScrollbarWidth, platform } from '../util'
import { isDocDirty } from '../state'

export default {
  props: [
    "noteName",
    "line",
    "column",
    "docSize",
    "selectionSize",
    "language",
    "languageAuto",
    "isSpellChecking",
    "shortcut",
  ],

  components: {
  },

  setup() {
    let dx = getScrollbarWidth();
    console.log("getScrollbarWidth:", dx);
    let statusBarStyle = `right: ${dx}px`;
    return {
      statusBarStyle,
      isDocDirty,
    }
  },

  data() {
    return {

    }
  },

  mounted() {

  },

  computed: {
    languageName() {
      return getLanguageNameFromToken(this.language);
    },

    supportsFormat() {
      const lang = getLanguage(this.language)
      return langSupportsFormat(lang)
    },

    supportsRun() {
      const lang = getLanguage(this.language)
      return langSupportsRun(lang)
    },

    cmdKey() {
      return platform.isMac ? "⌘" : "Ctrl"
    },

    formatBlockTitle() {
      return `Format Block (Alt + Shift + F)`
    },

    runBlockTitle() {
      return `Run Block Code (Alt + Shift + R)`
    },

    formatSize() {
      return fmtSize(this.docSize);
    },

    changeLanguageTitle() {
      return `Change language for current block (${this.cmdKey} + L)`
    },
  },
}
</script>

<template>
  <div :style="statusBarStyle"
    class="fixed bottom-0 text-sm text-[13px] flex justify-end items-center z-10 px-1 select-none dark:text-gray-300  border-gray-300 dark:border-gray-500 border-t border-l rounded-tl-lg bg-white dark:bg-gray-700">

    <div class="ml-[0px] w-[4px]" v-if="isDocDirty">&bull;</div>
    <div class="ml-[0px] w-[4px]" v-else>&nbsp;</div>
    <div class="clickable max-w-48 truncate" @click="$emit('openNoteSelector')" title="Change or create new note">{{
    noteName
  }}
    </div>
    <div v-if="shortcut" class="text-gray-500 dark:text-gray-400 text-xs ml-1">{{ shortcut }}</div>

    <div class="px-[6px] ml-2">
      Ln <span class="num">{{ line }}</span>
      &nbsp;Col <span class="num">{{ column }}</span>
      <template v-if="selectionSize > 0">
        Sel <span class="num">{{ selectionSize }}</span>
      </template>
    </div>
    <div class="doc-size px-[6px]">{{ formatSize }}</div>
    <div @click="$emit('toggleSpellCheck')" class="clickable">
      <span v-if="isSpellChecking">Disable
        spell checking</span>
      <span v-else>Enable spell checking</span>
    </div>
    <div @click="$emit('openLanguageSelector')" class="clickable" :title="changeLanguageTitle">
      {{ languageName }}
      <span v-if="languageAuto" class="auto">(auto)</span>
    </div>
    <div v-if="supportsRun" @click="$emit('runCurrentBlock')" class="clickable" :title="runBlockTitle">
      Run
    </div>

    <div v-if="supportsFormat" :title="formatBlockTitle" @click="$emit('formatCurrentBlock')" class="clickable-icon">
      <svg width="1em" height="1em" fill="none" stroke="currentColor" viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M2.75 4.5a.75.75 0 0 0 0 1.5h14.5a.75.75 0 0 0 0-1.5H2.75ZM2.75 7.5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5ZM2.75 10.5a.75.75 0 0 0 0 1.5h6.633a1.496 1.496 0 0 1-.284-1.5H2.75ZM2.75 13.5h6.628L7.876 15H2.75a.75.75 0 0 1 0-1.5ZM14.496 7.439a.5.5 0 0 0-.992 0l-.098.791a2.5 2.5 0 0 1-2.176 2.176l-.791.098a.5.5 0 0 0 0 .992l.791.098a2.5 2.5 0 0 1 2.176 2.176l.098.791a.5.5 0 0 0 .992 0l.098-.791a2.5 2.5 0 0 1 2.176-2.176l.791-.098a.5.5 0 0 0 0-.992l-.791-.098a2.5 2.5 0 0 1-2.176-2.176l-.098-.791ZM11.853 13.147a.5.5 0 0 1 0 .707l-4 3.996a.5.5 0 0 1-.706-.707l3.999-3.997a.5.5 0 0 1 .707 0Z">
        </path>
      </svg>
    </div>

    <div @click="$emit('openSettings')" class="clickable-icon" title="Settings"><svg width="1em" height="1em"
        viewBox="0 0 512 512" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M262.29 192.31a64 64 0 1 0 57.4 57.4 64.13 64.13 0 0 0-57.4-57.4ZM416.39 256a154.34 154.34 0 0 1-1.53 20.79l45.21 35.46a10.81 10.81 0 0 1 2.45 13.75l-42.77 74a10.81 10.81 0 0 1-13.14 4.59l-44.9-18.08a16.11 16.11 0 0 0-15.17 1.75A164.48 164.48 0 0 1 325 400.8a15.94 15.94 0 0 0-8.82 12.14l-6.73 47.89a11.08 11.08 0 0 1-10.68 9.17h-85.54a11.11 11.11 0 0 1-10.69-8.87l-6.72-47.82a16.07 16.07 0 0 0-9-12.22 155.3 155.3 0 0 1-21.46-12.57 16 16 0 0 0-15.11-1.71l-44.89 18.07a10.81 10.81 0 0 1-13.14-4.58l-42.77-74a10.8 10.8 0 0 1 2.45-13.75l38.21-30a16.05 16.05 0 0 0 6-14.08c-.36-4.17-.58-8.33-.58-12.5s.21-8.27.58-12.35a16 16 0 0 0-6.07-13.94l-38.19-30A10.81 10.81 0 0 1 49.48 186l42.77-74a10.81 10.81 0 0 1 13.14-4.59l44.9 18.08a16.11 16.11 0 0 0 15.17-1.75A164.48 164.48 0 0 1 187 111.2a15.94 15.94 0 0 0 8.82-12.14l6.73-47.89A11.08 11.08 0 0 1 213.23 42h85.54a11.11 11.11 0 0 1 10.69 8.87l6.72 47.82a16.07 16.07 0 0 0 9 12.22 155.3 155.3 0 0 1 21.46 12.57 16 16 0 0 0 15.11 1.71l44.89-18.07a10.81 10.81 0 0 1 13.14 4.58l42.77 74a10.8 10.8 0 0 1-2.45 13.75l-38.21 30a16.05 16.05 0 0 0-6.05 14.08c.33 4.14.55 8.3.55 12.47Z"
          stroke-linecap="round" stroke-linejoin="round" stroke-width="32px"></path>
      </svg></div>
    <a href="/help" title="Documentation" target="_blank" class="clickable">Help</a>
  </div>
</template>

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

html.dark .clickable,
html.dark .clickable-icon {
  &:hover {
    @apply bg-gray-500;
  }
}
</style>
