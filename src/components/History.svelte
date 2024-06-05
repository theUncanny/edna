<script>
  import { getHistory } from "../history";
  import { len } from "../util";

  /** @type {{
    close: () => void,
    selectHistory: (name: string) => void,
}}*/
  let { close, selectHistory } = $props();

  let history = getHistory();
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

  let selected = $state(len(history) > 1 ? 1 : 0);
  let items = $state(buildItems());
  let filter = $state("");

  /** @type {HTMLElement} */
  let container;
  /** @type {HTMLElement} */
  let input;

  $effect(() => {
    if (container) {
      container.focus();
    }
  });

  /**
   * @param {KeyboardEvent} event
   */
  function onKeydown(event) {
    let nItems = len(items);
    let selectedIdx = selected;

    let key = event.key;

    // '0' ... '9' picks an item
    let idx = key.charCodeAt(0) - "0".charCodeAt(0);
    if (idx >= 0 && idx < nItems) {
      event.preventDefault();
      let item = items[idx];
      console.log("idx:", idx, "item:", item);
      if (idx == 0) {
        // perf: selecting current note is a no-op
        close();
        return;
      }
      selectItem(item.name);
      return;
    }

    if (key === "ArrowDown") {
      event.preventDefault();
      if (selectedIdx >= nItems - 1) {
        // wrap around
        selectedIdx = 0;
      } else {
        selectedIdx += 1;
      }
      selected = selectedIdx;
      if (selectedIdx === nItems - 1) {
        container.scrollIntoView({ block: "end" });
      } else {
        let el = items[selectedIdx].refs;
        el.scrollIntoView({ block: "nearest" });
      }
      return;
    }

    if (key === "ArrowUp") {
      event.preventDefault();
      if (selectedIdx > 0) {
        selectedIdx -= 1;
      } else {
        if (nItems > 1) {
          // wrap around
          selectedIdx = nItems - 1;
        }
      }
      selected = selectedIdx;
      if (selectedIdx === 0) {
        container.scrollIntoView({ block: "start" });
      } else {
        let el = items[selectedIdx].refs;
        el.scrollIntoView({ block: "nearest" });
      }
      return;
    }

    if (key === "Enter") {
      event.preventDefault();
      const selected = items[selectedIdx];
      if (selected) {
        selectItem(selected.name);
      } else {
        close();
      }
      return;
    }

    if (key === "Escape") {
      event.preventDefault();
      event.stopImmediatePropagation();
      close();
      return;
    }
  }

  function selectItem(token) {
    selectHistory(token);
  }

  function onFocusOut(event) {
    if (
      container !== event.relatedTarget &&
      !container.contains(event.relatedTarget)
    ) {
      close();
    }
  }
</script>

<div class="fixed inset-0 overflow-auto">
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <form
    class="absolute center-x-with-translate max-h-[94vh] flex flex-col top-[2rem] p-3 focus:outline-none selector"
    tabindex="-1"
    onfocusout={onFocusOut}
    bind:this={container}
    onkeydown={onKeydown}
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
          class="{idx === selected
            ? 'selected'
            : ''} flex cursor-pointer py-0.5 px-2 rounded-sm leading-5"
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
</div>
