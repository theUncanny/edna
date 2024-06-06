import { ViewPlugin } from "@codemirror/view";
import debounce from "debounce";
import { dirtyState } from "../state.svelte";

export const autoSaveContent = (saveFunction, interval) => {
  const debouncedSave = debounce((view) => {
    //console.log("saving buffer")
    saveFunction(view.state.sliceDoc());
    dirtyState.isDirty = false;
  }, interval);

  return ViewPlugin.fromClass(
    class {
      update(update) {
        if (update.docChanged) {
          dirtyState.isDirty = true;
          debouncedSave(update.view);
        }
      }
    }
  );
};
