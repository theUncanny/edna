<script>
  import { LANGUAGES } from "../editor/languages.js";
  import { len } from "../util";

  /** @type {{
    selectLanguage: (name: string) => void,
}}*/
  let { selectLanguage } = $props();

  let selected = $state(0);
  let filter = $state("");

  /** @type {HTMLElement} */
  let container;
  /** @type {HTMLElement} */
  let input;

  $effect(() => {
    if (input) {
      input.focus();
    }
  });

  const items = LANGUAGES.map((l) => {
    return {
      token: l.token,
      name: l.name,
      nameLC: l.name.toLowerCase(),
      ref: null,
    };
  }).sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
  items.unshift({
    token: "auto",
    name: "Auto-detect",
    nameLC: "auto-detect",
    ref: null,
  });

  let filteredItems = $derived.by(() => {
    const filterLC = filter.toLowerCase();
    return items.filter((lang) => {
      return lang.nameLC.indexOf(filterLC) !== -1;
    });
  });

  /**
   * @param {KeyboardEvent} event
   */
  function onkeydown(event) {
    let nItems = len(filteredItems);
    let selectedIdx = selected;

    let key = event.key;

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
        let el = filteredItems[selectedIdx].ref;
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
        let el = filteredItems[selectedIdx].ref;
        el.scrollIntoView({ block: "nearest" });
      }
      return;
    }

    if (key === "Enter") {
      event.preventDefault();
      const selectedItem = filteredItems[selected];
      if (selectedItem) {
        selectItem(selectedItem.token);
      }
      return;
    }
  }

  function selectItem(token) {
    selectLanguage(token);
  }

  function oninput(event) {
    // reset selection
    selected = 0;
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<form
  bind:this={container}
  {onkeydown}
  tabindex="-1"
  class="selector z-20 absolute center-x-with-translate top-[2rem] max-h-[94vh] flex flex-col p-3"
>
  <input
    type="text"
    bind:this={input}
    {oninput}
    bind:value={filter}
    class="py-1 px-2 bg-white w-full min-w-[400px] mb-2 rounded-sm"
  />
  <ul class="items overflow-y-auto">
    {#each filteredItems as item, idx (item.token)}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <li
        class:selected={idx === selected}
        class="cursor-pointer py-0.5 px-2 rounded-sm leading-5"
        onclick={() => selectItem(item.token)}
        bind:this={item.ref}
      >
        {item.name}
      </li>
    {/each}
  </ul>
</form>
