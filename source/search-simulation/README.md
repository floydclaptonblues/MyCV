# N80FP Search Simulation — Recovered Source

This folder preserves the recovered source for the specialized N80FP search-sector interface shown in the case-study screenshots.

## Operational role

Ryan used this application after arriving at the Lake Pontchartrain search area to refine the working aircraft model and translate the analysis into a field-usable interface. Development was iterative, moving between ChatGPT-assisted reasoning and Google Gemini / AI Studio implementation while the search operation was active.

The application should be understood as an **in-field modeling and coordination tool**. It preserves the working modeled point, visualizes the search geometry, incorporates live device position, and supports a consistent marker workflow for crews on the water.

## Documentation boundary

The recovered source contains two related layers that should not be conflated:

1. **The executable visualization layer** implements the coordinate constants, local 3D projection, search ellipse, GPS position, path history, field markers, and an animated aircraft path.
2. **The trajectory-constraint layer** is the fixed-wing kinematic and aerodynamic reasoning used upstream to generate or test candidate paths before the working point and search geometry were entered into the field interface.

The recovered `Plane.tsx` animation is a visualization of the terminal movement. It linearly interpolates from the last-known-position marker to the scene origin over 12 seconds and applies a small sinusoidal bank animation. It is not, by itself, a full six-degree-of-freedom flight-dynamics solver. The equations below therefore separate what the recovered build executes directly from the broader derivation stack used to constrain the aircraft's physically possible motion.

## Configured operational state

The recovered source explicitly stores:

- last-known-position marker: `30.1100, -90.0300`
- displayed last-known altitude: `908 ft`
- modeled point of impact: `30.1038, -90.0309`
- Cajun Navy slick/debris reference: `30.1103, -90.0254`
- scene scale: `S = 75,000` scene units per degree
- approximate search ellipse: `0.9 NM × 0.5 NM`

The scene origin is the midpoint of the modeled point and the debris reference:

$$
\phi_0=\frac{30.1038+30.1103}{2}=30.10705
$$

$$
\lambda_0=\frac{-90.0309+(-90.0254)}{2}=-90.02815
$$

where $\phi$ is latitude and $\lambda$ is longitude.

# Equations executed by the recovered application

## 1. Local latitude/longitude to Three.js coordinates

The recovered `constants.ts` uses a local linear projection:

$$
x=S(\lambda-\lambda_0)
$$

$$
z=S(\phi-\phi_0)
$$

$$
y=\frac{h_{ft}}{10}
$$

with $S=75{,}000$. The inverse mapping is:

$$
\lambda=\lambda_0+\frac{x}{S}
$$

$$
\phi=\phi_0+\frac{z}{S}
$$

This projection is intentionally local and display-oriented. It is adequate for the small Lake Pontchartrain sector represented by the interface, but it is not a full WGS-84 geodesic transform.

## 2. Search ellipse

The displayed search boundary is generated parametrically:

$$
\phi(\theta)=\phi_0+a_{\phi}\sin\theta
$$

$$
\lambda(\theta)=\lambda_0+b_{\lambda}\cos\theta
$$

for $0\leq\theta\leq2\pi$, with:

$$
a_{\phi}=0.0075^\circ,\qquad b_{\lambda}=0.0050^\circ
$$

At approximately $30.1^\circ$ north latitude, those angular semi-axes correspond to a displayed full envelope of roughly $0.9$ nautical miles north-south by $0.5$ nautical miles east-west.

## 3. Aircraft animation in the recovered build

Let $\mathbf r_s$ be the 3D start vector at the LKP, $\mathbf r_e$ the scene-origin endpoint, and $T=12$ seconds. The recovered animation uses:

$$
\alpha(t)=\frac{t}{T},\qquad 0\leq t\leq T
$$

$$
\mathbf r(t)=(1-\alpha)\mathbf r_s+\alpha\mathbf r_e
$$

The displayed bank motion is cosmetic:

$$
\varphi_{display}(t)=0.2\sin(2t)
$$

After the 12-second movement, the aircraft is hidden for a four-second reset interval before the loop repeats.

## 4. Boat movement and heading

