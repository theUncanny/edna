<script>
  import {
    getLatestNoteNames,
    getMetadataForNote,
    isSystemNoteName,
    reassignNoteShortcut,
    sanitizeNoteName,
    getNotesCount,
  } from "../notes";
  import { findMatchingItems, getAltChar, isAltNumEvent, len } from "../util";
  import { focus } from "../actions";
  import ListBox from "./ListBox.svelte";

  /** @type {{
    openNote: (name: string) => void,
    createNote: (name: string) => void,
    deleteNote: (name: string) => void,
    switchToCommandPalette: () => void,
}}*/
  let { openNote, createNote, deleteNote, switchToCommandPalette } = $props();

  /**
   * @typedef {Object} Item
   * @property {string} name
   * @property {string} nameLC
   * @property {string} key
   * @property {number} [altShortcut] - -1 if no shortcut, 0 to 9 for Alt-0 to Alt-9
   * @property {HTMLElement} ref
   */

  /**
   * @returns {Item[]}
   */
  function buildItems() {
    const noteNames = getLatestNoteNames();
    // console.log("rebuildNotesInfo, notes", noteInfos)
    /** @type {Item[]} */
    let res = Array(len(noteNames));
    for (let i = 0; i < len(noteNames); i++) {
      let name = noteNames[i];
      let item = {
        key: name,
        name: name,
        nameLC: name.toLowerCase(),
        ref: null,
      };
      let m = getMetadataForNote(item.name);
      if (m && m.altShortcut) {
        item.altShortcut = parseInt(m.altShortcut);
      }
      res[i] = item;
    }
    // -1 if a < b
    // 0 if a = b
    // 1 if a > b
    res.sort((a, b) => {
      // those with shortcut are before (<) those without
      if (a.altShortcut && !b.altShortcut) {
        return -1;
      }
      // those without shortcut are after (>) those with
      if (!a.altShortcut && b.altShortcut) {
        return 1;
      }
      // if both have shortcut, sort by shortcut
      if (a.altShortcut && b.altShortcut) {
        return a.altShortcut - b.altShortcut;
      }
      let isSysA = isSystemNoteName(a.name);
      let isSysB = isSystemNoteName(b.name);
      // system are last
      if (isSysA && !isSysB) {
        return 1;
      }
      if (!isSysA && isSysB) {
        return -1;
      }
      // if both have no shortcut, sort by name
      return a.name.localeCompare(b.name);
    });
    return res;
  }
  let itemsInitial = $state(buildItems());
  let filter = $state("");
  let altChar = $state(getAltChar());

  let sanitizedFilter = $derived.by(() => {
    return sanitizeNoteName(filter);
  });

  let itemsFiltered = $derived.by(() => {
    // we split the search term by space, the name of the note
    // must match all parts
    if (sanitizedFilter.startsWith(">")) {
      switchToCommandPalette();
      return null;
    }
    return findMatchingItems(itemsInitial, sanitizedFilter, "nameLC");
  });

  let selectedItem = $state(null);
  let selectedName = $state("");
  let canOpenSelected = $state(false);
  let canCreate = $state(false);
  let canCreateWithEnter = $state(false);
  let canDeleteSelected = $state(false);
  let showDelete = $state(false);
  let noteCount = getNotesCount();

  let noteCountMsg = $derived.by(() => {
    // $state(`${noteCount} notes`);
    let n = len(itemsFiltered);
    if (n === 0) {
      return ""; // don't obscure user entering new, long note name
    }
    if (n === noteCount) {
      return `${noteCount} notes`;
    }
    return `${n} of ${noteCount} notes`;
  });

  function selectionChanged(item, idx) {
    console.log("selectionChanged:", item, idx);
    selectedItem = item;
    selectedName = item ? selectedItem.name : "";
    canOpenSelected = !!selectedItem;

    // TODO: use lowerCase name?
    let name = sanitizeNoteName(filter);
    canCreate = len(name) > 0;
    for (let i of itemsFiltered) {
      if (i.name === name) {
        canCreate = false;
        break;
      }
    }

    canCreateWithEnter = !canOpenSelected;
    // if there are no matches for the filter, we can create with just Enter
    // otherwise we need Ctrl + Enter
    if (name.length === 0) {
      canCreateWithEnter = false;
    }

    canDeleteSelected = false;
    if (item && canOpenSelected) {
      if (item.name !== "scratch" && !isSystemNoteName(item.name)) {
        // can't delete scratch note or system notes
        canDeleteSelected = true;
      }
    }

    showDelete = canOpenSelected;
  }

  /**
   * @param {Item} note
   * @returns {string}
   */
  function isSysNote(note) {
    return isSystemNoteName(note.name) ? "italic" : "";
  }

  /**
   * @param {KeyboardEvent} ev
   * @returns {boolean}
   */
  function isCtrlDelete(ev) {
    return (ev.key === "Delete" || ev.key === "Backspace") && ev.ctrlKey;
  }

  /**
   * @param {Item} note
   * @returns {string}
   */
  function noteShortcut(note) {
    return note.altShortcut ? altChar + " + " + note.altShortcut : "";
  }

  /**
   * @param {KeyboardEvent} ev
   */
  function onKeydown(ev) {
    // console.log("onKeyDown:", event);
    let altN = isAltNumEvent(ev);
    if (altN !== null) {
      ev.preventDefault();
      let note = selectedItem;
      if (note) {
        reassignNoteShortcut(note.name, altN).then(() => {
          itemsInitial = buildItems();
        });
        return;
      }
    }
    let key = ev.key;

    if (key === "Enter") {
      ev.preventDefault();
      let name = sanitizedFilter;
      if (canCreateWithEnter) {
        emitCreateNote(name);
        return;
      }
      if (ev.ctrlKey && canCreate) {
        emitCreateNote(sanitizedFilter);
        return;
      }
      if (selectedItem) {
        emitOpenNote(selectedItem);
      }
    } else if (isCtrlDelete(ev)) {
      ev.preventDefault();
      if (!canDeleteSelected) {
        return;
      }
      if (selectedItem) {
        emitDeleteNote(selectedItem.name);
      }
      return;
    }

    if (key === "ArrowUp" || (key === "ArrowLeft" && filter === "")) {
      ev.preventDefault();
      listbox.up();
      return;
    }

    if (key === "ArrowDown" || (key === "ArrowRight" && filter === "")) {
      ev.preventDefault();
      listbox.down();
      return;
    }
  }

  /**
   * @param {Item} item
   */
  function emitOpenNote(item) {
    // console.log("emitOpenNote", item);
    openNote(item.name);
  }

  function emitCreateNote(name) {
    // log("create note", name);
    createNote(name);
  }

  /**
   * @param {string} name
   */
  function emitDeleteNote(name) {
    // console.log("deleteNote", name);
    deleteNote(name);
  }

  let listbox;
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<form
  onkeydown={onKeydown}
  tabindex="-1"
  class="selector z-20 absolute center-x-with-translate top-[2rem] flex flex-col max-h-[90vh] w-[32em] p-2"
