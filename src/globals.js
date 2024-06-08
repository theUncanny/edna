/** @typedef {{
  openSettings: () => void,
  openLanguageSelector: () => void,
  openCreateNewNote: () => void,
  openNoteSelector: () => void,
  openHistorySelector: () => void,
  createScratchNote: () => void,
}} GlobalFuncs
*/

// it's easier to make some functions from App.vue available this way
// then elaborate scheme of throwing and catching events
// could also use setContext()
/** @type {GlobalFuncs} */
let globalFunctions;

/**
 * @param {GlobalFuncs} gf
 */
export function setGlobalFuncs(gf) {
  globalFunctions = gf;
}

/**
 * @returns {GlobalFuncs}
 */
export function globalFuncs() {
  return globalFunctions;
}
