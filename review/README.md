# N80FP Independent Technical Review Package

## Review request

This package requests an adversarial technical review of the N80FP search-modeling workflow and its published software artifacts.

The requested output is a list of:

- mathematical, unit, sign, and convention errors;
- unsupported assumptions;
- code-to-documentation mismatches;
- post-outcome information leakage;
- omitted variables and uncertainty sources;
- conclusions that exceed the available evidence;
- records required for independent reproduction.

Agreement with the project narrative is not an objective.

## Package contents

- `index.html` — browser review entry point.
- `claims.json` — machine-readable claim-to-evidence matrix.
- `parameters.json` — parameter, unit, status, source, and qualification ledger.
- `model/trajectory_model.py` — deterministic low-order reference model.
- `model/config.template.json` — fail-closed configuration template.
- `model/test_trajectory_model.py` — standard-library unit tests.
- `../source/search-simulation/README.md` — recovered application equations and fixed-wing derivation stack.
- `../source/search-simulation/` — recovered search-interface source.
- `../source/tracker/` — recovered live boat-tracker source.

## Technical boundary

### Recovered application

The recovered React and Three.js source directly establishes:

- stored LKP, modeled-POI, and debris-reference coordinates;
- the local scene projection;
- the displayed search ellipse;
- live browser geolocation;
- vessel movement and search-path recording;
- timestamped Clear, Debris, and Crash markers;
- the aircraft visualization.

The recovered `Plane.tsx` component performs a 12-second linear interpolation from the LKP display point to the scene origin and applies a sinusoidal display bank. It is not the complete flight-dynamics solver.

### Independent reference model

`model/trajectory_model.py` separately implements the documented coordinated-turn descent equations for review. It includes:

- meteorological wind-direction conversion;
- heading and signed-bank conventions;
- local tangent-plane coordinate output;
- numerical propagation to the water-contact gate;
- a closed-form constant-state cross-check;
- load-factor and optional accelerated-stall validation;
- JSON and CSV output;
- Cartesian parameter sweeps.

The reference model assumes constant airspeed, bank, flight-path angle, and wind over a short terminal interval. It is not a high-fidelity accident reconstruction. It does not model changing controls, structural breakup, post-stall aerodynamics, water-entry physics, or measurement uncertainty internally.

## Claim status

The complete structured matrix is in `claims.json`.

| ID | Claim | Status | Limitation |
|---|---|---|---|
| C-001 | Modeled POI stored at `30.1038, -90.0309` | Direct | Does not establish when it was generated or entered |
| C-002 | LKP stored at `30.1100, -90.0300` with an approximately `908 ft` label | Direct | Datum and rounding are not established |
| C-003 | Debris reference stored at `30.1103, -90.0254` | Direct | Does not independently validate the report |
| C-004 | Search application includes projection, ellipse, GPS, path, and markers | Direct | Projection is a display transform, not full geodesy |
| C-005 | Aircraft display is a 12-second linear interpolation | Direct | Not the complete trajectory solver |
| C-006 | Boat tracker records geolocation, movement, markers, and CSV | Direct | Not certified navigation software |
| C-007 | Applications were used during the field operation | Corroborated | No complete contemporaneous software-use log |
| C-008 | Tracker was distributed to other boats | Testimony | No public boat-by-boat access log |
| C-009 | Fixed-wing derivation is independently implementable | Derived | Current reference model is low order and constant state |
| C-010 | Approximately 15-meter prediction-to-recovery distance | Not established | Required timestamped prediction and authoritative recovery coordinate are absent |
| C-011 | Software independently caused the recovery | Not established | Not claimed; recovery was multi-team |

## Parameter state

The complete ledger is in `parameters.json`.

### Present in recovered source

- LKP: `30.1100, -90.0300`
- altitude label: approximately `908 ft`
- modeled POI: `30.1038, -90.0309`
- debris reference: `30.1103, -90.0254`

The `908 ft` value remains provisional for propagation until its datum and relationship to height above water are established.

### Core values required to run the reference model

- airspeed;
- heading in degrees true;
- signed bank angle;
- either flight-path angle or vertical speed;
- wind speed and wind-from direction;
- positive height above water;
- integration interval and maximum time.

The template contains deliberate `null` values for unsourced core inputs. The model exits with a configuration error instead of assigning defaults.

### Optional controlled-flight gate

