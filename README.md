# N80FP Search Workflow and Field Software

Technical record of search modeling, geospatial interfaces, field deployment, and supporting documentation produced during the November 2025 N80FP operation in Lake Pontchartrain.

## Independent technical review package

The repository includes a separate review package intended for adversarial inspection:

- browser review page: `review/index.html`
- full review brief: `review/README.md`
- claim-to-evidence matrix: `review/claims.json`
- parameter and provenance ledger: `review/parameters.json`
- deterministic reference model: `review/model/trajectory_model.py`
- fail-closed configuration template: `review/model/config.template.json`
- unit tests: `review/model/test_trajectory_model.py`

On GitHub Pages, the review entry point is:

`https://floydclaptonblues.github.io/MyCV/review/`

The package asks reviewers to identify mathematical errors, unit and convention errors, unsupported assumptions, post-outcome leakage, missing parameters, implementation mismatches, and records required for independent reproduction.

## Recovered technical artifacts

Two separate operational applications are represented in the repository:

- `source/tracker/` — recovered live 3D boat tracker with browser geolocation, movement tracking, marker collection, and CSV export.
- `source/search-simulation/` — recovered search-sector application with stored geographic references, search geometry, live GPS, vessel movement, search-path recording, and Clear/Debris/Crash markers.

The search application explicitly stores:

- modeled POI: `30.1038, -90.0309`
- last-known-position reference: `30.1100, -90.0300`
- altitude label: approximately `908 ft`
- slick/debris reference: `30.1103, -90.0254`
- displayed search ellipse: approximately `0.9 NM × 0.5 NM`

The recovered `Plane.tsx` component is a 12-second linear visualization from the LKP display point to the scene origin. It is not represented as the complete trajectory solver. The fixed-wing derivation stack is documented separately in `source/search-simulation/README.md`, and the review package contains an independent low-order reference implementation.

The recovered archives contained non-empty `.env.local` files. Those files were excluded. No credential is published.

## Archived image evidence

The public technical record uses these original files from the repository's `assets/` folder:

- `1000021127.jpg` — search-sector application
- `1000021128.jpg` — live 3D telemetry tracker
- `1000021129.jpg` — field deployment aboard a search boat
- `Screenshot_20251130_195319_Facebook.jpg` — United Cajun Navy recovery update
- `1000021131.jpg` — handwritten letter and K-9 forensic investigation challenge coin
- `Screenshot 2026-07-30 224632.png` — initial OpenAI Support response, case 03361518
- `Screenshot 2026-07-30 224612.png` — OpenAI Support follow-up
- `Screenshot 2026-07-31 001724.png` — mission-planning email listing Ryan Hall as Special Marine Envoy (SME)

The close-up selfie `1000021130.jpg` is intentionally not used.

The OpenAI correspondence confirms receipt of submitted methodology, selected investigation threads, contextual records, and the reported outcome for internal review. It is not presented as an independent engineering audit or institutional endorsement.

## GitHub Pages

The main technical record is published at:

`https://floydclaptonblues.github.io/MyCV/`

The independent review package is published at:

`https://floydclaptonblues.github.io/MyCV/review/`

## Evidentiary standard

The repository separates source code, equations, screenshots, operational-role documentation, field evidence, public reporting, participant testimony, and post-operation documentation.

The recovered applications establish the stored coordinates, interface behavior, geospatial workflow, and field-tool functions. They do not establish when every coordinate was first generated, reproduce every historical parameter sweep, or prove that one application independently caused the recovery.

The review package deliberately records unresolved inputs and unsupported claims. In particular, the public package does not currently establish an approximately 15-meter prediction-to-recovery distance because the required timestamped prediction record and authoritative recovery coordinate are not both present in a reproducible comparison record.
