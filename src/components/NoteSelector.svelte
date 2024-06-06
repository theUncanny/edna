<script>
  import {
    getLatestNoteNames,
    getMetadataForNote,
    isSystemNoteName,
    reassignNoteShortcut,
    sanitizeNoteName,
  } from "../notes";
  import { getAltChar, isAltNumEvent, len } from "../util";

  /** @type {{
    close: () => void,
    openNote: (name: string) => void,
    createNote: (name: string) => void,
    deleteNote: (name: string) => void,
}}*/
  let { close, openNote, createNote, deleteNote } = $props();

  /**
   * @typedef {Object} Item
   * @property {string} name
   * @property {string} nameLC
   * @property {number} [altShortcut] - -1 if no shortcut, 0 to 9 for Alt-0 to Alt-9
   * @property {HTMLElement} ref
   */

  /**
   * @returns {Item[]}
   */
  function rebuildNotesInfo() {
    const noteNames = getLatestNoteNames();
    // console.log("rebuildNotesInfo, notes", noteInfos)
    /** @type {Item[]} */
    let res = Array(len(noteNames));
    // let res = [];
    for (let i = 0; i < len(noteNames); i++) {
      let name = noteNames[i];
      let item = {
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
  let itemsInitial = rebuildNotesInfo();
  let items = $state(itemsInitial);
  let selected = $state(0);
  let filter = $state("");
  let altChar = $state(getAltChar());

  /** @type {HTMLElement } */
  let container;
  /** @type {HTMLElement } */
  let input;

  $effect(() => {
    if (container) {
      container.focus();
      input.focus();
    }
  });

  let sanitizedFilter = $derived.by(() => {
    return sanitizeNoteName(filter);
  });

  let filteredItems = $derived.by(() => {
    // we split the search term by space, the name of the note
    // must match all parts
    let lc = sanitizedFilter.toLowerCase();
    let parts = lc.split(" ");
    let n = len(parts);
    for (let i = 0; i < n; i++) {
      let s = parts[i];
      parts[i] = s.trim();
    }
    return items.filter((noteInfo) => {
      let s = noteInfo.nameLC;
      for (let p of parts) {
        if (s.indexOf(p) === -1) {
          return false;
        }
      }
      return true;
    });
  });

  /**
   * @returns {Item | null}
   */
  let selectedNote = $derived.by(() => {
    if (filteredItems.length === 0) {
      return null;
    }
    if (selected >= 0 && selected < filteredItems.length) {
      return filteredItems[selected];
    }
    return null;
  });

  /**
   * @returns {string}
   */
  let selectedName = $derived.by(() => {
    let selected = selectedNote;
    if (selected === null) {
      return "";
    }
    return selected.name;
  });

  /**
   * @returns {boolean}
   */
  let canOpenSelected = $derived.by(() => {
    if (len(filteredItems) === 0) {
      // console.log("canOpenSelected: no because len(filteredItems)=0");
      return false;
    }
    if (selected < 0) {
      // console.log("canOpenSelected: no becuase selected=", selected);
      return false;
    }
    // log("canOpenSelected: yes, selected:", selected);
    return true;
  });

  /**
   * @returns {boolean}
   */
  let canCreate = $derived.by(() => {
    // TODO: use lowerCase name?
    let name = sanitizeNoteName(filter);
    // console.log("canCreate:", name);
    if (len(name) === 0) {
      // console.log(`canCreate: '${name}', no because len(name)=0`);
      return false;
    }
    for (let item of items) {
      if (item.name === name) {
        // console.log(`canCreate: '${name}', no because matches existing name`);
        return false;
      }
    }
    // console.log(`canCreate: '${name}', yes`);
    return true;
  });

  /**
   * @returns {boolean}
   */
  let canCreateWithEnter = $derived.by(() => {
    // if there are no matches for the filter, we can create with just Enter
    // otherwise we need Ctrl + Enter
    let name = sanitizedFilter;
    if (name.length === 0) {
      return false;
    }
    return !canOpenSelected;
  });

  /**
   * @returns {boolean}
   */
  let canDeleteSelected = $derived.by(() => {
    if (!canOpenSelected) {
      return false;
    }
    const item = filteredItems[selected];
    if (!item) {
      return false;
    }
    // can't delete scratch note
    if (item.name === "scratch") {
      return false;
    }
    if (isSystemNoteName(item.name)) {
      return false;
    }
    return true;
  });

  let showDelete = $derived.by(() => {
    return canOpenSelected;
  });

  /**
   * @param {string} name
   * @returns {string}
   */
  function quoteNoteName(name) {
    return `"` + sanitizeNoteName(name) + `"`;
  }

  /**
   * @param {Item} note
   * @returns {string}
   */
  function isSysNote(note) {
    return isSystemNoteName(note.name) ? "italic" : "";
  }

  /**
   * @param {KeyboardEvent} event
   * @returns {boolean}
   */
  function isCtrlDelete(event) {
    return (
      (event.key === "Delete" || event.key === "Backspace") && event.ctrlKey
    );
  }

  /**
   * @param {Item} note
   * @returns {string}
   */
  function noteShortcut(note) {
    return note.altShortcut ? altChar + " + " + note.altShortcut : "";
  }

  /**
   * @param {KeyboardEvent} event
   */
  function onKeydown(event) {
    // console.log("onKeyDown:", event);
    let altN = isAltNumEvent(event);
    if (altN !== null) {
      event.preventDefault();
      let note = selectedNote;
      if (note) {
        reassignNoteShortcut(note.name, altN).then(() => {
          items = rebuildNotesInfo();
        });
        return;
      }
    }
    let nItems = len(filteredItems);
    let selectedIdx = selected;

    let key = event.key;

    if (key === "ArrowDown") {
      event.preventDefault();
      if (selectedIdx >= nItems - 1) {
        // wrap around
        selectedIdx = 0;
      } else {
        selectedIdx += 1;
      }
      selected = selectedIdx;
      if (selectedIdx === nItems - 1) {
        container.scrollIntoView({ block: "end" });
      } else {
        let el = filteredItems[selectedIdx].ref;
        el.scrollIntoView({ block: "nearest" });
      }
      return;
    }

    if (key === "ArrowUp") {
      event.preventDefault();
      if (selectedIdx > 0) {
        selectedIdx -= 1;
      } else {
        if (nItems > 1) {
          // wrap around
          selectedIdx = nItems - 1;
        }
      }
      selected = selectedIdx;
      if (selectedIdx === 0) {
        container.scrollIntoView({ block: "start" });
      } else {
        let el = filteredItems[selectedIdx].ref;
        el.scrollIntoView({ block: "nearest" });
      }
      return;
    }

    if (key === "Enter") {
      event.preventDefault();
      let name = sanitizedFilter;
      // console.log("selected:", selectedIdx, "name:", name);
      if (canCreateWithEnter) {
        emitCreateNote(name);
        return;
      }
      if (event.ctrlKey && canCreate) {
        emitCreateNote(sanitizedFilter);
        return;
      }
      const selected = filteredItems[selectedIdx];
      if (selected) {
        emitOpenNote(selected);
      } else {
        close();
      }
    } else if (isCtrlDelete(event)) {
      event.preventDefault();
      if (!canDeleteSelected) {
        return;
      }
      const selected = selectedNote;
      if (selected) {
        emitDeleteNote(selected.name);
      } else {
        close();
      }
      return;
    }

    if (key === "Escape") {
      event.preventDefault();
      event.stopImmediatePropagation();
      // TODO: we also call onFocusOut() and emit "close" event twice
      close();
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

  function onInput(event) {
    // reset selection
    selected = 0;
  }

  function onFocusOut(event) {
    if (
      container !== event.relatedTarget &&
      !container.contains(event.relatedTarget)
    ) {
      close();
    }
  }
</script>

<div class="fixed inset-0 overflow-auto">
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <form
    bind:this={container}
    onkeydown={onKeydown}
    onfocusout={onFocusOut}
    tabindex="-1"
    class="selector absolute center-x-with-translate top-[2rem] flex flex-col max-h-[94vh] w-[32em] p-3"
  >
    <input
      type="text"
      bind:this={input}
      oninput={onInput}
      bind:value={filter}
      class="py-1 px-2 bg-white w-full mb-2 rounded-sm"
    />
    <ul class="items overflow-y-auto">
      {#each filteredItems as item, idx (item.name)}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <li
          class="flex cursor-pointer py-0.5 px-2 rounded-sm leading-5 {idx ===
          selected
            ? 'selected'
            : ''}"
          onclick={() => emitOpenNote(item)}
          bind:this={item.ref}
        >
          <div class="truncate {isSysNote(item) ? 'italic' : ''}">
            {item.name}
          </div>
          <div class="grow"></div>
          <div>{noteShortcut(item)}</div>
        </li>
      {/each}
    </ul>
    {#if canOpenSelected || canDeleteSelected || filter.length > 0}
      <hr class="mt-1 mb-1 border-gray-400" />
    {/if}
    <div
      class="kbd-grid grid grid-cols-[auto_auto_1fr] gap-x-3 gap-y-3 mt-4 text-gray-700 text-size-[11px] leading-[1em]"
    >
      {#if canOpenSelected}
        <div><span class="kbd">Enter</span></div>
        <div>open note</div>
        <div class="font-bold truncate">
          {quoteNoteName(selectedName)}
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
        <div>create note</div>
        <div class="font-bold truncate">
          {quoteNoteName(filter)}
        </div>
      {/if}

      {#if showDelete}
        <div><span class="kbd">Ctrl + Delete</span></div>
        <div class="red">delete note</div>
      {/if}
      {#if showDelete && canDeleteSelected}
        <div class="font-bold truncate">
          {quoteNoteName(selectedName)}
        </div>
      {/if}

      {#if showDelete && !canDeleteSelected}
        <div>
          <span class="red"
            >can't delete <span class="font-bold truncate"
              >{quoteNoteName(selectedName)}</span
            ></span
          >
        </div>
      {/if}

      <div><span class="kbd">{altChar} + 0...9</span></div>
      <div class="col-span-2">assign quick access shortcut</div>

      <div><span class="kbd">Esc</span></div>
      <div>dismiss</div>
      <div class="italic"></div>
    </div>
  </form>
</div>
