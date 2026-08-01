# N80FP Independent Technical Review Package

## Review request

This package requests an independent technical review of the N80FP search-modeling workflow and its published software artifacts.

The review objective is to identify:

- mathematical errors;
- unit or convention errors;
- unsupported assumptions;
- code-to-documentation mismatches;
- use of post-discovery information in a pre-discovery model;
- variables that should be represented as ranges or probability distributions;
- conclusions that exceed the available evidence;
- missing records required for reproducibility.

The requested review is adversarial. Agreement with the project narrative is not an objective.

## Package contents

- `index.html` — browser entry point for reviewers.
- `claims.json` — machine-readable claim-to-evidence matrix.
- `parameters.json` — machine-readable parameter and provenance ledger.
- `model/trajectory_model.py` — deterministic low-order reference implementation.
- `model/config.template.json` — configuration template containing known values and deliberate nulls for unsourced values.
- `model/test_trajectory_model.py` — standard-library unit tests.
- `../source/search-simulation/README.md` — recovered application equations and fixed-wing derivation stack.
- `../source/search-simulation/` — recovered search-interface source.
- `../source/tracker/` — recovered live boat-tracker source.

## Source boundary

The repository contains two distinct technical layers.

### Recovered application layer

The recovered React and Three.js source directly establishes:

- stored geographic references;
- the local display projection;
- the search ellipse;
- live browser geolocation;
- vessel movement and search-path recording;
- timestamped Clear, Debris, and Crash markers;
- the aircraft visualization.

The recovered `Plane.tsx` component is a linear display interpolation. It is not a complete flight-dynamics solver.

### Reference-model layer

`model/trajectory_model.py` is a new, independent reference implementation of the documented coordinated-turn descent equations. It exists to permit review of the derivation without attributing the full solver to the recovered animation component.

The reference model assumes constant airspeed, bank, flight-path angle, and wind during a short terminal interval. It is not a high-fidelity accident reconstruction. It does not model changing control inputs, structural breakup, post-stall aerodynamics, water-entry dynamics, or sensor uncertainty internally.

## Claim-to-evidence matrix

The complete structured matrix is in `claims.json`.

| ID | Claim | Status | Primary support | Principal limitation |
|---|---|---|---|---|
| C-001 | Modeled POI stored at `30.1038, -90.0309` | Direct | `constants.ts` | Does not prove when the coordinate was first generated or entered |
| C-002 | LKP stored at `30.1100, -90.0300` with an approximately `908 ft` label | Direct | `constants.ts` | Altitude datum and rounding are not established |
| C-003 | Slick/debris reference stored at `30.1103, -90.0254` | Direct | `constants.ts` | Does not independently validate the original report |
| C-004 | Search app includes projection, ellipse, GPS, trail, and marker workflow | Direct | recovered source | Projection is a scene transform, not a full geodesic system |
| C-005 | Aircraft display uses 12-second linear interpolation | Direct | `Plane.tsx` | Not the complete trajectory solver |
| C-006 | Boat tracker records geolocation, movement, markers, and CSV | Direct | `source/tracker/` | Not certified navigation software |
| C-007 | Applications were used in the field operation | Corroborated | field image, role email, archive | No complete contemporaneous software-use log |
| C-008 | Tracker was distributed to other boats | Testimony | Ryan Hall field account | No public boat-by-boat access log |
| C-009 | Fixed-wing derivation is independently implementable | Derived | derivation plus reference model | Low-order constant-state model |
| C-010 | Approximately 15-meter prediction-to-recovery distance | Not established | none in public package | Requires timestamped prediction and authoritative recovery coordinate |
| C-011 | Software independently caused the recovery | Not established | none | Not claimed; recovery was multi-team |

## Parameter ledger

The complete structured ledger is in `parameters.json`.

### Values currently present in recovered source

| Parameter | Stored value | Status | Review issue |
|---|---:|---|---|
| LKP latitude | `30.1100` | Direct | Confirm source and precision |
| LKP longitude | `-90.0300` | Direct | Confirm source and precision |
| LKP altitude label | `908 ft` | Provisional | Determine AGL/MSL/pressure datum and rounding |
| Modeled POI latitude | `30.1038` | Direct | Comparison only; do not tune model to target |
| Modeled POI longitude | `-90.0309` | Direct | Comparison only; do not tune model to target |
| Debris-reference latitude | `30.1103` | Direct | Validate original observation record |
| Debris-reference longitude | `-90.0254` | Direct | Validate original observation record |

### Required values not yet populated in the public review configuration

- airspeed;
- groundspeed if used to infer airspeed;
- heading versus ground track;
- bank-angle range and turn direction;
- flight-path angle or vertical speed;
- wind speed and direction at the relevant time and altitude;
- wings-level stall speed and aircraft configuration;
- uncertainty ranges and source quality for each value.

