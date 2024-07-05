<script context="module">
  /** @typedef {{
   block: any,
   text: string,
   key: number,
  }} Item
  */
</script>

<script>
  import { focus } from "../actions";
  import { findMatchingItems, getKeyEventNumber, len } from "../util";
  import ListBox from "./ListBox.svelte";

  /** @type {{
   items: Item[],
   selectBlock: (block : Item) => void,
   initialSelection?: number,
  }}*/
  let { items, selectBlock, initialSelection = 0 } = $props();

  /** @type {string} */
  let filter = $state("");

  let blockCountMsg = $state(`${len(items)} blocks`);
  if (len(items) == 1) {
    blockCountMsg = `1 block`;
  }

  /** @typedef {{item: Item, textLC: string, key: number }} BlockItem */

  /** @type {BlockItem[]} */
  let itemsInitial = [];
  for (let item of items) {
    let bi = {
      item: item,
      textLC: item.text.toLowerCase(),
      key: item.key,
    };
    itemsInitial.push(bi);
  }

  /** @type {BlockItem[]} */
  let itemsFiltered = $derived.by(() => {
    return findMatchingItems(itemsInitial, filter, "textLC");
  });

  /**
   * @param {KeyboardEvent} ev
   */
  function onkeydown(ev) {
    // Ctrl + '0' ... '9' picks an item
    // TODO: extend it to `a` .. `z` ?
    if (ev.ctrlKey) {
      let idx = getKeyEventNumber(ev);
      let lastIdx = len(items) - 1;
      if (idx >= 0 && idx <= lastIdx) {
        ev.preventDefault();
        let item = items[idx];
        selectBlock(item);
        return;
      }
    }

    let allowLeftRight = filter === "";
    listbox.onkeydown(ev, allowLeftRight);
  }

  let listbox;
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<form
  {onkeydown}
  tabindex="-1"
  class="selector z-20 absolute center-x-with-translate top-[2rem] max-h-[94vh] flex flex-col p-2"
>
  <div>
    <input
      use:focus
      type="text"
      bind:value={filter}
      class="py-1 px-2 bg-white w-full min-w-[400px] mb-2 rounded-sm"
    />

    <div class="absolute right-[1rem] top-[0.75rem] italic text-gray-400">
      {blockCountMsg}
    </div>
  </div>
  <ListBox
    bind:this={listbox}
    items={itemsFiltered}
    onclick={(item) => selectBlock(item.item)}
    {initialSelection}
  >
    {#snippet renderItem(item, idx)}
      <div class="truncate">
        {item.item.text}
      </div>
      <div class="grow"></div>
      {#if idx < 10}
        {@const s = `Ctrl + ${idx}`}
        <div class="ml-4 mr-2 text-xs text-gray-400">{s}</div>
      {/if}
    {/snippet}
  </ListBox>
</form>
