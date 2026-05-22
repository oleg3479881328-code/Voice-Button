# Voice Button — Privacy Practices Draft

## Status

`draft` — must be reviewed before store submission.

## Single Purpose

Voice Button helps a user enter text into editable fields on ordinary web pages by using a voice dictation control displayed near the selected field.

## Permission Justification

### `storage`

Used to remember user-facing settings, including launcher position and language preferences, so the control can behave consistently between uses.

## Page Access Explanation

The extension loads its content script on normal HTTP and HTTPS web pages. This is required so it can:

- detect an editable field chosen by the user;
- display the voice button near that field;
- insert recognized text into that field.

## Microphone Behavior Confirmed By Code

The current code requests microphone access through the browser when the user activates voice input.

## Speech Recognition Statement

The current code uses the browser speech recognition interface. A final public privacy statement must not describe network handling of speech or transcripts until that statement has been checked against current browser behavior and publication requirements.

## Stored Settings Confirmed By Code

The code stores local settings for:

- launcher position;
- selected language mode;
- manual language choice;
- remembered language behavior.

## Remote Code

No remote code declaration is finalized in this draft. It must be confirmed by a complete release-file audit before submission.

## Required Before Submission

- Public privacy-policy URL: `REQUIRED — NOT YET PROVIDED`.
- Support contact or support page: `REQUIRED — NOT YET PROVIDED`.
- Final review of code and packaged ZIP.
- Final dashboard answers matching shipped behavior.

## Rule

Do not claim that user data is or is not transmitted beyond what the audited release and official platform behavior support.
