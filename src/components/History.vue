<script>
import { getHistory } from '../history';
import { len } from '../util'


export default {
  data() {
    let h = getHistory();
    console.log("history:", h);

    let items = h.map(l => {
      return {
        "name": l,
        "nameLC": l.toLowerCase(),
      }
    })
    return {
      items: items,
      selected: 0,
      filter: "",
    }
  },

  mounted() {
    // @ts-ignore
    this.$refs.container.focus()
    // @ts-ignore
    this.$refs.input.focus()
  },

  computed: {
    filteredItems() {
      const filterLC = this.filter.toLowerCase()
      return this.items.filter((lang) => {
        return lang.nameLC.indexOf(filterLC) !== -1
      })
    },
  },

  methods: {
    /**
     * @param {KeyboardEvent} event
     */
    onKeydown(event) {
      console.log("History:", event);
      let container = /** @type {HTMLElement} */(this.$refs.container);
      let nItems = len(this.filteredItems);
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
        const selected = this.filteredItems[this.selected]
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

    onInput(event) {
      // reset selection
      this.selected = 0
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
    <form class="selector left-1/2 -translate-x-1/2 max-h-[94vh] flex flex-col absolute top-0 p-3" tabindex="-1"
      @focusout="onFocusOut" ref="container">
      <input type="text" ref="input" @keydown="onKeydown" @input="onInput" v-model="filter"
        class="py-1 px-2 bg-white w-[400px] mb-2 rounded-sm" />
      <ul class="items overflow-y-auto">
        <li v-for="item, idx in filteredItems" :key="item.name" :class="idx === selected ? 'selected' : ''"
          class="cursor-pointer py-0.5 px-2 rounded-sm leading-5" @click="selectItem(item.name)" ref="item">
          {{ item.name }}
        </li>
      </ul>
    </form>
  </div>
</template>
