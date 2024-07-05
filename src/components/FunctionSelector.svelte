<script>
  import ListBox from "./ListBox.svelte";
  import { focus } from "../actions";
  import { findMatchingItems, len } from "../util";
  import { getBoopFunctions } from "../system-notes";

  /** @typedef {import("../functions").BoopFunction} BoopFunction */

  /** @type {{
   userFunctions: BoopFunction[],
   runFunction: (fn: BoopFunction, replace: boolean) => void,
   context: string
  }}*/

  let { userFunctions, runFunction, context } = $props();

  /** @typedef {{
    fdef: BoopFunction,
    key: number,
    name: string,
    nameLC: string,
    ref: HTMLElement,
   }} Item
  */

  /**
   * @param {BoopFunction} fdef
   * @param {number} key
   * @returns {Item}
   */
  function mkItem(fdef, key) {
    return {
      fdef: fdef,
      key: key,
      name: fdef.name,
      nameLC: fdef.name.toLowerCase(),
      ref: null,
    };
  }

  /**
   * @returns {Item[]}
   */
  function buildItems() {
    let blockFunctions = getBoopFunctions();
    let n = len(blockFunctions);
    let res = Array(n);
    let key = 0;
    for (let fdef of blockFunctions) {
      res[key++] = mkItem(fdef, key);
    }
    for (let fdef of userFunctions) {
      res[key++] = mkItem(fdef, key);
    }
    res.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
    return res;
  }

  let items = buildItems();
  let filter = $state("");

  /**
   * @returns {Item[]}
   */
  let itemsFiltered = $derived(findMatchingItems(items, filter, "nameLC"));

  /** @type {Item} */
  let selectedItem = $state(null);

  /**
   * @param {Item} item
   * @param {boolean} replace
   */
  function emitRunFunction(item, replace) {
    console.log("emitRunFunction:", item);
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
        let replace = ev.ctrlKey;
        emitRunFunction(selectedItem, replace);
      }
    }
    listbox.onkeydown(ev, filter === "");
  }
  let listbox;
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<form
  onkeydown={onKeydown}
  tabindex="-1"
  class="selector absolute flex flex-col z-20 center-x-with-translate top-[2rem] max-h-[90vh] w-[32em] p-2"
>
  <div>
    <div class="flex">
      <div class="text-center mb-2 font-semibold flex-grow">
        run function with {context}
      </div>
      <a
        href="https://edna.arslexis.io/help#running-code"
        target="_blank"
        class="underline ml-2">help</a
      >
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
    bind:selectedItem
    items={itemsFiltered}
    onclick={(item) => emitRunFunction(item, false)}
  >
    {#snippet renderItem(item)}
      <div class="truncate">
        {item.name}
      </div>
    {/snippet}
  </ListBox>
  {#if selectedItem}
    <div class="px-2 py-1 mt-2 mb-2 text-sm text-gray-800 bg-yellow-50">
      {selectedItem.fdef.description}
    </div>
    <div
      class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 mt-2 text-gray-700 text-xs max-w-full dark:text-white dark:text-opacity-50"
    >
      <div>
        <span class="kbd">Enter</span>
      </div>
      <div>Run code, output in new block</div>
      <div>
        <span class="kbd">Ctrl + Enter</span>
      </div>
      <div>Run code, output replaces block content</div>
    </div>
  {/if}
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
