<script>

import {
  getScrollbarWidth
} from "../util.js";
import { isDocDirty } from '../state'

export default {
  props: [
    "noteName",
    "shortcut",
  ],

  setup() {
    let dx = getScrollbarWidth();
    console.log("getScrollbarWidth:", dx);
    let topnavStyle = `right: ${dx}px`;
    return {
      topnavStyle,
      isDocDirty,
    }
  },
}

</script>
<template>
  <div
    class="fixed top-0 text-sm flex items-center z-10 px-1 mt-[-1px] select-none dark:text-gray-300  border-gray-300 dark:border-gray-500 border-b border-l rounded-bl-lg bg-white dark:bg-gray-700"
    :style="topnavStyle">
    <div class="ml-[0px] w-[4px]" v-if="isDocDirty">&bull;</div>
    <div class="ml-[0px] w-[4px]" v-else>&nbsp;</div>
    <div class="clickable max-w-32 truncate" @click="$emit('openNoteSelector')" :title="noteName">{{
      noteName }}
    </div>
    <div v-if="shortcut" class="text-gray-500 dark:text-gray-400 text-xs ml-1">{{ shortcut }}</div>
    <a class="clickable ml-1" href="/help" title="Documentation" target="_blank">Help</a>
    <a class="clickable-icon mt-[1px]" href="https://github.com/kjk/edna" target="_blank" title="Source code on GitHub">
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" stroke-width="2"
        stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <path
          d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5">
        </path>
      </svg>
    </a>
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