>
  <div>
    <input
      type="text"
      use:focus
      bind:value={filter}
      class="py-1 px-2 bg-white w-full mb-2 rounded-sm relative"
    />
    <div class="absolute right-[1rem] top-[0.75rem] italic text-gray-400">
      {noteCountMsg}
    </div>
  </div>
  <ListBox
    bind:this={listbox}
    items={itemsFiltered}
    {selectionChanged}
    onclick={(item) => emitOpenNote(item)}
  >
    {#snippet renderItem(item)}
      <div class="truncate {isSysNote(item) ? 'italic' : ''}">
        {item.name}
      </div>
      <div class="grow"></div>
      <div class="mr-2">{noteShortcut(item)}</div>
    {/snippet}
  </ListBox>

  {#if canOpenSelected || canDeleteSelected || filter.length > 0}
    <hr class="mt-0.5 mb-0.5 border-gray-300 dark:border-gray-600" />
  {/if}

  <div
    class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 mt-2 text-gray-700 text-xs max-w-full dark:text-white dark:text-opacity-50"
  >
    {#if canOpenSelected}
      <div><span class="kbd">Enter</span></div>
      <div class="truncate">
        open note <span class="font-bold">
          {selectedName}
        </span>
      </div>
    {/if}

    {#if canCreateWithEnter}
      <div><span class="kbd">Enter</span></div>
    {/if}
    {#if canCreate && !canCreateWithEnter}
      <div>
        <span class="kbd">Ctrl + Enter</span>
      </div>
    {/if}
    {#if canCreate}
      <div class="truncate">
        create note <span class="font-bold">
          {filter}
        </span>
      </div>
    {/if}

    {#if showDelete && canDeleteSelected}
      <div><span class="kbd">Ctrl + Delete</span></div>
      <div class="red truncate">
        delete note <span class="font-bold">
          {selectedName}
        </span>
      </div>
    {/if}

    {#if showDelete && !canDeleteSelected}
      <div><span class="kbd">Ctrl + Delete</span></div>
      <div class="red truncate">
        can't delete <span class="font-bold">{selectedName}</span>
      </div>
    {/if}

    {#if canOpenSelected}
      <div><span class="kbd">{altChar} + 1...9</span></div>
      <div>assign quick access shortcut</div>
    {/if}
    <!-- <div><span class="kbd">Esc</span></div>
    <div>dismiss</div> -->
  </div>
</form>

<style>
  .kbd {
    font-size: 10px;
    /* @apply text-xs; */
    @apply font-mono;
    @apply text-nowrap whitespace-nowrap;
    @apply px-[6px] py-[3px];
    @apply border  rounded-md;
    @apply border-gray-400 dark:border-gray-500;
    @apply bg-gray-50 dark:bg-gray-800;
  }
</style>
