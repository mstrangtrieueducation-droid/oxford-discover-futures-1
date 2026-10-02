# Oxford Discover Futures Level 1 ebook

Static ebook reader with the supplied 154-page Student Book. Audio and video are embedded from the user's Google Drive, never uploaded with the site.

## Local preview

Serve `dist` with a local HTTP server, or open `dist/index.html` directly. The reader uses relative paths and works under a GitHub Pages repository subpath.

## Publish

Push this directory to a GitHub repository with the default branch `main`. In Settings > Pages, set Source to GitHub Actions. The included workflow publishes only `dist`.

## Content

- 154 optimized WebP page images, preserving the supplied book layout.
- 10 unit navigation entries; page numbers match the printed book where present.
- 65 Student Book audio entries (64 tracks and the copyright recording).
- 31 videos mapped by the Unit number in their filenames.
- Audio selected by the exact printed track code. Audio is not automatically mapped to individual pages.
- Media dialog removes its iframe on close or Escape to terminate playback.
- Last page stored only in this browser; no login, analytics, or student data collection.

The supplied book and media retain their original ownership and copyright. This project includes no license grant for those materials. The Teacher Guide and tests are not included in the public site.

Google Drive controls media playback availability. The dialog also provides a direct Drive link if browser playback is unavailable.
