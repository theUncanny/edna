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

      if (event.key === "ArrowDown") {
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
      } else if (event.key === "ArrowUp") {
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
      } else if (event.key === "Enter") {
        const selected = this.items[this.selected]
        if (selected) {
          this.selectItem(selected.name)
        } else {
          this.$emit("close")
        }
        event.preventDefault()
      } else if (event.key === "Escape") {
        event.preventDefault()
        event.stopImmediatePropagation()
        this.$emit("close")
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
    <form class="focus:outline-none selector left-1/2 -translate-x-1/2 max-h-[94vh] flex flex-col absolute top-0 p-3"
      tabindex="-1" @focusout="onFocusOut" ref="container" @keydown="onKeydown">
      <div class="items w-[400px] py-0.5 px-2 rounder-sm leading-5 mb-2 text-center dark:bg-white">Recently
        opened</div>
      <ul class="items overflow-y-auto">
        <li v-for="item, idx in items" :key="item.name" :class="idx === selected ? 'selected' : ''"
          class="cursor-pointer py-0.5 px-2 rounded-sm leading-5" @click="selectItem(item.name)" ref="item">
          {{ item.name }}
        </li>
      </ul>
    </form>
  </div>
</template>
