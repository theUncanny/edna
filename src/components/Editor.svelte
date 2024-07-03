<script>
  import { EdnaEditor } from "../editor/editor.js";
  import { syntaxTree } from "@codemirror/language";
  import {
    kScratchNoteName,
    loadCurrentNote,
    loadCurrentNoteIfOnDisk,
    loadNote,
    saveCurrentNote as saveCurrentNoteContent,
  } from "../notes.js";
  import { rememberEditor } from "../state.js";
  import { getSettings, onSettingsChange } from "../settings.js";
  import { dirtyState } from "../state.svelte.js";
  import debounce from "debounce";
  import { throwIf } from "../util.js";
  import { EditorView } from "@codemirror/view";
  import { triggerCurrenciesLoaded } from "../editor/block/commands.js";
  import {
    kEventCurrenciesLoaded,
    setCurrenciesLoadedCb,
    startLoadCurrencies,
  } from "../currency.js";

  let enableDiskRefresh = false;

  /** @typedef {import("../editor/event.js").SelectionChangeEvent} SelectionChangeEvent */

  /** @type {{
    debugSyntaxTree: boolean,
    keymap: string,
    emacsMetaKey: string,
    showLineNumberGutter: boolean,
    showFoldGutter: boolean,
    bracketClosing: boolean,
    fontFamily: string,
    fontSize: number,
    cursorChange: (e: SelectionChangeEvent) => void,
    docDidChange: () => void,
    didOpenNote: (name: string) => void,
   }}*/

  let {
    debugSyntaxTree,
    keymap = "default",
    emacsMetaKey = "alt",
    showLineNumberGutter = true,
    showFoldGutter = true,
    bracketClosing = false,
    fontFamily,
    fontSize,
    cursorChange,
    docDidChange,
    didOpenNote,
  } = $props();

  let syntaxTreeDebugContent = $state(null);
  let diskContent = $state(null);
  let debouncedRefreshFunc = $state(null);
  let didMount = false;

  /** @type {EdnaEditor} */
  let editor;

  /** @type {HTMLElement} */
  let editorEl;

  let theme = getSettings().theme;

  function updateEditorForSettings(newSettings) {
    if (!editor) {
      return;
    }
    editor.setTheme(newSettings.theme);
    editor.setKeymap(newSettings.keymap, newSettings.emacsMetaKey);
    editor.setBracketClosing(newSettings.bracketClosing);
    editor.setFoldGutter(newSettings.showFoldGutter);
    editor.setLineNumberGutter(newSettings.showLineNumberGutter);
    editor.setFont(newSettings.fontFamily, newSettings.fontSize);
  }
  onSettingsChange(updateEditorForSettings);

  function mounted() {
    console.log("Editor.svelte: mounted, editorEl:", editorEl);
    if (!editorEl || didMount) {
      return;
    }
    didMount = true;

    document.addEventListener("keydown", (e) => {
      // console.log(e);
      // prevent the default Save dialog from opening and save if dirty
      let isCtrlS = e.ctrlKey && e.key === "s";
      isCtrlS = isCtrlS || (e.metaKey && e.key === "s");
      if (isCtrlS) {
        e.preventDefault();
        // TODO: track isDirty state here?
        if (dirtyState.isDirty) {
          saveForce();
        }
      }
    });

    // forward events dispatched from editor.js

    /**
     * @param {SelectionChangeEvent} ev
     */
    function onSelChange(ev) {
      cursorChange(ev);
    }
    editorEl.addEventListener("selectionChange", onSelChange);
    editorEl.addEventListener("docChanged", (e) => {
      docDidChange();
    });

    // load buffer content and create editor
    loadCurrentNote().then((content) => {
      diskContent = content;
      editor = new EdnaEditor({
        element: editorEl,
        content: content,
        theme: theme,
        saveFunction: saveFunction,
        keymap: keymap,
        emacsMetaKey: emacsMetaKey,
        showLineNumberGutter: showLineNumberGutter,
        showFoldGutter: showFoldGutter,
        bracketClosing: bracketClosing,
        fontFamily: fontFamily,
        fontSize: fontSize,
        spacesPerTab: 2, // TODO: add a setting for this
      });
      rememberEditor(editor);
      setCurrenciesLoadedCb(() => {
        triggerCurrenciesLoaded(editor.view);
      });
      // intentially we delay it until we register a callback
      startLoadCurrencies();
      let settings = getSettings();
      let name = settings.currentNoteName;
      throwIf(!name);
      didOpenNote(name);

      scheduleRefreshFromDisk();
    });

    // if debugSyntaxTree prop is set, display syntax tree for debugging
    if (debugSyntaxTree) {
      setInterval(() => {
        function render(tree) {
          let lists = "";
          tree.iterate({
            enter(type) {
              lists += `<ul><li>${type.name} (${type.from},${type.to})`;
            },
            leave() {
              lists += "</ul>";
            },
          });
          return lists;
        }
        syntaxTreeDebugContent = render(syntaxTree(editor.view.state));
      }, 1000);
    }

    return () => {
      setCurrenciesLoadedCb(null);
    };
  }

  $effect(() => {
    mounted();
  });

  $effect(() => {
    console.log("changing theme");
    if (editor) {
      editor.setTheme(theme);
    }
  });
  $effect(() => {
    if (editor) {
      editor.setKeymap(keymap, emacsMetaKey);
    }
  });
  $effect(() => {
    if (editor) {
      editor.setLineNumberGutter(showLineNumberGutter);
    }
  });
  $effect(() => {
    if (editor) {
      editor.setFoldGutter(showFoldGutter);
    }
  });
  $effect(() => {
    if (editor) {
      editor.setBracketClosing(bracketClosing);
    }
  });
  $effect(() => {
    if (editor) {
      editor.setFont(fontFamily, fontSize);
    }
  });

  function maybeRefreshFromDisk() {
    loadCurrentNoteIfOnDisk().then((latestContentOnDisk) => {
      if (!latestContentOnDisk) {
        scheduleRefreshFromDisk();
        return;
      }
      let currContent = getContent();
      if (latestContentOnDisk != currContent) {
        console.log("the content was modified on disk");
        // TODO: maybe restore cursor position
        setEditorContent(latestContentOnDisk);
        docDidChange();
      }
      scheduleRefreshFromDisk();
    });
  }

  function clearScheduledRefreshFromDisk() {
    if (debouncedRefreshFunc) {
      debouncedRefreshFunc.clear();
      debouncedRefreshFunc = null;
    }
  }

  function scheduleRefreshFromDisk() {
    if (!enableDiskRefresh) {
      return;
    }
    clearScheduledRefreshFromDisk();
    console.log("creating debounce for maybeRefreshFromDisk");
    debouncedRefreshFunc = debounce(() => {
      console.log("about to run maybeRefreshFromDisk");
      maybeRefreshFromDisk();
    }, 5000);
    debouncedRefreshFunc();
  }

  async function saveFunction(content) {
    if (content === diskContent) {
      console.log("saveFunction: content unchanged, skipping save");
      return;
    }
    console.log("saveFunction: saving content");
    diskContent = content;
    await saveCurrentNoteContent(content);

    scheduleRefreshFromDisk();
  }

  function saveForce() {
    console.log("saveForce");
    saveFunction(getContent());
  }

  export function getBlocks() {
    return editor.getBlocks();
  }

  export function setReadOnly(value) {
    editor.setReadOnly(value);
  }

  export function isReadOnly() {
    return editor.isReadOnly();
  }

  export function setSpellChecking(value) {
    // console.log("setSpellChecking:", value)
    let ce = document.querySelector('[contenteditable="true"]');
    if (!ce) {
      // console.log("no content editable found")
      return;
    }
    // console.log("found content editable")
    if (value) {
      ce.setAttribute("spellcheck", "true");
    } else {
      ce.setAttribute("spellcheck", "false");
    }
  }

  export function isSpellChecking() {
    let ce = document.querySelector('[contenteditable="true"]');
    if (!ce) {
      return false;
    }
    return ce.getAttribute("spellcheck") === "true";
  }

  export function setLanguage(language) {
    if (language === "auto") {
      editor.setCurrentLanguage("text", true);
    } else {
      editor.setCurrentLanguage(language, false);
    }
    editor.focus();
  }

  /**
   * @returns {EditorView}
   */
  export function getEditorView() {
    return editor.view;
  }

  export function focus() {
    editor.focus();
  }

  export function addNewBlockAfterCurrent() {
    editor.addNewBlockAfterCurrent();
    editor.focus();
  }

  export function addNewBlockBeforeCurrent() {
    editor.addNewBlockBeforeCurrent();
    editor.focus();
  }

  export function addNewBlockAfterLast() {
    editor.addNewBlockAfterLast();
    editor.focus();
  }

  export function addNewBlockBeforeFirst() {
    editor.addNewBlockBeforeFirst();
    editor.focus();
  }

  export function insertNewBlockAtCursor() {
    editor.insertNewBlockAtCursor();
    editor.focus();
  }

  export function gotoNextBlock() {
    editor.gotoNextBlock();
    editor.focus();
  }

  export function getActiveNoteBlock() {
    return editor.getActiveNoteBlock();
  }

  export function gotoBlock(n) {
    editor.gotoBlock(n);
    editor.focus();
  }

  export function gotoPreviousBlock() {
    editor.gotoPreviousBlock();
    editor.focus();
  }

  export function selectAll() {
    editor.selectAll();
    editor.focus();
  }

  export function getContent() {
    return editor.getContent();
  }

  // saving is debounced so ensure we save before opening a new note
  // TODO: we'll have a spurious save if there was a debounce, because
  // the debounce is still in progress, I think
  export async function saveCurrentNote() {
    await editor.saveFunction(editor.getContent());
  }

  export function setEditorContent(content) {
    diskContent = content;
    let newState = editor.createState(content);
    editor.view.setState(newState);
  }

  /**
   * @param {string} name
   */
  export async function openNote(name, skipSave = false) {
    console.log("openNote:", name);
    if (!skipSave) {
      // TODO: this is async so let's hope it works
      await saveCurrentNote();
    }
    let content = await loadNote(name);
    console.log("Editor.openNote: loaded:", name);
    editor.setTheme(theme);
    // TODO: move this logic to App.onDocChanged
    // a bit magic: sometimes we open at the beginning, sometimes at the end
    // TODO: remember selection in memory so that we can restore during a session
    setEditorContent(content);
    let pos = 0;
    if (name === kScratchNoteName) {
      pos = content.length;
    }
    editor.view.dispatch({
      selection: { anchor: pos, head: pos },
      scrollIntoView: true,
    });
    focus();
    console.log("openNote: triggering docChanged event, name:", name);
    didOpenNote(name);
  }
</script>

<div class="overflow-hidden">
  <div class="editor" bind:this={editorEl}></div>
  {#if debugSyntaxTree}
    <div class="debug-syntax-tree">
      {@html syntaxTreeDebugContent}
    </div>
  {/if}
</div>

<style>
  :global(.debug-syntax-tree) {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    width: 50%;
    background-color: rgba(240, 240, 240, 0.85);
    color: #000;
    font-size: 12px;
    font-family: monospace;
    padding: 10px;
    overflow: auto;
  }

  :global(.debug-syntax-tree ul) {
    padding-left: 20px;
  }

  :global(.debug-syntax-tree > ul) {
    padding-left: 0;
  }
</style>
