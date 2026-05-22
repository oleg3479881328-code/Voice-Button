# Voice Button — Tester ZIP Packaging

## Purpose

Create a simple extension package that another person can install manually in Chrome without using Chrome Web Store.

## Package Name

`voice-button-testing-v0.2.0.zip`

## Required ZIP Contents

The ZIP must contain the extension files directly at its root:

- `manifest.json`
- `content.js`
- any runtime icon files only when referenced by the manifest

## Files Not Included

Do not put these inside the installable extension ZIP:

- `.git/`
- project documentation folders
- issue exports
- logs
- temporary files
- draft store materials
- the HTML help page

The HTML help page may be delivered beside the ZIP as a separate file.

## Validation Checklist

Before giving the ZIP to a tester:

1. Confirm the ZIP was built from current `main`.
2. Unpack it into a new empty folder.
3. Confirm `manifest.json` is directly inside the extracted folder.
4. Load that folder through Chrome `Load unpacked`.
5. Confirm the extension card appears without a manifest error.
6. Record the source commit and test result.

## Current Status

Packaging instructions are committed. A verified tester ZIP is not yet recorded in project evidence.
