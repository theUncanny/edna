<script>
  import { len } from "../util";

  /** @type {{ 
    items: any[],
    onclick: (any) => void,
    renderItem: any,
    selectionChanged?: (any, number) => void,
    initialSelection?: number,
  }}*/
  let {
    items,
    onclick,
    renderItem,
    selectionChanged = (el, idx) => {
      /* no op */
    },
    initialSelection = 0,
  } = $props();

  let selectedIdx = $state(-1);

  let n = len(items);
  let refs = new Array(n);
  let prevItemsLen = n;

  // make sure to call selectionChanged() callback on initial
  // selection, so if there's state calcualted based on that,
  // it gets properly initalized
  setTimeout(() => {
    if (initialSelection > n - 1) {
      initialSelection = n - 1;
    }
    if (n === 0) {
      initialSelection = -1;
    }
    select(initialSelection);
  }, 50);

  $effect(() => {
    let n = len(items);
    if (n > len(refs)) {
      console.log("expanding refs to:", n);
      refs.length = n;
    }

    // TODO: this check shouldn't be necessary but
    // this effect gets re-run after changing selection
    if (n === prevItemsLen) {
      return;
    }
    console.log("re-runinng effect:", len(items));
    prevItemsLen = n;
    // reset selection if changing items
    if (n > 0) {
      select(0);
    } else {
      select(-1);
    }
  });

  /**
   * @param {number} n
   */
  export function select(n) {
    let nItems = len(items);
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
    console.log("selectedIdx:", selectedIdx);
    let ref = refs[selectedIdx];
    ref.scrollIntoView({ block: "nearest" });
    let item = items[selectedIdx];
    selectionChanged(item, selectedIdx);
  }

  export function selected() {
    return items[selectedIdx];
  }

  export function up() {
    let nItems = len(items);
    if (nItems <= 0 || selectedIdx <= 0) {
      return;
    }
    select(selectedIdx - 1);
  }

  export function down() {
    let nItems = len(items);
    console.log("donw: selectedIdx:", selectedIdx, "nItems:", nItems);
    let lastIdx = nItems - 1;
    if (nItems <= 0 || selectedIdx >= lastIdx) {
      return;
    }
    select(selectedIdx + 1);
  }
</script>

<ul class="items overflow-y-auto" role="listbox">
  {#each items as item, idx (item.key)}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <li
      role="listitem"
      class:selected={idx === selectedIdx}
      class="cursor-pointer py-0.5 px-2 rounded-sm leading-5 flex dark:text-opacity-50 hover:bg-gray-200 dark:hover:bg-gray-600"
      onclick={() => onclick(item)}
      bind:this={refs[idx]}
    >
      {@render renderItem(item, idx)}
    </li>
  {/each}
</ul>

<style>
  .selected {
    @apply text-white bg-gray-500;
    @apply dark:text-opacity-85 dark:bg-gray-700;
  }
</style>
