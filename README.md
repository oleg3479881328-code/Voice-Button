# Voice Button

Chrome extension with a floating voice dictation button for regular web pages.

## What It Does

- Shows a microphone button next to focused text fields.
- Uses the browser `SpeechRecognition` / `webkitSpeechRecognition` API.
- Inserts dictated text into text inputs, textareas, and common editable web editors.
- Lets the launcher be moved and hidden on a page.

## Install Locally

1. Open `chrome://extensions`.
2. Enable `Developer mode`.
3. Click `Load unpacked`.
4. Select this project folder.
5. Open an `http` or `https` page and focus a text field.

## Limits

- Does not work on `chrome://` pages or the Chrome Web Store.
- Works inside browser pages, not native Windows applications.
- Depends on Chrome's Web Speech API support.
