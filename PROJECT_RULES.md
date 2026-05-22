# Voice Button — Project Rules

## Scope

Voice Button is a minimal Chrome extension for voice dictation into editable fields on normal web pages.

## Source of Truth

- GitHub `main` is the committed source of truth.
- Chat decisions become project state only after repository commit or confirmed test evidence.

## Allowed Work Now

- Improve dictation and language-selection behavior.
- Prepare a tester ZIP.
- Prepare simple installation help for a non-technical tester.
- Prepare Chrome Web Store publication documents.
- Capture reusable lessons for later review.

## Not Allowed Now

- Do not claim the extension is published before evidence exists.
- Do not claim testing passed before a person confirms it.
- Do not add server-based recognition without a separate approved decision.
- Do not increase permissions without documented need and review.
- Do not describe capabilities the current product does not have.

## Quality Rules

- Keep one clear product purpose.
- Prefer a completed MVP over extra features.
- Tester instructions must be understandable without technical experience.
- Publication text must describe real behavior only.

## State Labels

- `generated`: prepared but not committed.
- `committed`: stored in GitHub history.
- `validated`: tested with evidence.
- `reviewed`: checked against requirements.
- `ready`: blockers for the stated purpose are closed.

## Current Risks

- Speech recognition quality may vary by language and browser behavior.
- Test installation must be simple enough for a non-technical person.
- Store preparation requires accurate privacy and page-access disclosures.
