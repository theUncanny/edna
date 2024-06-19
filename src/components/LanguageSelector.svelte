<script>
  import { LANGUAGES } from "../editor/languages.js";
  import { focus } from "../actions.js";
  import ListBox from "./ListBox.svelte";

  /** @type {{
    selectLanguage: (name: string) => void,
}}*/
  let { selectLanguage } = $props();

  let filter = $state("");

  const items = LANGUAGES.map((l) => {
    return {
      key: l.name,
      token: l.token,
      name: l.name,
      nameLC: l.name.toLowerCase(),
      ref: null,
    };
  }).sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
  items.unshift({
    key: "auto",
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
   * @param {KeyboardEvent} ev
   */
  function onkeydown(ev) {
    let key = ev.key;
    if (key === "Enter") {
      ev.preventDefault();
      const item = listbox.selected();
      if (item) {
        selectLanguage(item.token);
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
    onclick={(item) => selectLanguage(item.token)}
    bind:this={listbox}
  >
    {#snippet renderItem(item)}
      <div>{item.name}</div>
    {/snippet}
  </ListBox>
</form>
