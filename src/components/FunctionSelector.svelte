<script>
  import ListBox from "./ListBox.svelte";
  import { focus } from "../actions";
  import { blockFunctions } from "../functions";
  import { len } from "../util";

  /** @typedef {import("../functions").BlockFunction} BlockFunction */

  /** @type {{
   runFunction: (fn: BlockFunction, replace: boolean) => void,
   defaultReplace: boolean,
  }}*/

  let { runFunction, defaultReplace } = $props();

  /** @typedef {{
    fdef: BlockFunction,
    key: number,
    name: string,
    ref: HTMLElement,
   }} Item
  */

  /**
   * @returns {Item[]}
   */
  function buildItems() {
    let n = len(blockFunctions);
    let res = Array(n);
    for (let i = 0; i < n; i++) {
      let fdef = blockFunctions[i];
      let item = {
        fdef: fdef,
        key: i,
        name: fdef.name,
        ref: null,
      };
      res[i] = item;
    }
    return res;
  }

  let initialItems = $state(buildItems());
  let filter = $state("");
  let filteredItems = $derived.by(() => {
    let res = initialItems;
    return res;
  });

  let selectedItem = $state(null);

  function selectionChanged(item, idx) {
    // console.log("selectionChanged:", item, idx);
    selectedItem = item;
  }

  /**
   * @param {Item} item
   * @param {boolean} replace
   */
  function emitRunFunction(item, replace) {
    runFunction(item.fdef, replace);
  }

  /**
   * @param {KeyboardEvent} ev
   */
  function onKeydown(ev) {
    // console.log("onKeyDown:", event);
    let key = ev.key;

    if (key === "Enter") {
      ev.preventDefault();
      if (selectedItem) {
        let replace = defaultReplace;
        if (ev.ctrlKey) {
          replace = true;
        }
        emitRunFunction(selectedItem, replace);
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
  let listbox;
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<form
  onkeydown={onKeydown}
  tabindex="-1"
  class="selector z-20 absolute center-x-with-translate top-[2rem] flex flex-col max-h-[90vh] w-[32em] p-2"
>
  <div>
    <div class="text-center mb-2 font-semibold">
      run function with current block content
    </div>
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
    onclick={(item) => emitRunFunction(item, defaultReplace)}
  >
    {#snippet renderItem(item)}
      <div class="truncate">
        {item.name}
      </div>
    {/snippet}
  </ListBox>
</form>
