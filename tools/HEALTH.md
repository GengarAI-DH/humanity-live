# Daily health log (newest first)

## 2026-11-28 (Sat), report run ~9:45 AM PT
- Visitors (PostHog, app=humanity-live, Pacific days): Nov 27: 40 visitors, 41 visits. Nov 28 so far: 11 visitors, 12 visits. Last 24 h: 51 pageviews, 38 visitors with web-vitals.
- Average time on page (from page-leave events): Nov 27: ~522 s. Nov 28 so far: ~1201 s (small sample).
- Errors: Sentry 0 issues in 24 h. PostHog: 8 exceptions, 3 visitors, all Chrome on iOS ("Can't find variable: $" x7, one SyntaxError DOMException). `$` is defined at the top of src/10-utils-time.js; looks like iOS Chrome injected code, no fix made.
- Speed, JS ms per frame (swiftshader, 430x900): 1969 continent 5.60, 1969 ground 9.17; -66040010 continent 3.36, ground 3.55. Draw calls 15-79, triangles 343k-425k. (First entry, no earlier numbers.)
- Popups per minute: deep 1, medieval 3, modern 3 (limit 3, PASS).
- public/index.html: 1,179,191 bytes.
- Scheduled tasks: no failed or stuck runs. Species, interactions, map and art-and-tools jobs and the promoter are paused (enabled=false).
