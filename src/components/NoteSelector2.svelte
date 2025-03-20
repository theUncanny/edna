<script module>
  /** @typedef {{
    key: string,
    name: string,
    nameLC: string,
    altShortcut?: number, // if present, 1 to 9 for Alt-1 to Alt-9
    isStarred: boolean,
    ref: HTMLElement,
  }} Item
*/

  /**
   * -1 if a < b
   * 0 if a = b
   * 1 if a > b
   * @param {Item} a
   * @param {Item} b
   */
  function sortItem(a, b) {
    // started before not starred
    if (a.isStarred && !b.isStarred) {
      return -1;
    }
    if (!a.isStarred && b.isStarred) {
      return 1;
    }

    // with shortcut are before (<) those without
    if (a.altShortcut && !b.altShortcut) {
      return -1;
    }
    // without shortcut are after (>) those with
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
  }

  /**
   * @param {string[]} noteNames
   * @returns {Item[]}
   */
  export function buildItems(noteNames) {
    // console.log("buildItems, notes", noteInfos)
    /** @type {Item[]} */
    let res = Array(len(noteNames));
    for (let i = 0; i < len(noteNames); i++) {
      let name = noteNames[i];
      /** @type {Item} */
      let item = {
        key: name,
        name: name,
        nameLC: name.toLowerCase(),
        isStarred: false,
        ref: null,
      };
      res[i] = item;
      let m = getNoteMeta(item.name, false);
      if (!m) {
        continue;
      }
      let n = parseInt(m.altShortcut);
      if (n >= 1 && n <= 9) {
        item.altShortcut = n;
      }
      item.isStarred = !!m.isStarred;
    }
    res.sort(sortItem);
    return res;
  }
</script>

<script>
  import {
    getLatestNoteNames,
    isSystemNoteName,
    sanitizeNoteName,
  } from "../notes";
  import {
    getNoteMeta,
    reassignNoteShortcut,
    toggleNoteStarred,
  } from "../metadata";
  import { findMatchingItems, getAltChar, isAltNumEvent, len } from "../util";
  import { focus } from "../actions";
  import ListBox from "./ListBox.svelte";
  import IconStar from "./IconStar.svelte";
  import { appState } from "../state.svelte";

  /** @type {{
    openNote: (name: string) => void,
    createNote: (name: string) => void,
    deleteNote: (name: string) => Promise<void>,
  }}*/
  let { openNote, createNote, deleteNote } = $props();

  let noteNames = getLatestNoteNames();
  let items = $state(buildItems(noteNames));
  let filter = $state("");
  let altChar = $state(getAltChar());

  function reloadNotes() {
    console.log("reloadNotes");
    let noteNames = getLatestNoteNames();
    items = buildItems(noteNames);
  }

  let sanitizedFilter = $derived.by(() => {
    return sanitizeNoteName(filter);
  });

  let itemsFiltered = $derived.by(() => {
    // we split the search term by space, the name of the note
    // must match all parts
    return findMatchingItems(items, sanitizedFilter, "nameLC");
  });

  /** @type {Item} */
  let selectedItem = $state(null);
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
        reassignNoteShortcut(note.name, altN).then(reloadNotes);
        return;
      }
    }
    let key = ev.key;

    if (key === "s" && ev.altKey && selectedItem) {
      toggleStarred(selectedItem);
      ev.preventDefault();
      return;
    }

    if (key === "Escape") {
      if (filter !== "") {
        filter = "";
        ev.preventDefault();
        ev.stopPropagation();
      }
    }

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
        // console.log("deleteNote", name);
        deleteNote(selectedItem.name).then(reloadNotes);
      }
      return;
    }

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
   * @param {Item} item
   */
  async function toggleStarred(item) {
    // there's a noticeable UI lag when we do the obvious:
    // item.isStarred = toggleNoteStarred(item.name);
    // because we wait until metadata file is saved
    // this version makes an optimistic change to reflect in UI
    // and, just to be extra sure, reflects the state after saving
    item.isStarred = !item.isStarred;
    toggleNoteStarred(item.name).then((isStarred) => {
      // not really necessary, should be in-sync
      item.isStarred = isStarred;
    });
    input.focus();
  }

  function toggleInfoPanelCollapsed() {
    appState.noteSelectorInfoCollapsed = !appState.noteSelectorInfoCollapsed;
  }

  let input;
  let listbox;
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<form
  onkeydown={onKeydown}
  tabindex="-1"
  class="fixed inset-0 flex flex-col z-20 w-full h-full p-2 text-sm bg-white dark:bg-gray-900 dark:text-gray-300"
>
  <div class="">
    <input
      type="text"
      use:focus
      bind:this={input}
      bind:value={filter}
      class="py-1 px-2 bg-white w-full mb-2 rounded-xs"
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
      <button
        class="ml-[-6px]"
        onclick={(ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          toggleStarred(item);
        }}
        ><IconStar fill={item.isStarred ? "yellow" : "none"}></IconStar></button
      >
      <div class="ml-2 truncate {isSysNote(item) ? 'italic' : ''}">
        {item.name}
      </div>
      <div class="grow"></div>
      <div class="ml-4 mr-2 text-xs text-gray-400 whitespace-nowrap">
        {noteShortcut(item)}
      </div>
    {/snippet}
  </ListBox>

  <div class="grow"></div>

  {#if canOpenSelected || canDeleteSelected || filter.length > 0}
    <!-- <hr class="mt-2 border-gray-300 dark:border-gray-600" /> -->
  {/if}

  {#if appState.noteSelectorInfoCollapsed}
    <div
      class="flex justify-between text-gray-700 text-xs max-w-full dark:text-white dark:text-opacity-50 bg-gray-100 rounded-lg px-2 pt-1 pb-1.5 mt-2"
    >
      <button
        onclick={(ev) => {
          ev.preventDefault();
          toggleInfoPanelCollapsed();
        }}
        title="show info panel"
        class="underline underline-offset-2 cursor-pointer"
      >
        show</button
      >
    </div>
  {:else}
    <div class="selector-info">
      {#if canOpenSelected}
        <div class="kbd">Enter</div>
        <div class="truncate">
          open note <span class="font-bold">
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
        <div class="truncate">
          create note <span class="font-bold">
            {filter}
          </span>
        </div>
      {/if}

      {#if showDelete && canDeleteSelected}
        <div class="kbd">Ctrl + Delete</div>
        <div class="red truncate">
          delete note <span class="font-bold">
            {selectedName}
          </span>
        </div>
      {/if}

      {#if showDelete && !canDeleteSelected}
        <div class="kbd">Ctrl + Delete</div>
        <div class="red truncate">
          can't delete <span class="font-bold">{selectedName}</span>
        </div>
      {/if}

      {#if canOpenSelected}
        <div class="kbd">{altChar} + 1...9</div>
        <div>assign quick access shortcut</div>
      {/if}

      {#if canOpenSelected}
        <div class="kbd">{altChar} + S</div>
        <div>toggle favorite</div>
      {/if}

      <div class="kbd">Esc</div>
      <div>back to note</div>
    </div>
  {/if}
</form>
