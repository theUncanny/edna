<script>
  import { getHistory } from "../history";
  import { len } from "../util";
  import { focus } from "../actions";
  import ListBox from "./ListBox.svelte";

  /** @type {{
    selectHistory: (name: string) => void,
}}*/
  let { selectHistory } = $props();

  /**
   * @typedef {Object} HitoryItem
   * @property {string} name
   * @property {string} nameLC
   * @property {HTMLElement} ref
   */
  let history = getHistory();
  /**
   * @return {HitoryItem[]}
   */
  function buildItems() {
    let n = len(history);
    let items = Array(n);
    for (let i = 0; i < n; i++) {
      let el = history[i];
      items[i] = {
        name: el,
        nameLC: el.toLowerCase(),
        ref: null,
      };
    }
    return items;
  }

  let items = $state(buildItems());

  /**
   * @param {KeyboardEvent} ev
   */
  function onkeydown(ev) {
    // console.log(ev);
    let key = ev.key;

    // '0' ... '9' picks an item
    let idx = key.charCodeAt(0) - "0".charCodeAt(0);
    let lastIdx = len(items) - 1;
    if (idx >= 0 && idx <= lastIdx) {
      ev.preventDefault();
      let item = items[idx];
      selectItem(item.name);
      return;
    }

    if (key === "Enter") {
      ev.preventDefault();
      let item = listbox.selected();
      if (item) {
        selectItem(item.name);
      }
      return;
    }

    if (key === "ArrowUp") {
      ev.preventDefault();
      listbox.up();
      return;
    }

    if (key === "ArrowDown") {
      ev.preventDefault();
      listbox.down();
      return;
    }
  }

  function selectItem(token) {
    selectHistory(token);
  }
  let listbox;
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<form
  class="absolute z-20 center-x-with-translate max-h-[94vh] flex flex-col top-[2rem] p-3 focus:outline-none selector"
  tabindex="-1"
  use:focus
  {onkeydown}
>
  <div
    class="items w-[400px] py-0.5 px-2 rounder-sm leading-5 mb-2 text-center dark:text-gray-400"
  >
    Recently opened
  </div>
  <ListBox
    bind:this={listbox}
    {items}
    onclick={(item) => selectItem(item.name)}
    initialSelection={1}
  >
    {#snippet renderItem(item, idx)}
      <div class="truncate">
        {item.name}
      </div>
      <div class="grow"></div>
      {#if idx < 10}
        <div class="ml-4 font-bold">{idx}</div>
      {/if}
    {/snippet}
  </ListBox>
</form>
