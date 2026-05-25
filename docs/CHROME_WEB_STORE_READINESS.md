# Voice Button — Chrome Web Store Readiness

## Release Gate

`BLOCKED`

The extension is not yet approved for store submission. Manual browser validation and publication materials are still required.

## Current Manifest Snapshot

- Name: `Voice Button`
- Version: `0.2.0`
- Manifest version: `3`
- Permission listed: `storage`
- Content script: `content.js` on ordinary HTTP and HTTPS pages
- Icon files connected in manifest: `16`, `32`, `48`, `128` PNG

## Current Product Purpose

Voice Button adds a small voice dictation control near an editable field on a web page and inserts recognized speech into that field.

## Completed Preparation Work

- Extension icon assets have been committed:
  - `icons/icon-16.png`
  - `icons/icon-32.png`
  - `icons/icon-48.png`
  - `icons/icon-128.png`
- `manifest.json` now connects those icon files through `icons` and `action.default_icon`.

## Required Before Submission

- Confirm current behavior through manual Chrome testing.
- Resolve the current default-language mismatch: intended normal mode is `AUTO`, while the current code starts in manual Russian mode.
- Prepare a clean release ZIP with `manifest.json` at its root.
- Visually check the new icon in Chrome and approve it for store use.
- Prepare final listing text.
- Prepare final privacy statements based on actual product behavior.
- Provide a public privacy-policy URL and support contact.
- Prepare real screenshots of the current product.

## Current Blockers

- Default language mode does not yet match the intended product direction.
- Language and launcher behavior require user confirmation after recent code changes.
- Tester ZIP has not yet been recorded as verified in project evidence.
- Screenshot, privacy-policy URL and support-contact evidence are not yet committed.

## Official Reference Pages

- https://developer.chrome.com/docs/webstore/prepare
- https://developer.chrome.com/docs/webstore/publish/
- https://developer.chrome.com/docs/webstore/best-listing
- https://developer.chrome.com/docs/webstore/cws-dashboard-privacy
- https://developer.chrome.com/docs/webstore/images
- https://developer.chrome.com/docs/webstore/review-process

## Next Action

Restore `AUTO` as the intended default mode, then complete manual Chrome testing and record pass/fail results.