In manual mode, with scene speed $v_s$, time step $\Delta t$, heading $\psi$, forward command $f$, and lateral command $q$:

$$
\Delta x=v_s\Delta t\left(f\sin\psi+q\cos\psi\right)
$$

$$
\Delta z=v_s\Delta t\left(f\cos\psi-q\sin\psi\right)
$$

GPS mode converts the device position to the same local scene and interpolates the displayed boat toward the latest fix to reduce visible jitter.

# Fixed-wing trajectory derivation stack

The following stack describes the physical constraint model used to convert a final aircraft state into a bounded impact envelope. These are the equations that should govern a fixed-wing terminal-path solver; they are documented here separately from the simplified React animation above.

## 1. Geodetic coordinates to a local tangent plane

For a physically scaled local east/north frame, using Earth radius $R_E$, radians, and reference latitude $\phi_0$:

$$
E\approx R_E\cos\phi_0\,(\lambda-\lambda_0)
$$

$$
N\approx R_E(\phi-\phi_0)
$$

The inverse update is:

$$
\phi\approx\phi_0+\frac{N}{R_E}
$$

$$
\lambda\approx\lambda_0+\frac{E}{R_E\cos\phi_0}
$$

This is the metric form of the local projection represented visually by `latLonToVector3`.

## 2. Aircraft state vector

A terminal candidate can be represented as:

$$
\mathbf s(t)=\begin{bmatrix}E&N&h&V_a&\psi&\gamma&\varphi\end{bmatrix}^{T}
$$

where:

- $E,N$ are local east and north displacement;
- $h$ is height above the impact surface;
- $V_a$ is airspeed;
- $\psi$ is heading or ground-track angle after wind correction;
- $\gamma$ is flight-path angle;
- $\varphi$ is bank angle.

## 3. Wind-corrected ground velocity

Let the horizontal wind vector be $\mathbf V_w=(u_E,u_N)$. The horizontal ground-velocity vector is:

$$
\mathbf V_g=
\begin{bmatrix}
V_a\cos\gamma\sin\psi\\
V_a\cos\gamma\cos\psi
\end{bmatrix}
+
\begin{bmatrix}
u_E\\u_N
\end{bmatrix}
$$

Therefore:

$$
\dot E=V_a\cos\gamma\sin\psi+u_E
$$

$$
\dot N=V_a\cos\gamma\cos\psi+u_N
$$

$$
\dot h=V_a\sin\gamma
$$

For descent, $\gamma<0$ and therefore $\dot h<0$.

## 4. Coordinated-turn geometry

For a coordinated banked turn, horizontal force balance gives:

$$
L\cos\varphi=mg
$$

The horizontal lift component supplies centripetal acceleration:

$$
L\sin\varphi=m\frac{V_a^2}{R}
$$

Dividing the equations yields:

$$
\tan\varphi=\frac{V_a^2}{gR}
$$

so the turn radius is:

$$
R=\frac{V_a^2}{g\tan\varphi}
$$

and the turn rate is:

$$
\omega=\dot\psi=\frac{g\tan\varphi}{V_a}
$$

These equations bound how sharply a fixed-wing aircraft can curve at a given speed and bank angle.

## 5. Load factor and banked stall constraint

From the vertical-force equation:

$$
n=\frac{L}{mg}=\frac{1}{\cos\varphi}
$$

Because stall speed increases with the square root of load factor:

$$
V_{S,\varphi}=V_{S,0}\sqrt n
$$

therefore:

$$
V_{S,\varphi}=\frac{V_{S,0}}{\sqrt{\cos\varphi}}
$$

A candidate state is rejected when:

$$
V_a<V_{S,\varphi}
$$

unless the modeled regime explicitly allows an accelerated stall or loss of controlled flight. This gate prevents the trajectory generator from accepting turns that a Cessna-class fixed-wing aircraft could not sustain aerodynamically.

## 6. Time-stepped spiral propagation

For a small time step $\Delta t$:

$$
\psi_{k+1}=\psi_k+\frac{g\tan\varphi_k}{V_{a,k}}\Delta t
$$

