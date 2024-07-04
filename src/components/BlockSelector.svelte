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
  import { len } from "../util";
  import ListBox from "./ListBox.svelte";

  /** @type {BlockItem} */
  let selectedItem = $state(null);

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
    const filterLC = filter.toLowerCase();
    let res = [];
    for (let item of itemsInitial) {
      let s = item.textLC;
      if (s.indexOf(filterLC) !== -1) {
        res.push(item);
      }
    }
    return res;
  });

  /**
   * @param {KeyboardEvent} ev
   */
  function onkeydown(ev) {
    let key = ev.key;
    if (key === "Enter") {
      ev.preventDefault();
      if (selectedItem) {
        selectBlock(selectedItem.item);
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
    bind:selectedItem
    items={itemsFiltered}
    onclick={(item) => selectBlock(item.item)}
    {initialSelection}
  >
    {#snippet renderItem(item)}
      <div>{item.item.text}</div>
    {/snippet}
  </ListBox>
</form>
