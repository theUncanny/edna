<script>
  import {
    getLatestNoteNames,
    isSystemNoteName,
    kScratchNoteName,
    sanitizeNoteName,
  } from "../notes";
  import { findMatchingItems, getAltChar, isAltNumEvent, len } from "../util";
  import { focus } from "../actions";
  import ListBox from "./ListBox2.svelte";
  import { getNoteMeta, reassignNoteShortcut } from "../metadata";

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
    // let res = [];
    for (let i = 0; i < len(noteNames); i++) {
      let name = noteNames[i];
      let item = {
        key: name,
        name: name,
        nameLC: name.toLowerCase(),
        ref: null,
      };
      let m = getNoteMeta(item.name);
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
  let items = $state(buildItems());
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
      return [];
    }
    return findMatchingItems(items, sanitizedFilter, "nameLC");
  });

  let selectedNote = $state(null);
  let selectedName = $state("");
  let canOpenSelected = $state(false);
  let canCreate = $state(false);
  let canCreateWithEnter = $state(false);
  let canDeleteSelected = $state(false);
  let showDelete = $state(false);

  let itemsCountMsg = $derived.by(() => {
    // $state(`${noteCount} notes`);
    let n = len(itemsFiltered);
    if (n === 0) {
      return ""; // don't obscure user entering new, long note name
    }
    let nItems = len(items);
    if (n === nItems) {
      return `${nItems} notes`;
    }
    return `${n} of ${nItems} notes`;
  });

  function selectionChanged(item, idx) {
    // console.log("selectionChanged:", item, idx);
    selectedNote = item;
    selectedName = item ? selectedNote.name : "";
    canOpenSelected = !!selectedNote;

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
      if (item.name !== kScratchNoteName && !isSystemNoteName(item.name)) {
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
      let note = selectedNote;
      if (note) {
        reassignNoteShortcut(note.name, altN).then(() => {
          items = buildItems();
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
      if (selectedNote) {
        emitOpenNote(selectedNote);
      }
    } else if (isCtrlDelete(ev)) {
      ev.preventDefault();
      if (!canDeleteSelected) {
        return;
      }
      if (selectedNote) {
        emitDeleteNote(selectedNote.name);
      }
      return;
    }

    console.log("listbox:", listbox);
    listbox.onkeydown(ev, filter === "");
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
  class="selector z-20 absolute center-x-with-translate top-[2rem] flex flex-col max-h-[90vh] w-[90vw] p-2"
>
  <div>
    <input
      type="text"
      use:focus
      bind:value={filter}
      class="py-1 px-2 bg-white w-full mb-2 rounded-sm"
    />
    <div class="absolute right-[1rem] top-[0.75rem] italic text-gray-400">
      {itemsCountMsg}
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
      {#if noteShortcut(item) !== ""}
        <div class="ml-2 text-gray-600">({noteShortcut(item)})</div>
      {/if}
    {/snippet}
  </ListBox>
  <div
    class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 items-center mt-2 text-gray-700 text-xs max-w-full dark:text-white dark:text-opacity-50 bg-gray-100 rounded-lg py-1 px-2"
  >
    {#if canOpenSelected}
      <div class="kbd">Enter</div>
      <div>
        open note
        <span class="font-bold truncate">
          {selectedName}
        </span>
      </div>
    {/if}

    {#if canCreateWithEnter}
      <div class="kbd">Enter</div>
    {/if}
    {#if canCreate && !canCreateWithEnter}
      <div class="kbd">Ctrl + Enter</div>
    {/if}
    {#if canCreate}
      <div>
        create note <span class="font-bold truncate">
          {filter}
        </span>
      </div>
    {/if}

    {#if showDelete}
      <div class="kbd">Ctrl + Delete</div>
      {#if canDeleteSelected}
        <div class="red">
          delete note <span class="font-bold truncate">
            {selectedName}
          </span>
        </div>
      {:else}
        <div class="red">
          can't delete <span class="font-bold truncate">selectedName}</span>
        </div>
      {/if}
    {/if}

    {#if canOpenSelected}
      <div class="kbd">{altChar} 1...9</div>
      <div>assign quick access shortcut</div>
    {/if}
  </div>
</form>