$$
E_{k+1}=E_k+\left(V_{a,k}\cos\gamma_k\sin\psi_k+u_{E,k}\right)\Delta t
$$

$$
N_{k+1}=N_k+\left(V_{a,k}\cos\gamma_k\cos\psi_k+u_{N,k}\right)\Delta t
$$

$$
h_{k+1}=h_k+V_{a,k}\sin\gamma_k\Delta t
$$

Propagation stops at the impact gate:

$$
h_{k+1}\leq0
$$

The resulting $(E,N)$ position is transformed back into latitude and longitude.

## 7. Closed-form constant-state spiral

When $V_a$, $\gamma$, $\varphi$, and wind are treated as constant over the short terminal interval, define:

$$
\omega=\frac{g\tan\varphi}{V_a}
$$

Then:

$$
\psi(t)=\psi_0+\omega t
$$

$$
E(t)=E_0+\frac{V_a\cos\gamma}{\omega}\left[\cos\psi_0-\cos(\psi_0+\omega t)\right]+u_Et
$$

$$
N(t)=N_0+\frac{V_a\cos\gamma}{\omega}\left[\sin(\psi_0+\omega t)-\sin\psi_0\right]+u_Nt
$$

$$
h(t)=h_0+V_a\sin\gamma\,t
$$

For constant descent, the water-contact time is:

$$
t_{impact}=-\frac{h_0}{V_a\sin\gamma}
$$

provided $\gamma<0$.

The straight-flight limit is obtained as $\varphi\rightarrow0$ and $\omega\rightarrow0$:

$$
E(t)=E_0+V_a\cos\gamma\sin\psi_0\,t+u_Et
$$

$$
N(t)=N_0+V_a\cos\gamma\cos\psi_0\,t+u_Nt
$$

## 8. Glide-reach upper bound

For a powerless but controlled glide in still air, a first-order horizontal-reach bound is:

$$
D_{glide}\approx h_0\left(\frac{L}{D}\right)
$$

This is an outer reach bound, not a spiral-dive prediction. A steep descending turn, rising load factor, accelerated stall, structural breakup, or water impact before recovery produces a substantially smaller terminal footprint.

## 9. Candidate-envelope construction

The model does not need to assume one exact bank, speed, descent angle, or wind vector. It can propagate a bounded family:

$$
\mathcal P=\left\{\mathbf s_0,V_a,\gamma,\varphi,\mathbf V_w:\text{all values within accepted evidence bounds}\right\}
$$

Each candidate is propagated to $h\leq0$. Candidates are discarded if they violate the fixed-wing gates, leave the geographic mask, contradict known debris or search evidence, or require discontinuous changes in speed, heading, or bank.

The surviving impact points form the operational search envelope:

$$
\mathcal I=\left\{(\phi_i,\lambda_i):\mathbf p_i\text{ survives all constraints and reaches }h\leq0\right\}
$$

The displayed modeled POI and search ellipse are the field-interface representation of that constrained candidate set.

## What the recovered source establishes

The repository directly establishes that:

- the modeled point is stored as `30.1038, -90.0309`;
- the LKP, altitude label, debris reference, scene origin, search ellipse, and marker taxonomy are encoded in source;
- the application renders live GPS, a movable boat, path tracking, and timestamped `clear`, `debris`, and `crash` markers;
- the recovered aircraft component visualizes a terminal path from the LKP altitude into the search scene;
- the broader fixed-wing derivation stack can be reproduced independently from the documented equations and the original state-vector inputs.

The source archive does not contain the complete upstream ADS-B table, every parameter sweep, or every conversation used before field deployment. Those provenance materials belong to the wider investigation record rather than this single application export.

## Security sanitation

The uploaded archive contained a non-empty `.env.local`. That file was excluded. The recovered application does not make a Gemini API call at runtime, so no API credential is required by the published source.

## Original AI Studio project

The recovered export identifies the AI Studio app as:

`https://ai.studio/apps/c80910d7-e780-4191-832b-39b3cf91e446`

## Safety scope

This repository is an evidentiary and portfolio archive. It is not certified flight-simulation, navigation, accident-investigation, or emergency-response software.