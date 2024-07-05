<script>
  import { LANGUAGES } from "../editor/languages.js";
  import { focus } from "../actions.js";
  import ListBox from "./ListBox.svelte";
  import { len } from "../util.js";

  /** @type {{
    selectLanguage: (name: string) => void,
  }} */
  let { selectLanguage } = $props();

  let filter = $state("");

  function buildItems() {
    let n = len(LANGUAGES);
    let res = Array(n);
    let i = 0;
    for (let l of LANGUAGES) {
      let item = {
        key: l.name,
        token: l.token,
        name: l.name,
        nameLC: l.name.toLowerCase(),
        ref: null,
      };
      res[i++] = item;
    }
    res.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
    res.unshift({
      key: "auto",
      token: "auto",
      name: "Auto-detect",
      nameLC: "auto-detect",
      ref: null,
    });
    return res;
  }
  const items = buildItems();

  let itemsFiltered = $derived.by(() => {
    const filterLC = filter.toLowerCase();
    return items.filter((lang) => {
      return lang.nameLC.indexOf(filterLC) !== -1;
    });
  });

  /**
   * @param {KeyboardEvent} ev
   */
  function onkeydown(ev) {
    let allowLeftRight = filter === "";
    listbox.onkeydown(ev, allowLeftRight);
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
    bind:this={listbox}
    items={itemsFiltered}
    onclick={(item) => selectLanguage(item.token)}
  >
    {#snippet renderItem(item)}
      <div>{item.name}</div>
    {/snippet}
  </ListBox>
</form>
