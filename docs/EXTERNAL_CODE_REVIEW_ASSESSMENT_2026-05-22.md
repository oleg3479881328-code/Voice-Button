# External Code Review Assessment — 2026-05-22

## Source

A third-party review of Voice Button version `0.2.0` was provided for evaluation.

## Decision

`accept with corrections`

The review contains useful release blockers and technical-debt observations, but several claims are inaccurate or premature and must not be used as project truth without correction.

## Confirmed Useful Findings

### Store assets are missing from current manifest

`manifest.json` currently has no `icons` field and no `action.default_icon` entry. A final store release needs an actual extension icon and manifest update.

Official Chrome Web Store guidance requires a `128x128` PNG extension icon in the extension ZIP. It also requires at least one screenshot for the listing.

### Public privacy policy is required for store work

Chrome Web Store privacy fields require a privacy-policy link and accurate disclosure of data use and permission justification. A draft document in the repository is not a public policy URL.

### Current code needs manual validation before release

Recent changes in language selection and launcher lifecycle remain dependent on human Chrome testing. The existing project release gate correctly remains blocked.

### Large single runtime file is technical debt

The product runtime is concentrated in `content.js`, which holds UI, recognition, language handling, settings and input interaction logic. This increases the risk of regressions and makes later maintenance harder.

### Release versioning should be improved before store submission

A future store release should be tied to a documented release package and a clear version record. A Git tag and release note are reasonable release-process improvements once the release candidate is validated.

## Important Problem Missed By The Review

### Current default language mode conflicts with the intended product behavior

Current code defines `DEFAULT_LANGUAGE_MODE = DEFAULT_MANUAL_LANGUAGE`, and the default manual language is `ru-RU`. This means the extension starts in manual Russian mode instead of automatic mode.

The intended product direction stated by the owner is the opposite: automatic language selection should be the normal default, while manual `RU` and `EN` should exist as fallback controls when automatic selection fails.

This mismatch should be resolved before final user acceptance of language behavior.

## Incorrect Or Overstated Claims

### The extension is not proven to be fully local

The review states that the extension works fully locally and makes no server calls. The repository does not contain a custom backend request, but the product uses the browser `SpeechRecognition` interface. In Chrome, speech recognition can use a server-based recognition engine and send audio to a web service for processing. Therefore the project must not advertise local-only speech processing.

### Microphone acquisition description is incomplete

The review says the microphone is obtained through `SpeechRecognition`. Current code also explicitly requests microphone access through `navigator.mediaDevices.getUserMedia({ audio: true })` before starting recognition.

### The icon-size statement is too broad

The review claims that `16x16`, `48x48` and `128x128` PNG files are all mandatory for Chrome Web Store submission. Official store image guidance explicitly requires a `128x128` PNG extension icon in the ZIP. Additional icon sizes may be useful for the extension UI and manifest quality, but this assessment does not mark all three sizes as proven mandatory store blockers.

### Error handling is already present

The review warns that errors such as `not-allowed`, `no-speech`, `network`, `audio-capture` and `aborted` may not be handled. Current `content.js` includes explicit user-visible mapping for `not-allowed`, `no-speech`, `audio-capture` and `network`, and separately handles `aborted` during stopped sessions. Error UX may still need testing, but absence of handling is not a confirmed defect.

## Recommendations Not Accepted As Immediate Work

### Do not introduce esbuild before the current MVP is validated

Refactoring the code into modules and adding a build step is reasonable technical debt work, but it is not the first blocker. The first blockers are manual behavior validation, privacy disclosure correction, icon creation and release packaging.

### Do not change all-page activation without product decision

The current product purpose is to show the button beside focused editable fields. Switching to activation only after clicking the toolbar icon would change the product experience. Page access should be disclosed and reviewed; a different activation model should be a separate product decision, not an automatic fix.

### Do not start with a large automated-test stack

Automated testing is useful, especially for pure functions such as language resolution and text insertion. However, adding Jest, jsdom and Playwright before validating the current MVP would increase scope. First validate manually; then decide the minimum test layer that prevents repeated regressions.

## Priority Order Accepted For This Project

1. Resolve the product mismatch: decide whether `AUTO` must again be the default mode.
2. Run manual Chrome testing for current `RU`, `EN`, `AUTO` and launcher behavior.
3. Keep privacy-facing documentation free of any local-only recognition claim.
4. Create real extension icon assets and add them to the manifest.
5. Provide a public privacy-policy URL and support contact.
6. Build and verify a clean tester ZIP and later a store release ZIP.
7. Only after MVP stability, decide whether to refactor `content.js` and add automated tests.

## References

- https://developer.chrome.com/docs/webstore/prepare
- https://developer.chrome.com/docs/webstore/cws-dashboard-privacy
- https://developer.chrome.com/docs/webstore/images
- https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition

## Review Status

`reviewed_with_corrections`
