class DocDirtyState {
  isDirty = $state(false);
  isDirtyFast = $state(false);
}

export const dirtyState = new DocDirtyState();

class AppState {
  noteSelectorInfoCollapsed = $state(true);
}

export const appState = new AppState();
