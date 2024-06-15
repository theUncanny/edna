# Release notes for Edna

## 1.4

- improved context menu
- added context menu trigger in upper navigation
- re-designed and simplifed settings dialog
- hide upper navigation bar when typing. This is to focus the user and not obscure text under it

## 1.3

- `Mod + E` for quickly switching to recently opened notes
- show note name in the upper right corner

## 1.2

- add export of notes to a .zip file

## 1.1

- add Ctrl + P / Cmd + P shortcut for opening / creating notes

## 1.0

The first release since forking Heynote. Changes from Heynote:

- made it web app
- support multiple notes
  - ability to assign Alt + N quick access shortcuts
  - delete / rename notes
- store notes either in browser (localStorage) or directory on disk
- context menu with most frequent operations
- add Mod + P shortcut for note switcher
- add formatting and execution of Go
- add svelte and vue languages syntax highlighting
- set window title based on note name
- store note name in URL's #hash so that they can be bookmarked
