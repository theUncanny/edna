<script context="module">
  export const MENU_OPEN_NOTE = "MENU_OPEN_NOTE";
  export const MENU_RENAME_CURRENT_NOTE = "MENU_RENAME_CURRENT_NOTE";
  export const MENU_DELETE_CURRENT_NOTE = "MENU_DELETE_CURRENT_NOTE";
  export const MENU_CREATE_SCRATCH_NOTE = "MENU_CREATE_SCRATCH_NOTE";
  export const MENU_BLOCK_AFTER_CURR = "MENU_BLOCK_AFTER_CURR";
  export const MENU_BLOCK_BEFORE_CURR = "MENU_BLOCK_BEFORE_CURR";
  export const MENU_BLOCK_AT_END = "MENU_BLOCK_AT_END";
  export const MENU_BLOCK_AT_START = "MENU_BLOCK_AT_START";
  export const MENU_BLOCK_SPLIT_AT_CURSOR = "MENU_BLOCK_SPLIT_AT_CURSOR";
  export const MENU_BLOCK_GOTO_NEXT = "MENU_BLOCK_GOTO_NEXT";
  export const MENU_BLOCK_GOTO_PREV = "MENU_BLOCK_GOTO_PREV";
  export const MENU_BLOCK_CHANGE_LANG = "MENU_BLOCK_CHANGE_LANG";
  export const MENU_BLOCK_SELECTALL = "MENU_BLOCK_SELECTALL";
</script>

<script>
  import Menu from "../Menu.svelte";

  const menuNote = [
    ["Rename current note", MENU_RENAME_CURRENT_NOTE],
    ["Delete current note", MENU_DELETE_CURRENT_NOTE],
    ["Create new scratch note\tAlt + N", MENU_CREATE_SCRATCH_NOTE],
  ];

  const menuBlock = [
    ["And after current", MENU_BLOCK_AFTER_CURR],
    ["Add before current", MENU_BLOCK_BEFORE_CURR],
    ["Add at end", MENU_BLOCK_AT_END],
    ["Add at start", MENU_BLOCK_AT_START],
    ["Split at cursor position", MENU_BLOCK_SPLIT_AT_CURSOR],
    ["Goto next", MENU_BLOCK_GOTO_NEXT],
    ["Goto previous", MENU_BLOCK_GOTO_PREV],
    ["Change language", MENU_BLOCK_CHANGE_LANG],
    ["Select all text", MENU_BLOCK_SELECTALL],
  ];
  const contextMenu = [
    ["Open / create / delete note\tMod + P", MENU_OPEN_NOTE],
    ["Note", menuNote],
    ["Block", menuBlock],
  ];

  function onmenucmd(cmd, ev) {
    console.log("cmd:", cmd);
  }

  let showing = $state(false);

  function filterFn(mi) {
    return false;
  }
</script>

{#if showing}
  <Menu nest={1} {filterFn} {onmenucmd} menu={contextMenu} />
{/if}
