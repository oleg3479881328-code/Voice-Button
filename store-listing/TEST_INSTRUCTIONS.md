# Voice Button — Test Instructions

## Status

`draft` — no passed test result is claimed here.

## Installation For Testing

1. Unpack the extension ZIP into a normal folder.
2. Open Google Chrome.
3. Open `chrome://extensions`.
4. Turn on Developer mode.
5. Click Load unpacked.
6. Select the unpacked Voice Button folder.
7. Confirm that the Voice Button extension card appears.

## Functional Test

1. Open an ordinary HTTPS web page containing a text field.
2. Click inside the text field.
3. Confirm that the Voice Button control appears near the field.
4. Click the microphone control.
5. Allow microphone access when prompted.
6. Speak a short phrase.
7. Confirm whether recognized text appears in the field.

## Language Test

1. Check manual Russian mode with Russian speech.
2. Check manual English mode with English speech.
3. Check automatic mode separately.
4. Record the displayed mode and the inserted text for each attempt.

## Launcher Test

1. Focus a text field and confirm the control appears.
2. Leave the field and confirm the control hides.
3. Start voice input and then leave the field; record whether listening stops.

## Known Unsupported Places

Do not use internal Chrome pages or the Chrome Web Store page as normal dictation test pages.

## Evidence To Record

- Chrome version if available;
- page tested;
- selected mode;
- result for each test;
- screenshot for any failure.

## Acceptance Note

This document defines the test procedure only. The project remains blocked until test results are actually recorded.
