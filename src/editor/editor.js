import { Annotation, EditorState, Compartment } from "@codemirror/state"
import { EditorView, keymap, drawSelection, ViewPlugin } from "@codemirror/view"
import { indentUnit, forceParsing } from "@codemirror/language"

import { heynoteLight } from "./theme/light.js"
import { heynoteDark } from "./theme/dark.js"
import { heynoteBase } from "./theme/base.js"
import { customSetup } from "./setup.js"
import { heynoteLang } from "./lang-heynote/heynote.js"
import { noteBlockExtension } from "./block/note-block.js"
import { heynoteKeymap } from "./keymap.js"
import { languageDetection } from "./language-detection/autodetect.js"


export class HeynoteEditor {
    constructor({element, content, focus=true, theme="light"}) {
        this.theme = new Compartment

        this.state = EditorState.create({
            doc: content || "",
            extensions: [
                heynoteKeymap,

                //minimalSetup,
                customSetup, 
                
                this.theme.of("dark" ? heynoteDark : heynoteLight),
                heynoteBase,
                indentUnit.of("    "),
                EditorView.scrollMargins.of(f => {
                    return {top: 80, bottom: 80}
                }),
                heynoteLang(),
                noteBlockExtension(element),
                languageDetection(() => this.view),
                
                // set cursor blink rate to 1 second
                drawSelection({cursorBlinkRate:1000}),

                // add CSS class depending on dark/light theme
                EditorView.editorAttributes.of((view) => {
                    return {class: view.state.facet(EditorView.darkTheme) ? "dark-theme" : "light-theme"}
                }),
            ],
        })

        this.view = new EditorView({
            state: this.state,
            parent: element,
        })

        if (focus) {
            this.view.dispatch({
                selection: {anchor: this.view.state.doc.length, head: this.view.state.doc.length},
                scrollIntoView: true,
            })
            this.view.focus()
        }
    }

    setTheme(theme) {
        this.view.dispatch({
            effects: this.theme.reconfigure(theme === "dark" ? heynoteDark : heynoteLight),
        })
    }
}



/*// set initial data
editor.update([
    editor.state.update({
        changes:{
            from: 0,
            to: editor.state.doc.length,
            insert: initialData,
        },
        annotations: heynoteEvent.of(INITIAL_DATA),
    })
])*/

