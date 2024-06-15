<script>
  import { LANGUAGES } from "../editor/languages.js";
  import { len } from "../util";
  import { focus } from "../actions.js";

  /** @type {{
    selectLanguage: (name: string) => void,
}}*/
  let { selectLanguage } = $props();

  let selected = $state(0);
  let filter = $state("");

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
    let key = event.key;
    if (key === "Enter") {
      event.preventDefault();
      const selectedItem = filteredItems[selected];
      if (selectedItem) {
        selectItem(selectedItem.token);
      }
      return;
    }
    let nItems = len(filteredItems);
    let selectedIdx = selected;
    if (nItems === 0) {
      return;
    }

    if (key === "ArrowUp") {
      event.preventDefault();
      if (selectedIdx > 0) {
        selectedIdx -= 1;
      }
      selected = selectedIdx;
      let el = filteredItems[selectedIdx].ref;
      el.scrollIntoView({ block: "nearest" });
      return;
    }

    if (key === "ArrowDown") {
      event.preventDefault();
      let lastIdx = nItems - 1;
      if (selectedIdx < lastIdx) {
        selectedIdx += 1;
      }
      selected = selectedIdx;
      let el = filteredItems[selectedIdx].ref;
      el.scrollIntoView({ block: "nearest" });
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
  {onkeydown}
  tabindex="-1"
  class="selector z-20 absolute center-x-with-translate top-[2rem] max-h-[94vh] flex flex-col p-3"
>
  <input
    use:focus
    type="text"
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
