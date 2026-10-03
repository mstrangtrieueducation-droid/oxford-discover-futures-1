# Oxford Discover Futures Level 1 ebook

Static classroom ebook reader with the supplied Student Book, Workbook, and Unit Tests. Audio and video are embedded from the user's Google Drive, never uploaded with the site.

## Local preview

Serve `dist` with a local HTTP server, or open `dist/index.html` directly. The reader uses relative paths and works under a GitHub Pages repository subpath.

## Publish

Push this directory to a GitHub repository with the default branch `main`. In Settings > Pages, set Source to GitHub Actions. The included workflow publishes only `dist`.

## Content

- 154 Student Book and 128 Workbook original JPEG scans extracted losslessly from the supplied PDFs; existing WebP images remain as a fallback. Scans are about 1447 × 2048 pixels; no artificial upscaling is applied.
- Complete 128-page Workbook and its 15 audio tracks.
- All 10 Unit Tests (51 pages), 10 listening tracks, and the supplied answer key with scripts.
- Full Workbook answer key from Teacher's Guide PDF pages 162–184, including self-assessment, exam preparation, sample answers, and audio scripts. Original page crops preserve the publisher's typography and corrections; 55 sections cover Workbook pages 4–113. Reference lists after page 113 do not have exercise answers in the supplied key.
- 64 lessons from the supplied DISCOVER FUTURES program, with book links, assigned homework, previous-lesson homework correction shortcuts, and test/return sessions. Program Student Book references use PDF positions; the UI labels show printed page numbers. Workbook PDF and printed page numbers agree.
- Obvious unit-label inconsistencies are normalized in lesson cards, with the original wording available under source notes. Lesson 56 Literature is intentionally left blank at the user's request. Literature 1–4 link to printed pages 138, 142, 146, and 150.
- Presentation layout: full-width reading area, on-demand contents/media drawers, hideable toolbar and fullscreen control. Choose fit-width for large text or fit-page for the whole page; H toggles controls, F toggles fullscreen, mouse wheel zooms around the pointer and left-button dragging pans both axes. Shift+wheel pans horizontally. Left/right arrows pan when enlarged; Alt+left/right always turn pages.
- 10 unit navigation entries; page numbers match the printed book where present.
- 65 Student Book audio entries (64 tracks and the copyright recording).
- 31 videos linked directly at their corresponding printed video icons: Factflix, Reflect with/without narration, and the Memory Experiment.
- Audio selected by the exact printed track code. All 64 Student Book tracks are linked at their printed icons, including the vocabulary and Literature pages. Workbook and test listening badges are linked too.
- The audio player starts hidden. Click a play hotspot on the printed speaker icon to open the matching Drive track. The first audio track on the current page preloads invisibly without autoplay. Selecting another page in the same book preserves playback; minimize keeps playing, close stops it. Track selection follows printed codes and stays available in the collapsed player. Video remains in a modal and stops audio before opening; closing the video removes its iframe.
- Start a lesson to open previous-lesson Workbook correction first, then switch to the main lesson and today’s homework. Every assigned page has a direct shortcut. Missing assignments in the source Program are explicitly left unspecified.
- Last page stored only in this browser; no login, analytics, or student data collection.

The supplied book and media retain their original ownership and copyright. This project includes no license grant for those materials. The full Teacher Guide is not published. Tests and answer keys are included at the user's request; hiding answers is a presentation feature, not access control.

The app interface, lesson workflow, help, and media labels are in English. Google Drive owns its embedded player UI and may follow the viewer’s Google account language.

Workbook page 89 prints audio 9.02, which is absent from the supplied media inventory and the Drive searches. Its hotspot is marked unavailable instead of opening the wrong recording. All other supplied audio and video are mapped.

Google Drive controls media playback availability. Each player also provides a direct Drive link if browser playback is unavailable.