Wings-level stall speed is optional in the code because the historical configuration is unresolved. When supplied, the model calculates load factor and bank-adjusted stall speed and rejects a sub-stall coordinated-turn branch unless `policy.allow_stalled_branch` is explicitly enabled. When omitted, propagation may run, but the result does not establish controlled-flight validity against an accelerated-stall gate.

### Comparison target

The configured modeled POI is stored as a comparison target. It is not consumed by the propagation equations and must not be used to select or tune the input parameters.

## Equation-to-code map

| Technical item | Recovered application | Reference model |
|---|---|---|
| Stored coordinates | `constants.ts` | configuration only |
| Scene projection | `constants.ts` | metric tangent-plane inverse output |
| Search ellipse | `SceneMarkers.tsx` | not used as a solver boundary by default |
| GPS and markers | `App.tsx`, vehicle and HUD components | outside solver scope |
| Aircraft animation | `Plane.tsx` | explicitly not treated as dynamics |
| Wind components | absent from animation | `wind_components_mps()` |
| Coordinated-turn rate | documented derivation | numerical and closed-form implementations |
| Descent propagation | documented derivation | `propagate()` |
| Accelerated-stall gate | documented derivation | applied only when stall speed is supplied |
| Water contact | documented derivation | interpolated final numerical step |
| Parameter sweep | historical sweep incomplete | CSV Cartesian sweep |

## Reproducibility procedure

The model uses Python 3 and the standard library only.

1. Copy the configuration:

   ```bash
   cp review/model/config.template.json review/model/config.local.json
   ```

2. Populate all core required values. Record the source and uncertainty for each value in `parameters.json` or a separate review note.

3. Supply `stall_speed_wings_level_kt` when evaluating whether a coordinated-turn candidate remains above its bank-adjusted stall speed.

4. Run one candidate:

   ```bash
   python review/model/trajectory_model.py \
     review/model/config.local.json \
     --output-dir review/model/output
   ```

5. For a sweep, add only the parameters being varied under the `sweep` object, each with a non-empty array. Example:

   ```json
   {
     "sweep": {
       "bank_deg": [-20, -30, -40],
       "airspeed_kt": [70, 80, 90]
     }
   }
   ```

   Then run:

   ```bash
   python review/model/trajectory_model.py \
     review/model/config.local.json \
     --sweep \
     --output-dir review/model/sweep-output
   ```

6. Run tests:

   ```bash
   cd review/model
   python -m unittest -v
   ```

Single-run outputs are `summary.json` and `track.csv`. Sweep output is `impact_points.csv`.

The single-run summary reports the difference between the numerical integration and the closed-form constant-state solution. A large difference indicates an integration-step or implementation problem.

## Priority reviewer questions

1. Can the modeled point be regenerated from records that predate recovery without reading the stored modeled point?
2. Which terminal-state values are measured, inferred, assumed, or selected after viewing the outcome?
3. Is `908 ft` AGL, MSL, pressure altitude, or a rounded display value?
4. Is the available speed airspeed or ADS-B groundspeed?
5. Is the available direction aircraft heading or ground track?
6. Are heading, turn direction, and bank signs consistent throughout?
7. Is meteorological wind direction converted correctly to east and north components?
8. Is the local tangent-plane approximation adequate over the modeled region?
9. Is the coordinated-turn model valid near accelerated stall or loss of control?
10. Should controlled-flight and loss-of-control branches be modeled separately?
11. Which parameters require time-varying or probabilistic treatment?
12. Which rejection gates are physically justified, and which encode the expected answer?
13. Was the displayed search ellipse generated from surviving trajectories or selected manually?
14. Does deleting the comparison target change any propagation result?
15. Can a clean checkout reproduce results without private threads or API credentials?
16. Which missing artifact would most improve confidence: raw ADS-B rows, timestamped prediction logs, weather records, or authoritative recovery coordinates?

## Interpretation rules

- A stored coordinate does not establish when it was generated.
- A visualization does not prove that every documented equation executed inside the visual component.
- A close comparison to a known location is not predictive evidence unless timestamps and parameter provenance exclude post-outcome leakage.
- A bounded envelope does not imply that all surviving points are equally likely.
- Field use does not prove causal contribution to the final recovery.
- Findings should distinguish implementation defects, missing evidence, uncertain assumptions, and valid low-fidelity approximations.

## Safety and scope

This package is for retrospective technical review. It is not certified flight-simulation, navigation, accident-investigation, or emergency-response software.
