<script>
  import { len } from "../util";

  /** @type {{ 
    items: any[],
    onclick: (any) => void,
    renderItem: any,
  }}*/
  let { items, onclick, renderItem } = $props();

  let nItems = len(items);
  let lastIdx = nItems - 1;
  let selectedIdx = $state(nItems > 0 ? 0 : -1);

  /**
   * @param {number} n
   */
  export function select(n) {
    if (nItems <= 0) {
      selectedIdx = -1;
      return;
    }
    selectedIdx = 0;
    if (n >= 0 && n < nItems) {
      selectedIdx = n;
    }
  }

  export function selected() {
    return items[selectedIdx];
  }

  export function up() {
    if (selectedIdx > 0) {
      selectedIdx -= 1;
    }
    let el = items[selectedIdx].ref;
    el.scrollIntoView({ block: "nearest" });
  }

  export function down() {
    if (selectedIdx < lastIdx) {
      selectedIdx += 1;
    }
    let el = items[selectedIdx].ref;
    el.scrollIntoView({ block: "nearest" });
  }
</script>

<ul class="items overflow-y-auto" role="listbox">
  {#each items as item, idx (item.name)}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <li
      role="listitem"
      class:selected={idx === selectedIdx}
      class="cursor-pointer py-0.5 px-2 rounded-sm leading-5"
      onclick={() => onclick(item)}
      bind:this={item.ref}
    >
      {@render renderItem(item)}
    </li>
  {/each}
</ul>

<style>
</style>
