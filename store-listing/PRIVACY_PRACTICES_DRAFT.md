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

The current code requests microphone access through the browser when the user activates voice input by calling `navigator.mediaDevices.getUserMedia({ audio: true })` before starting browser speech recognition.

## Speech Recognition And Audio Processing

The current code uses the browser `SpeechRecognition` / `webkitSpeechRecognition` interface.

The project must not claim that speech recognition is fully local or offline. MDN documents that in some browsers, including Chrome, speech recognition on a web page involves a server-based recognition engine and audio is sent to a web service for recognition processing.

The final public privacy policy and Chrome Web Store data-use disclosure must accurately describe this browser-mediated speech processing and must be reviewed against the final packaged release.

## Stored Settings Confirmed By Code

The code stores local settings for:

- launcher position;
- selected language mode;
- manual language choice;
- remembered language behavior.

## Remote Code

No remotely hosted executable code has been identified in the current project evidence. Final Chrome Web Store remote-code answers must still be checked against the exact packaged ZIP before submission.

Browser speech-recognition processing is a data-use/privacy disclosure concern and must not be confused with executing remote extension code.

## Required Before Submission

- Public privacy-policy URL: `REQUIRED — NOT YET PROVIDED`.
- Support contact or support page: `REQUIRED — NOT YET PROVIDED`.
- Final review of code and packaged ZIP.
- Final dashboard answers matching shipped behavior.

## References

- https://developer.chrome.com/docs/webstore/cws-dashboard-privacy
- https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition

## Rule

Do not claim local-only recognition or zero external processing unless a future audited implementation and supporting browser behavior prove that claim.
