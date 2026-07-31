# Recovered N80FP Live 3D Boat Tracker Source

This folder preserves the sanitized source recovered from the original Google AI Studio export for the N80FP live 3D boat tracker.

## Relationship to the search simulation

The repository contains two recovered applications with different operational functions:

- `source/tracker/` — live boat telemetry, device geolocation, movement history, field-marker collection, and CSV export.
- `source/search-simulation/` — the specialized search-sector and trajectory interface containing the modeled POI, last-known-position reference, debris reference, search geometry, live GPS integration, and `clear`, `debris`, and `crash` marker workflow.

These are complementary parts of the same field workflow. The tracker documented vessel position and field activity, while the search simulation represented the working aircraft model and search area on a three-dimensional surface.

## Demonstrated capabilities

The recovered tracker source shows that the application:

- continuously requests high-accuracy browser geolocation;
- stores latitude, longitude, reported accuracy, speed, heading, and timestamps;
- establishes a local origin from the first valid GPS fix;
- projects local latitude/longitude offsets into a Three.js X/Z scene;
- moves and rotates a 3D boat using live GPS position and heading;
- retains a movement-track history;
- drops timestamped markers at the current field position;
- exports marker records to CSV.

## Included files

- `App.tsx` — application state, origin handling, marker creation, and CSV export.
- `components/SceneView.tsx` — Three.js scene, boat visualization, movement track, camera, and marker rendering.
- `components/Sidebar.tsx` — telemetry display and field controls.
- `hooks/useGeolocation.ts` — high-accuracy continuous geolocation watcher.
- `types.ts` — GPS, marker, and origin data structures.
- `index.tsx` and `index.html` — application entry points.
- `metadata.json` — application metadata and geolocation permission declaration.
- `package.json`, `vite.config.ts`, and `tsconfig.json` — React, TypeScript, Vite, and Three.js project configuration.

## Security sanitation

The original export contained a non-empty `.env.local`; that file was intentionally excluded from publication. The recovered tracker does not require a public AI API key for its geolocation, visualization, marker, tracking, or CSV functions.

## Operational scope

This is recovered field-tool source, not certified navigation or emergency-response software. The browser demo is provided to demonstrate the interface and workflow. The recovered search-simulation source in the adjacent folder documents the modeled search geometry and trajectory implementation that accompanied this tracker during the operation.
