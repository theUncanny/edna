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
  import ListBox from "./ListBox.svelte";

  /** @type {{
   items: Item[],
   selectBlock: (block : Item) => void,
   initialSelection?: number,
  }}*/
  let { items, selectBlock, initialSelection = 0 } = $props();

  let filter = $state("");

  /** @typedef {{item: Item, textLC: string, key: number }} BlockItem */

  /** @type {BlockItem[]} */
  let blockItems = [];
  for (let item of items) {
    let bi = {
      item: item,
      textLC: item.text.toLowerCase(),
      key: item.key,
    };
    blockItems.push(bi);
  }

  /** @type {BlockItem[]} */
  let filteredItems = $derived.by(() => {
    const filterLC = filter.toLowerCase();
    let res = [];
    for (let item of blockItems) {
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
      const item = listbox.selected();
      if (item) {
        selectBlock(item);
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
  <input
    use:focus
    type="text"
    bind:value={filter}
    class="py-1 px-2 bg-white w-full min-w-[400px] mb-2 rounded-sm"
  />
  <ListBox
    items={filteredItems}
    onclick={(item) => selectBlock(item.item)}
    {initialSelection}
    bind:this={listbox}
  >
    {#snippet renderItem(item)}
      <div>{item.item.text}</div>
    {/snippet}
  </ListBox>
</form>
