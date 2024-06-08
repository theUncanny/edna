<script>
  import { getHistory } from "../history";
  import { len } from "../util";

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

  let selectedIdx = $state(len(history) > 1 ? 1 : 0);
  let items = $state(buildItems());

  /** @type {HTMLElement} */
  let container;

  $effect(() => {
    console.log("History.svelte");
    if (container) {
      container.focus();
    }
  });

  /**
   * @param {KeyboardEvent} ev
   */
  function onkeydown(ev) {
    let lastIdx = len(items) - 1;
    let key = ev.key;

    // '0' ... '9' picks an item
    let idx = key.charCodeAt(0) - "0".charCodeAt(0);
    if (idx >= 0 && idx <= lastIdx) {
      ev.preventDefault();
      let item = items[idx];
      selectItem(item.name);
      return;
    }

    if (key === "ArrowDown") {
      ev.preventDefault();
      if (selectedIdx < lastIdx) {
        selectedIdx += 1;
      }
      if (selectedIdx === lastIdx) {
        container.scrollIntoView({ block: "end" });
      } else {
        let el = items[selectedIdx].ref;
        el.scrollIntoView({ block: "nearest" });
      }
      return;
    }

    if (key === "ArrowUp") {
      ev.preventDefault();
      if (selectedIdx > 0) {
        selectedIdx -= 1;
      }
      if (selectedIdx === 0) {
        container.scrollIntoView({ block: "start" });
      } else {
        let el = items[selectedIdx].ref;
        el.scrollIntoView({ block: "nearest" });
      }
      return;
    }

    if (key === "Enter") {
      ev.preventDefault();
      const item = items[selectedIdx];
      if (item) {
        selectItem(item.name);
      }
      return;
    }
  }

  function selectItem(token) {
    selectHistory(token);
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<form
  class="absolute center-x-with-translate max-h-[94vh] flex flex-col top-[2rem] p-3 focus:outline-none selector"
  tabindex="-1"
  bind:this={container}
  {onkeydown}
>
  <div
    class="items w-[400px] py-0.5 px-2 rounder-sm leading-5 mb-2 text-center dark:text-gray-400"
  >
    Recently opened
  </div>
  <ul class="items overflow-y-auto">
    {#each items as item, idx (item.name)}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <li
        class:selected={idx === selectedIdx}
        class="flex cursor-pointer py-0.5 px-2 rounded-sm leading-5"
        onclick={() => {
          selectItem(item.name);
        }}
        bind:this={item.ref}
      >
        <div class="truncate">
          {item.name}
        </div>
        <div class="grow"></div>
        {#if idx < 10}
          <div>{idx}</div>
        {/if}
      </li>
    {/each}
  </ul>
</form>
