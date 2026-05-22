# Voice Button — Manual Test Checklist

## Status

Not yet completed by a human tester.

## Before Testing

1. Update to the latest `main` version.
2. Open `chrome://extensions` in Chrome.
3. Reload `Voice Button`.
4. Open an ordinary HTTPS page with a text field.

## Basic Check

- Click inside a text field.
- Confirm that the Voice Button control appears near the field.
- Click the microphone button.
- Allow microphone access if Chrome asks.
- Speak a short Russian sentence.
- Confirm whether text appears inside the selected field.

## Language Check

### Manual Russian

- Choose manual mode and Russian language.
- Speak Russian on a page whose interface is in English.
- Record whether Russian words are inserted correctly.

### Manual English

- Choose manual mode and English language.
- Speak a short English sentence.
- Record whether English words are inserted correctly.

### Automatic Mode

- Choose automatic mode.
- Speak Russian and then English in separate tries.
- Record the language shown by the control and the result in the text field.

## Launcher Check

- Click inside a text field and confirm the control appears.
- Click outside the text field and confirm the control hides.
- Start dictation, then click outside the text field and confirm whether listening stops.

## Record The Result

For each check write:

- page tested;
- selected mode;
- sentence spoken;
- result shown in the field;
- pass or fail;
- screenshot if something failed.

## Acceptance Gate

Do not mark release preparation as accepted until the user reports the result of these checks.
