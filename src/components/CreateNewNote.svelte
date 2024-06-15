<script>
  import { getLatestNoteNames, sanitizeNoteName } from "../notes";
  import { focus } from "../actions";

  /** @type { {
    onclose: () => void,
    createNewNote: (newName: string) => void,
}}*/
  let { onclose, createNewNote } = $props();

  let newName = $state("");

  let sanitizedNewName = $derived.by(() => {
    return sanitizeNoteName(newName);
  });

  let canCreate = $derived.by(() => {
    let name = sanitizeNoteName(newName);
    if (name === "") {
      return false;
    }
    let noteNames = getLatestNoteNames();
    return !noteNames.includes(name);
  });

  let renameError = $derived.by(() => {
    let name = sanitizeNoteName(newName);
    console.log(`renameError: newName: '${newName}', name: '${name}`);
    if (name === "") {
      return "name cannot be empty";
    }
    let noteNames = getLatestNoteNames();
    if (noteNames.includes(name)) {
      console.log("already exists");
      return "name already exists";
    }
    return "";
  });

  /**
   * @param {KeyboardEvent} ev
   */
  function onkeydown(ev) {
    let key = ev.key;

    if (canCreate && key === "Enter") {
      emitCreate();
      ev.preventDefault();
      ev.stopPropagation();
      return;
    }
  }

  function emitCreate() {
    let name = sanitizeNoteName(newName);
    createNewNote(name);
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  role="dialog"
  {onkeydown}
  class="selector z-20 absolute center-x-with-translate top-[4rem] flex flex-col max-w-full p-3"
>
  <div>Create new note</div>
  <input
    bind:value={newName}
    use:focus
    class="py-1 px-2 bg-white mt-2 rounded-sm w-[80ch]"
  />
  <div class=" text-sm mt-2">
    Name: <span class="font-bold">"{sanitizedNewName}"</span>
    {#if !canCreate}
      <span class="text-red-500 font-bold">{renameError}</span>
    {/if}
  </div>
  <div class="flex justify-end mt-2">
    <button
      onclick={onclose}
      class="mr-4 px-4 py-1 border border-black hover:bg-gray-100"
      >Cancel</button
    >
    <button
      onclick={() => emitCreate()}
      disabled={!canCreate}
      class="px-4 py-1 border border-black hover:bg-gray-50 disabled:text-gray-400 disabled:border-gray-400 default:bg-slate-700"
      >Create</button
    >
  </div>
</div>
