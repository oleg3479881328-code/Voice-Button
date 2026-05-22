---
status: in-progress
project_mode: full
current_step: 09_LOG
current_run: workflow-runs/0001-legacy-normalization-and-publication-readiness/
last_updated: 2026-05-22
next_action: Run manual Chrome testing of the current extension and record results.
---

# Voice Button — Project State

## Phase

Existing project normalized; tester and Chrome Web Store preparation documents are committed.

## Current Run

`workflow-runs/0001-legacy-normalization-and-publication-readiness/`

## Confirmed Decisions

- Product name: `Voice Button`.
- Product: Chrome extension for voice dictation into editable fields on normal web pages.
- This repository is the dedicated project repository.
- Branch `main` is the committed project source of truth.
- Store submission is not yet approved.
- A central reusable publication-readiness skill has been created separately as a candidate only.

## Existing Code Evidence

- `4e36c77`: language mode feature.
- `03c51de`: language state and focus fix.
- `7be3df5`: manual RU mode fix.
- `f810588`: launcher hide behavior fix.

## Committed Project Artifacts

- `PROJECT_ENTRYPOINT.md`
- `PROJECT_RULES.md`
- `CONTEXT_PACK.md`
- `logs/PROJECT_LOG.md`
- `workflow-runs/0001-legacy-normalization-and-publication-readiness/`
- `project-library/`
- `agents/README.md`
- `docs/MANUAL_TEST_CHECKLIST.md`
- `docs/CHROME_WEB_STORE_READINESS.md`
- `docs/TESTER_ZIP_PACKAGING.md`
- `store-listing/STORE_LISTING_DRAFT.md`
- `store-listing/PRIVACY_PRACTICES_DRAFT.md`
- `store-listing/ASSET_REQUIREMENTS.md`
- `store-listing/TEST_INSTRUCTIONS.md`
- `help/INSTALL_AND_TEST_GUIDE.html`

## Validation Needed

- Test RU, EN and AUTO in Chrome.
- Test launcher display and hiding behavior.
- Build and test the extension ZIP on another computer.
- Supply final icons, screenshots, policy page URL and support contact for store work.

## Agents

No project-specific agents are required now.

## Latest Result

The first documented workflow run is complete through its log stage. Project documentation, tester help and publication-preparation drafts exist in `main`. Human browser testing remains the blocking gate.

## Next Action

Run manual browser testing against the latest committed extension and record the outcome.
