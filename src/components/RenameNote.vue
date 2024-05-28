<script>
import { getLatestNoteNames, sanitizeNoteName } from '../notes'

export default {
  props: {
    oldName: String,
  },

  data() {
    return {
      newName: "",
    }
  },

  mounted() {
    console.log("RenameNote mounted: oldName:", this.oldName)
    this.newName = this.oldName;
    /** @type {HTMLElement} */(this.$refs.input).focus();
  },

  computed: {
    sanitizedNewName() {
      return sanitizeNoteName(this.newName)
    },

    canRename() {
      let name = this.sanitizedNewName
      if (name === "") {
        return false
      }
      let noteNames = getLatestNoteNames()
      return !noteNames.includes(name)
    },

    renameError() {
      let name = this.sanitizedNewName
      if (name === "") {
        return "name cannot be empty"
      }
      let noteNames = getLatestNoteNames()
      if (noteNames.includes(name)) {
        return "name already exists"
      }
      return ""
    }
  },

  methods: {
    /**
     * @param {KeyboardEvent} event
     */
    onKeydown(event) {
      let key = event.key;

      if (key === "Escape") {
        event.preventDefault()
        event.stopImmediatePropagation()
        this.$emit("close")
        return;
      }

      if (this.canRename && key === "Enter") {
        this.emitRename();
        return;
      }
    },

    onFocusOut(event) {
      let container = /** @type {HTMLElement} */(this.$refs.container);
      if (container !== event.relatedTarget && !container.contains(event.relatedTarget)) {
        this.$emit("close")
      }
    },

    emitRename() {
      this.$emit("rename", this.sanitizedNewName)
    }
  },

}
</script>

<template>
  <div class="fixed inset-0">
    <form ref="container" @keydown="onKeydown" @focusout="onFocusOut" tabindex="-1"
      class="selector absolute center-x-with-translate top-[2rem] z-20 flex flex-col max-w-full p-3">
      <div>Rename <span class="font-bold">{{ oldName }}</span> to:</div>
      <input ref="input" v-model="newName" class="py-1 px-2 bg-white mt-2 rounded-sm w-[80ch]"></input>
      <div class=" text-sm mt-2">New name: <span class="font-bold">"{{ sanitizedNewName }}"</span> <span
          v-if="!canRename" class="text-red-500 font-bold">{{ renameError }}</span>
      </div>
      <div class="flex justify-end mt-2">
        <button @click="$emit('close')" class="mr-4 px-4 py-1 border border-black hover:bg-gray-100">Cancel</button>
        <button @click="emitRename" :disabled="!canRename"
          class="px-4 py-1 border border-black hover:bg-gray-50 disabled:text-gray-400 disabled:border-gray-400  default:bg-slate-700"
          default>Rename</button>
      </div>
    </form>
    <div class="bg-black opacity-50 absolute inset-0 z-10">
    </div>
  </div>
</template>