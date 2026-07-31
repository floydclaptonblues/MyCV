# Recovered N80FP Live 3D Boat Tracker Source

This folder preserves selected source files recovered from the original Google AI Studio export for the N80FP live boat tracker.

## Demonstrated capabilities

The recovered project shows that the tracker:

- continuously requested high-accuracy browser geolocation;
- stored latitude, longitude, accuracy, speed, heading, and timestamps;
- established a local origin from the first valid GPS fix;
- projected local latitude/longitude offsets into a Three.js X/Z scene;
- moved and rotated a 3D boat using live GPS position and heading;
- retained a track history;
- dropped timestamped markers at the current field position;
- exported marker records to CSV.

## Included files

- `App.tsx` — application state, origin handling, marker creation, and CSV export.
- `hooks/useGeolocation.ts` — high-accuracy continuous geolocation watcher.
- `types.ts` — GPS, marker, and origin data structures.
- `package.json` — React, TypeScript, Vite, and Three.js project dependencies.

The larger original export also contained `SceneView.tsx` and `Sidebar.tsx`. Those files are retained in the private evidence archive and can be added after final review. The original `.env.local` was intentionally excluded from publication. The recovered tracker does not require a public AI API key to perform its geolocation, visualization, marker, or CSV functions.

## Important limitation

This source belongs to the live 3D tracker shown in the case study. The source for the more specialized Clear / Debris / Crash interface has not yet been recovered. The reconstructed browser demo is a portfolio demonstration, not certified navigation or emergency-response software.
