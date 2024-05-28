<script>
import { getHistory } from '../history';
import { len } from '../util'


export default {
  data() {
    let history = getHistory();
    let n = len(history);
    let items = Array(n)
    for (let i = 0; i < n; i++) {
      let el = history[i];
      items[i] = {
        "name": el,
        "nameLC": el.toLowerCase(),
      };
    }
    let selected = n > 1 ? 1 : 0;
    return {
      items: items,
      selected: selected,
      filter: "",
    }
  },

  mounted() {
    // @ts-ignore
    this.$refs.container.focus()
  },

  methods: {
    /**
     * @param {KeyboardEvent} event
     */
    onKeydown(event) {
      let container = /** @type {HTMLElement} */(this.$refs.container);
      let nItems = len(this.items);
      let selectedIdx = this.selected;

      let key = event.key;

      // '0' ... '9' picks an item
      let idx = key.charCodeAt(0) - '0'.charCodeAt(0);
      if (idx >= 0 && idx < nItems) {
        event.preventDefault();
        let item = this.items[idx];
        console.log("idx:", idx, "item:", item);
        if (idx == 0) {
          // perf: selecting current note is a no-op
          this.$emit("close");
          return;
        }
        this.selectItem(item.name);
        return;
      }

      if (key === "ArrowDown") {
        event.preventDefault()
        if (selectedIdx >= nItems - 1) {
          // wrap around
          selectedIdx = 0;
        } else {
          selectedIdx += 1;
        }
        this.selected = selectedIdx;
        if (selectedIdx === nItems - 1) {
          container.scrollIntoView({ block: "end" })
        } else {
          let el = this.$refs.item[selectedIdx];
          el.scrollIntoView({ block: "nearest" })
        }
        return;
      }

      if (key === "ArrowUp") {
        event.preventDefault()
        if (selectedIdx > 0) {
          selectedIdx -= 1
        } else {
          if (nItems > 1) {
            // wrap around
            selectedIdx = nItems - 1;
          }
        }
        this.selected = selectedIdx;
        if (selectedIdx === 0) {
          container.scrollIntoView({ block: "start" })
        } else {
          this.$refs.item[selectedIdx].scrollIntoView({ block: "nearest" })
        }
        return;
      }

      if (key === "Enter") {
        event.preventDefault()
        const selected = this.items[this.selected]
        if (selected) {
          this.selectItem(selected.name)
        } else {
          this.$emit("close")
        }
        return;
      }

      if (key === "Escape") {
        event.preventDefault()
        event.stopImmediatePropagation()
        this.$emit("close")
        return;
      }
    },

    selectItem(token) {
      this.$emit("selectHistory", token)
    },

    onFocusOut(event) {
      let container = /** @type {HTMLElement} */(this.$refs.container);
      if (container !== event.relatedTarget && !container.contains(event.relatedTarget)) {
        this.$emit("close")
      }
    },
  }
}
</script>

<template>
  <div class="fixed inset-0 overflow-auto">
    <form class="absolute center-x-with-translate max-h-[94vh] flex flex-col top-[2rem] p-3 focus:outline-none selector"
      tabindex="-1" @focusout="onFocusOut" ref="container" @keydown="onKeydown">
      <div class="items w-[400px] py-0.5 px-2 rounder-sm leading-5 mb-2 text-center dark:text-gray-400">Recently
        opened</div>
      <ul class="items overflow-y-auto">
        <li v-for="item, idx in items" :key="item.name" :class="idx === selected ? 'selected' : ''"
          class="flex cursor-pointer py-0.5 px-2 rounded-sm leading-5" @click="selectItem(item.name)" ref="item">
          <div class="truncate">
            {{ item.name }}
          </div>
          <div class="grow"></div>
          <div v-if="idx < 10">{{ idx }}</div>
        </li>
      </ul>
    </form>
  </div>
</template>
