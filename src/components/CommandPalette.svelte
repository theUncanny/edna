<script>
  import { len, splitMax } from "../util";
  import { focus } from "../actions";
  import ListBox from "./ListBox.svelte";
  import { extractShortcut } from "../keys";

  /** @typedef {[string, number]} CmdDef */

  /** @type {{
    executeCommand: (id: number) => void,
    commands: CmdDef[],
}}*/
  let { executeCommand, commands } = $props();

  /**
   * @typedef {Object} Item
   * @property {number} key
   * @property {string} name
   * @property {string} nameLC
   * @property {string} shortcut
   * @property {HTMLElement} ref
   */

  /**
   * @returns {Item[]}
   */
  function rebuildCommands() {
    // console.log("rebuildCommands:", commands);
    /** @type {Item[]} */
    let res = Array(len(commands));
    for (let i = 0; i < len(commands); i++) {
      let s = commands[i][0];
      let id = commands[i][1];
      if (id == 1007) {
        console.log("id:", id, "s:", s);
      }
      let parts = splitMax(s, "\t", 2);
      let name = parts[0];
      let shortcut = null;
      if (len(parts) > 1) {
        shortcut = extractShortcut(parts[1]);
      }
      // console.log("name:", name, "id:", id);
      let item = {
        key: id,
        name: name,
        nameLC: name.toLowerCase(),
        shortcut: shortcut,
        ref: null,
      };
      res[i] = item;
    }
    // -1 if a < b
    // 0 if a = b
    // 1 if a > b
    res.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
    return res;
  }
  let itemsInitial = $state(rebuildCommands());
  let filter = $state("");

  let filteredItems = $derived.by(() => {
    // we split the search term by space, the name of the note
    // must match all parts
    let lc = filter.toLowerCase();
    let parts = lc.split(" ");
    let n = len(parts);
    for (let i = 0; i < n; i++) {
      let s = parts[i];
      parts[i] = s.trim();
    }
    return itemsInitial.filter((noteInfo) => {
      let s = noteInfo.nameLC;
      for (let p of parts) {
        if (s.indexOf(p) === -1) {
          return false;
        }
      }
      return true;
    });
  });

  let selectedCommand = $state(null);

  function selectionChanged(item, idx) {
    // console.log("selectionChanged:", item, idx);
    selectedCommand = item;
  }

  /**
   * @param {KeyboardEvent} ev
   */
  function onKeydown(ev) {
    // console.log("onKeyDown:", event);
    let key = ev.key;

    if (key === "Enter") {
      ev.preventDefault();
      if (selectedCommand) {
        executeCommand(selectedCommand.key);
      }
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
  function emitExecuteCommand(item) {
    // console.log("emitOpenNote", item);
    executeCommand(item.key);
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
  </div>
  <ListBox
    bind:this={listbox}
    items={filteredItems}
    {selectionChanged}
    onclick={(item) => emitExecuteCommand(item)}
  >
    {#snippet renderItem(item)}
      <div class="truncate">
        {item.name}
      </div>
      <div class="grow"></div>
      <div class="mr-2">{item.shortcut}</div>
    {/snippet}
  </ListBox>
</form>