The configuration template uses `null` for these values. The model refuses to run until they are supplied.

## Equation-to-code map

| Technical item | Recovered application | Review reference implementation |
|---|---|---|
| Stored LKP, POI, debris reference | `source/search-simulation/constants.ts` | `config.template.json` |
| Scene projection | `constants.ts` | metric local tangent conversion in `trajectory_model.py` |
| Search ellipse | `components/World/SceneMarkers.tsx` | not used as a solver boundary by default |
| Live GPS and marker entry | `App.tsx`, vehicle and HUD components | outside reference-model scope |
| Aircraft display interpolation | `components/Vehicles/Plane.tsx` | explicitly not treated as dynamics |
| Wind components | not present in recovered animation | `wind_components_mps()` |
| Coordinated-turn rate | documented derivation | numerical and closed-form implementations |
| Descent propagation | documented derivation | `propagate()` |
| Accelerated-stall gate | documented derivation | validation before propagation |
| Water-contact gate | documented derivation | interpolated final integration step |
| Coordinate output | app inverse scene mapping | local tangent-plane inverse conversion |
| Parameter sweep | historical record incomplete | Cartesian sweep with CSV output |

## Reproducibility procedure

The reference model uses Python 3 and the standard library only.

1. Copy the template:

   ```bash
   cp review/model/config.template.json review/model/config.local.json
   ```

2. Populate each required `null` value and record its source in `parameters.json` or a separate review note.

3. Run one candidate:

   ```bash
   python review/model/trajectory_model.py \
     review/model/config.local.json \
     --output-dir review/model/output
   ```

4. Run a parameter sweep after supplying non-empty arrays under `sweep`:

   ```bash
   python review/model/trajectory_model.py \
     review/model/config.local.json \
     --sweep \
     --output-dir review/model/sweep-output
   ```

5. Run tests:

   ```bash
   cd review/model
   python -m unittest -v
   ```

Single-run outputs:

- `summary.json`
- `track.csv`

Sweep output:

- `impact_points.csv`

The summary compares the numerical integration with the closed-form constant-state solution. A large difference indicates an implementation or integration-step problem.

## Reviewer questions

### Input provenance

1. Which terminal-state values existed before the recovery location was known?
2. Are any current inputs copied from, rounded toward, or inferred from the known recovery area?
3. Is the `908 ft` value height above water, MSL altitude, pressure altitude, or a display approximation?
4. Is the available speed airspeed or ADS-B groundspeed?
5. Is the available direction aircraft heading or ground track?

### Mathematics and conventions

6. Are heading and bank signs consistent in every equation and implementation?
7. Is meteorological wind direction converted correctly to east/north velocity components?
8. Does the local tangent-plane approximation remain adequate over the search area?
9. Are degrees and radians separated consistently?
10. Is vertical speed compatible with the selected airspeed and flight-path angle?
11. Is the coordinated-turn equation appropriate once the aircraft approaches an accelerated stall or loss of control?
12. Should turn rate be based on true airspeed, calibrated airspeed, or another quantity for this purpose?

### Model structure

13. Which parameters can reasonably remain constant during the terminal interval?
14. Which require time-varying functions or bounded stochastic processes?
15. Should a controlled-flight and loss-of-control branch be modeled separately?
16. How should uncertainty in wind, bank, speed, and descent rate be combined without creating a misleading uniform grid?
17. What rejection gates are physically justified, and which merely encode the expected answer?
18. Does the search ellipse follow from surviving trajectories or was it manually selected?

### Reproducibility and leakage

19. Can the modeled POI be regenerated from pre-discovery records without reading the stored POI first?
20. Does removing the modeled POI from the configuration change any propagation result?
21. Can the result be reproduced from a clean checkout with no private conversation history or API access?
22. Which historical calculations are absent from the repository?
23. What additional artifact would most increase confidence: raw ADS-B rows, timestamped prediction logs, weather records, or authoritative recovery coordinates?

## Interpretation rules

- A stored coordinate is not proof of when the coordinate was generated.
- A visualization is not proof that every documented equation ran inside the visual component.
- A close comparison to a known location is not predictive evidence unless parameter selection and timestamps exclude post-outcome leakage.
- A bounded model result is not a statement that all points in the envelope are equally likely.
- Field use is not proof of causal contribution to the final recovery.
- Reviewer findings should distinguish implementation defects, missing evidence, uncertain assumptions, and valid-but-low-fidelity approximations.

## Safety and scope

This package is for retrospective technical review. It is not certified flight-simulation, navigation, accident-investigation, or emergency-response software.
