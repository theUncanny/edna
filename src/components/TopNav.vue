<script>

import {
  getScrollbarWidth
} from "../util.js";

export default {
  props: [
    "noteName",
    "shortcut",
  ],

  setup() {
    let dx = getScrollbarWidth();
    console.log("getScrollbarWidth:", dx);
    let topnavStyle = `right: ${dx + 4}px`;
    console.log("topnavStyle:", topnavStyle);
    return {
      topnavStyle,
    }
  },

}

</script>
<template>
  <div class="topnav fixed top-0 flex items-center z-50 shadow-xl" :style="topnavStyle">
    <div class="title">
      {{ noteName }}
    </div>
    <div class="shortcut">
      {{ shortcut }}
    </div>
    <a class="ml-1 help mt-[1px]" href="https://github.com/kjk/edna" target="_blank" title="source on GitHub">
      <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-brand-github" width="1em" height="1em"
        viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round"
        stroke-linejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <path
          d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5">
        </path>
      </svg>
    </a>
    <a class="help ml-1" href="/help" target="_blank">Help</a>
  </div>
</template>

<style scoped>
.topnav {
  font-size: 10pt;
  line-height: 1.5;
  background-color: white;
  color: #333;
  padding: 2px 1rem;
  /* border-bottom: 1px lightgray solid; */
}

.title {
  padding: 2px 4px;
  /* border-left: 1px solid lightgray;
  border-right: 1px solid lightgray;
  border-top: 1px solid lightgray;
  border-bottom: 1px solid lightgray; */
}

.shortcut {
  padding: 2px 4px;
  font-size: 8pt;
  color: #939393;
}

.help {
  padding: 2px 4px;
}

.help:hover {
  background-color: #f3f3f3;
}
</style>