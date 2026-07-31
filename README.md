# N80FP: An AI-Assisted Aircraft Search

A documented case study of the AI-assisted modeling, live GPS tooling, and field coordination work developed during the search for aircraft N80FP in Lake Pontchartrain.

## Recovered technical artifacts

Two separate operational applications are represented in the repository:

- `source/tracker/` — the recovered live 3D boat tracker with browser geolocation, movement tracking, marker collection, and CSV export.
- `source/search-simulation/` — the recovered specialized search-sector simulation shown in the archived interface screenshot.

The specialized simulation explicitly stores:

- modeled POI: `30.1038, -90.0309`
- last-known-position marker: `30.1100, -90.0300`, approximately 908 feet
- Cajun Navy slick/debris report: `30.1103, -90.0254`
- a roughly `0.9 NM × 0.5 NM` search ellipse
- live GPS, a movable boat, path tracking, and standardized `clear`, `debris`, and `crash` markers

The recovered Google/Gemini application also preserves the live three-dimensional implementation used to examine trajectory behavior under configured altitude, speed, heading, position, and fixed-wing flight constraints. The case study therefore focuses on the inspectable model implementation and operational workflow rather than a standalone distance-to-impact claim.

The recovered archive contained a non-empty `.env.local`; that file was excluded. No credential is published.

## Archived image evidence

The public case study uses these original files from the repository's `assets/` folder:

- `1000021127.jpg` — modeled search interface
- `1000021128.jpg` — live 3D telemetry tracker
- `1000021129.jpg` — field deployment aboard the search boat
- `Screenshot_20251130_195319_Facebook.jpg` — United Cajun Navy recovery update
- `1000021131.jpg` — handwritten recognition letter and challenge coin
- `Screenshot 2026-07-30 224632.png` — initial OpenAI Support acknowledgement, case 03361518
- `Screenshot 2026-07-30 224612.png` — OpenAI Support follow-up confirming receipt of curated investigation materials
- `Screenshot 2026-07-31 001724.png` — mission-planning email listing Ryan Hall as an SME in the operation's ICS structure

The close-up selfie `1000021130.jpg` is intentionally not used.

The OpenAI correspondence establishes that Support received the submitted methodology, primary investigation threads, contextual records, and stated outcome for internal review. It is not presented as an independent technical audit or institutional endorsement of every assertion in the submission.

## GitHub Pages

1. Open **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select `main` and `/ (root)`.
4. Save.

The site should appear at:

`https://floydclaptonblues.github.io/MyCV/`

## Evidentiary standard

The repository separates source code, archived screenshots, operational-role documentation, field evidence, public reporting, and post-operation recognition. The recovered applications establish the configured model, live trajectory implementation, geospatial workflow, and field interface. Public records and operational artifacts establish the wider incident context and Ryan Hall's participation. The page avoids claiming that any one model or person independently completed the recovery operation.
