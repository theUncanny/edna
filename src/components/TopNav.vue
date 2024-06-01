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
    let topnavStyle = `right: ${dx - 2}px`;
    return {
      topnavStyle,
      isDocDirty,
    }
  },

}

</script>
<template>
  <div
    class="topnav text-sm fixed top-0 flex items-center z-50 px-1 py-[2px] mt-[-1px] border-gray-400 border border-r-white"
    :style="topnavStyle">
    <div class="ml-[0px] w-[4px]" v-if="isDocDirty">&bull;</div>
    <div class="ml-[0px] w-[4px]" v-else>&nbsp;</div>
    <div class="clickable px-[6px] py-[2px] max-w-32 truncate" @click="$emit('openNoteSelector')" :title="noteName">{{
      noteName }}
    </div>
    <div v-if="shortcut" class="shortcut text-xs py-[2px] ml-1">{{ shortcut }}</div>
    <a class="clickable px-[6px] py-[2px] ml-1" href="/help" title="Documentation" target="_blank">Help</a>
    <a class="clickable px-[4px] py-[2px] mt-[1px]" href="https://github.com/kjk/edna" target="_blank"
      title="Source code on GitHub">
      <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-brand-github" width="1em" height="1em"
        viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round"
        stroke-linejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <path
          d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5">
        </path>
      </svg>
    </a>
  </div>
</template>

<style scoped>
.topnav {
  background-color: white;
  color: #333;
}

html.dark .topnav {
  background-color: #29292a;
  color: rgba(255, 255, 255, 0.87);
}

.shortcut {
  /* font-size: 9pt; */
  color: #939393;
}

html.dark .shortcut {
  color: #a3a3a3;
}

.clickable {
  cursor: pointer;

  &:hover {
    background-color: #f3f3f3;
    /* background-color: rgba(255, 255, 255, 0.1); */
  }
}

html.dark .clickable {
  &:hover {
    background-color: #49494a;
  }
}
</style>
