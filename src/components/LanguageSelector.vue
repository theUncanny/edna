<script>
import { LANGUAGES } from '../editor/languages.js'
import { len } from '../util'

const items = LANGUAGES.map(l => {
  return {
    "token": l.token,
    "name": l.name,
    "nameLC": l.name.toLowerCase(),
  }
}).sort((a, b) => {
  return a.name.localeCompare(b.name)
})
items.unshift({ token: "auto", name: "Auto-detect", nameLC: "auto-detect" })

export default {
  data() {
    return {
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
      return items.filter((lang) => {
        return lang.nameLC.indexOf(filterLC) !== -1
      })
    },
  },

  methods: {
    onKeydown(event) {
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
          this.selectItem(selected.token)
        } else {
          this.$emit("close")
        }
        event.preventDefault()
      } else if (event.key === "Escape") {
        this.$emit("close")
        event.preventDefault()
      }
    },

    selectItem(token) {
      this.$emit("selectLanguage", token)
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
    <form class="language-selector left-1/2 -translate-x-1/2 max-h-[94vh] flex flex-col absolute top-0 p-3"
      tabindex="-1" @focusout="onFocusOut" ref="container">
      <input type="text" ref="input" @keydown="onKeydown" @input="onInput" v-model="filter"
        class="py-1 px-2 bg-white w-[400px] mb-2 rounded-sm" />
      <ul class="items overflow-y-auto">
        <li v-for="item, idx in filteredItems" :key="item.token" :class="idx === selected ? 'selected' : ''"
          class="cursor-pointer py-0.5 px-2 rounded-sm leading-5" @click="selectItem(item.token)" ref="item">
          {{ item.name }}
        </li>
      </ul>
    </form>
  </div>
</template>

<style scoped>
.language-selector {
  font-size: 12px;
  background: #efefef;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

html[theme=dark] .language-selector {
  background: #151516;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

@media (max-width: 600px) {
  html[webapp] .language-selector {
    max-width: calc(100% - 80px);
  }
}

.language-selector input {
  border: 1px solid #ccc;
}

.language-selector input:focus {
  outline: none;
  border: 1px solid #fff;
  outline: 2px solid #487eb5;
}

html[theme=dark] .language-selector input {
  background: #3b3b3b;
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid #5a5a5a;
}

html[theme=dark] .language-selector input:focus {
  border: 1px solid #3b3b3b;
}

@media (max-width: 600px) {
  html[webapp] .language-selector input {
    font-size: 16px;
    max-width: 100%;
  }
}

.language-selector .items>li:hover {
  background: #e2e2e2;
}

.language-selector .items>li.selected {
  background: #487eb5;
  color: #fff;
}

html[theme=dark] .language-selector .items>li {
  color: rgba(255, 255, 255, 0.53);
}

html[theme=dark] .language-selector .items>li:hover {
  background: #29292a;
}

html[theme=dark] .language-selector .items>li.selected {
  background: #1b6540;
  color: rgba(255, 255, 255, 0.87);
}
</style>
