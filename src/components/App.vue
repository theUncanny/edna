<script>

export default {

  methods: {

    /**
     * @param {MouseEvent} e
     */
    onContextMenu(e) {
      if (showingNoteSelector || showingLanguageSelector || showingSettings) {
        return
      }
      // show native context menu if ctrl or shift is pressed
      // especially important for spell checking
      let forceNativeMenu = e.ctrlKey;
      if (forceNativeMenu) {
        return
      }

      let modChar = getModChar();
      let altChar = getAltChar();
      let isDark = document.documentElement.classList.contains("dark");
      let menuTheme = isDark ? "default dark" : "default";
      e.preventDefault();
      showingMenu = true
      let canDelete = canDeleteNote();
      /** @type {MenuItem[]} */
      let items = [
        {
          label: "Open / create / delete note",
          onClick: () => { openNoteSelector() },
          shortcut: `${modChar} + K`,
        },
        {
          label: "Note",
          children: [
            {
              label: "Rename current note",
              onClick: () => { renameCurrentNote() },
              disabled: !canDelete,
            },
            {
              label: "Delete current note",
              onClick: () => { deleteCurrentNote() },
              disabled: !canDelete,
            },
            {
              label: "Create new scratch note",
              onClick: () => { createNewScratchNote() },
              shortcut: `${altChar} + N`,
            },
          ]
        },
        {
          label: "Block",
          children: [
            {
              label: "And after current",
              onClick: () => { getEditor().addNewBlockAfterCurrent() },
              shortcut: `${modChar} + Enter`,
            },
            {
              label: "Add before current",
              onClick: () => { getEditor().addNewBlockBeforeCurrent() },
              shortcut: `${altChar} + Enter`,
            },
            {
              label: "Add at end",
              onClick: () => { getEditor().addNewBlockAfterLast() },
              shortcut: `${modChar} + Shift + Enter`,
            },
            {
              label: "Add at start",
              onClick: () => { getEditor().addNewBlockBeforeFirst() },
              shortcut: `${altChar} + Shift + Enter`,
            },
            {
              label: "Split at cursor position",
              onClick: () => { getEditor().insertNewBlockAtCursor() },
              shortcut: `${modChar} + ${altChar} + Enter`,
            },
            {
              label: "Goto next",
              onClick: () => { getEditor().gotoNextBlock() },
              shortcut: `${modChar} + Down`,
            },
            {
              label: "Goto previous",
              onClick: () => { getEditor().gotoPreviousBlock() },
              shortcut: `${modChar} + Up`,
            },
            {
              label: "Change language",
              onClick: () => { openLanguageSelector() },
              shortcut: `${modChar} + L`,
            },
            {
              label: "Select all text",
              onClick: () => { getEditor().selectAll() },
              shortcut: `${modChar} + A`,
            },
          ]
        },
        // TODO: set plain text, markdown
      ]
      let blockChildren = items[2].children
      let lang = getLanguage(language)
      if (langSupportsFormat(lang)) {
        blockChildren.push({
          label: "Format as " + language,
          onClick: () => { getEditor().formatCurrentBlock() },
          shortcut: `${altChar} + Shift + F`,
        })
      }
      if (langSupportsRun(lang)) {
        blockChildren.push({
          label: "Run " + language,
          onClick: () => { getEditor().runCurrentBlock() },
          shortcut: `${altChar} + Shift + R`,
        })
      }

      /** @type {MenuItem[]} */
      let children = [];
      let dh = getStorageFS();
      if (dh == null) {
        // if currently storing in browser
        children = [
          {
            label: "Current store: browser (localStorage)",
            disabled: true,
          }
        ]
      } else {
        children = [
          {
            label: `Current store: directory '${dh.name}'`,
            disabled: true,
          }
        ]
      }
      if (supportsFileSystem()) {
        if (dh === null) {
          children.push(
            {
              label: "Move notes from browser to directory",
              onClick: () => { storeNotesOnDisk() },
            }
          )
          children.push(
            {
              label: "Switch to notes in a directory",
              onClick: async () => { await pickAnotherDirectory() },
            }
          )
        } else {
          children.push(
            {
              label: "Switch to browser (localStorage)",
              onClick: async () => { await switchToBrowserStorage() },
            }
          )
          children.push(
            {
              label: "Switch to notes in a different directory",
              onClick: async () => { await pickAnotherDirectory() },
            }
          )
        }
      }
      children.push({
        label: "Export notes to .zip file",
        onClick: () => { exportNotesToZipFile() },
        divided: "up",
      })
      children.push({
        label: "Show help",
        onClick: () => { showHelp("#storing-notes-on-disk") },
        divided: "up",
      })
      items.push({
        label: "Notes storage",
        children: children,
      })

      let s = isSpellChecking ? "Disable spell checking" : "Enable spell checking"
      items.push({
        label: s,
        onClick: () => {
          toggleSpellCheck();
        },
      })
      items.push({
        label: "Help",
        divided: "up",
        children: [
          {
            label: "Show help",
            onClick: () => { showHelp() },
          },
          {
            label: "Show help as note",
            onClick: () => { showHelpAsNote() },
          },
          {
            label: "Release notes",
            onClick: () => { showReleaseNotes() },
          }
        ]
      })
      items.push({
        label: "Tip: Ctrl + click for native context menu",
        disabled: true,
      })
      ContextMenu.showContextMenu({
        x: e.x,
        y: e.y,
        theme: menuTheme,
        preserveIconWidth: false,
        keyboardControl: true,
        zIndex: 40,
        // @ts-ignore
        getContainer: () => {
          const o = $refs.menuContainer;
          // const o = document.body;
          return o
        },
        onClose: (lastClicked) => {
          // console.log("onClose: lastClicked:", lastClicked)
          showingMenu = false
          // getEditor().focus()
        },
        items: items,
      });

      // @ts-ignore
      $refs.menuContainer.focus()
    },


  },
}

</script>

<template>
  <div class="overlay">
    <Settings v-if="showingSettings" :initialSettings="settings" @close="onCloseSettings" />
  </div>
  <div :style="mcStyle" class="fixed inset-0 z-40 pointer-events-none">
    <form class="relative w-full h-full pointer-events-none z-50 text-[8px]" ref="menuContainer" tabIndex="-1"></form>
  </div>

</template>
