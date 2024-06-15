<script>
  import { len } from "../util";

  /** @type {{ 
    items: any[],
    onclick: (any) => void,
    renderItem: any,
    selectionChanged?: (any, number) => void,
  }}*/
  let {
    items,
    onclick,
    renderItem,
    selectionChanged = (el, idx) => {
      /* no op */
    },
  } = $props();

  let nItems = $derived(len(items));
  let selectedIdx = $state(len(items) > 0 ? 0 : -1);
  let refs = new Array(len(items));

  /**
   * @param {number} n
   */
  export function select(n) {
    console.log("select:", n, "nItems:", nItems);
    if (nItems <= 0) {
      if (selectedIdx != -1) {
        selectedIdx = -1;
        selectionChanged(null, -1);
      }
      return;
    }
    selectedIdx = 0;
    if (n >= 0 && n < nItems) {
      selectedIdx = n;
    }
    let ref = refs[selectedIdx];
    ref.scrollIntoView({ block: "nearest" });
    let item = items[selectedIdx];
    selectionChanged(item, selectedIdx);
  }

  export function selected() {
    return items[selectedIdx];
  }

  export function up() {
    if (nItems <= 0 || selectedIdx <= 0) {
      return;
    }
    select(selectedIdx - 1);
  }

  export function down() {
    let lastIdx = nItems - 1;
    if (nItems <= 0 || selectedIdx >= lastIdx) {
      return;
    }
    select(selectedIdx + 1);
  }
</script>

<ul class="items overflow-y-auto" role="listbox">
  {#each items as item, idx (item.name)}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <li
      role="listitem"
      class:selected={idx === selectedIdx}
      class="cursor-pointer py-0.5 px-2 rounded-sm leading-5 flex"
      onclick={() => onclick(item)}
      bind:this={refs[idx]}
    >
      {@render renderItem(item)}
    </li>
  {/each}
</ul>

<style>
</style>
