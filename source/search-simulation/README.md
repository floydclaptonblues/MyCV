# N80FP Search Simulation — Recovered Source

This folder preserves the sanitized source for the specialized N80FP search-sector interface used during the Lake Pontchartrain field operation.

## Operational role

Ryan used the application after arriving at the search area to refine the working aircraft model and translate it into a field-usable interface. Development moved iteratively between ChatGPT-assisted reasoning and Google Gemini / AI Studio implementation while the search was active.

The application preserved the modeled point, last-known-position reference, reported debris reference, search geometry, live device position, vessel track, and a common `clear`, `debris`, and `crash` marker vocabulary.

## Important distinction: solver versus visualization

The recovered project contains an executable **visualization and coordination layer**. It directly implements:

- configured geographic points;
- a local latitude/longitude-to-Three.js projection;
- a parametric search ellipse;
- live browser geolocation;
- vessel movement and path history;
- timestamped field markers;
- an animated aircraft path.

The recovered `Plane.tsx` component is not a complete flight-dynamics solver. It linearly interpolates an aircraft model from the LKP altitude to the scene origin over 12 seconds and adds a small sinusoidal display bank. The fixed-wing equations later in this README document the physical derivation stack used to constrain candidate trajectories; they are not all numerically integrated by that React component.

This separation is deliberate: it makes the repository auditable without pretending that the visual animation alone contains every upstream calculation.

## Configured operational state

The recovered source stores:

- **LKP:** `30.1100, -90.0300`
- **LKP altitude label:** `908 ft`
- **Modeled POI:** `30.1038, -90.0309`
- **Slick/debris reference:** `30.1103, -90.0254`
- **Scene scale:** `S = 75,000` scene units per degree
- **Displayed search envelope:** approximately `0.9 NM × 0.5 NM`

The scene origin is the midpoint of the modeled POI and debris reference:

$$
\phi_0=\frac{30.1038+30.1103}{2}=30.10705
$$

$$
\lambda_0=\frac{-90.0309+(-90.0254)}{2}=-90.02815
$$

where $\phi$ is latitude and $\lambda$ is longitude.

# Equations directly implemented by the recovered app

## 1. Local scene projection

`constants.ts` maps latitude and longitude to the Three.js X/Z plane using:

$$
x=S(\lambda-\lambda_0)
$$

$$
z=S(\phi-\phi_0)
$$

Altitude is displayed with ten feet per scene unit:

$$
y=\frac{h_{ft}}{10}
$$

The inverse mapping is:

$$
\lambda=\lambda_0+\frac{x}{S}
$$

$$
\phi=\phi_0+\frac{z}{S}
$$

This is a local display projection, not a full WGS-84 geodesic transformation.

## 2. Search ellipse

`SceneMarkers.tsx` generates the search boundary parametrically:

$$
\phi(\theta)=\phi_0+a_{\phi}\sin\theta
$$

$$
\lambda(\theta)=\lambda_0+b_{\lambda}\cos\theta
$$

for $0\leq\theta\leq2\pi$, with:

$$
a_{\phi}=0.0075^\circ,
\qquad
b_{\lambda}=0.0050^\circ
$$

Near $30.1^\circ$ north latitude, these angular semi-axes produce a displayed full envelope of roughly $0.9$ nautical miles north-south by $0.5$ nautical miles east-west.

## 3. Aircraft animation

Let $\mathbf r_s$ be the LKP start vector, $\mathbf r_e$ the scene-origin endpoint, and $T=12$ seconds.

$$
\alpha(t)=\frac{t}{T},
\qquad
0\leq t\leq T
$$

$$
\mathbf r(t)=(1-\alpha)\mathbf r_s+\alpha\mathbf r_e
$$

The visual bank is:

$$
\varphi_{display}(t)=0.2\sin(2t)
$$

The aircraft is hidden for four seconds after each 12-second pass before the loop resets.

## 4. Manual boat movement

With scene speed $v_s$, frame interval $\Delta t$, heading $\psi$, forward command $f$, and lateral command $q$:

$$
\Delta x=v_s\Delta t\left(f\sin\psi+q\cos\psi\right)
$$

$$
\Delta z=v_s\Delta t\left(f\cos\psi-q\sin\psi\right)
$$

GPS mode maps the latest device fix into the same local scene and interpolates the boat toward it to reduce visible jitter.

# Fixed-wing trajectory derivation stack

This section documents the physical constraint model for converting a final aircraft state into a bounded impact envelope.

## 1. Metric local tangent plane

For a small geographic region, with Earth radius $R_E$, reference latitude $\phi_0$, and all angles in radians:

$$
E\approx R_E\cos\phi_0\,(\lambda-\lambda_0)
$$

$$
N\approx R_E(\phi-\phi_0)
$$

The inverse transformation is:

$$
\phi\approx\phi_0+\frac{N}{R_E}
$$

$$
\lambda\approx\lambda_0+\frac{E}{R_E\cos\phi_0}
$$

This is the physically scaled version of the app's local scene projection.

## 2. Terminal state vector

A candidate state is:

$$
\mathbf s(t)=
\begin{bmatrix}
E & N & h & V_a & \psi & \gamma & \varphi
\end{bmatrix}^{T}
$$

where:

- $E,N$ are local east and north displacement;
- $h$ is height above the water surface;
- $V_a$ is airspeed;
- $\psi$ is heading;
- $\gamma$ is flight-path angle;
- $\varphi$ is bank angle.

## 3. Wind-corrected motion

Let the horizontal wind vector be:

$$
\mathbf V_w=
\begin{bmatrix}
u_E\\
u_N
\end{bmatrix}
$$

The horizontal ground velocity is:

$$
\mathbf V_g=
\begin{bmatrix}
V_a\cos\gamma\sin\psi\\
V_a\cos\gamma\cos\psi
\end{bmatrix}
+
\begin{bmatrix}
u_E\\
u_N
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

For a descent, $\gamma<0$ and $\dot h<0$.

## 4. Coordinated-turn radius and turn rate

Vertical force balance in a coordinated bank gives:

$$
L\cos\varphi=mg
$$

The horizontal lift component supplies centripetal acceleration:

$$
L\sin\varphi=m\frac{V_a^2}{R}
$$

Dividing the two equations:

$$
\tan\varphi=\frac{V_a^2}{gR}
$$

Therefore:

$$
R=\frac{V_a^2}{g\tan\varphi}
$$

and:

$$
\omega=\dot\psi=\frac{g\tan\varphi}{V_a}
$$

These equations bound how sharply a fixed-wing aircraft can turn at a given speed and bank angle.

## 5. Load factor and accelerated-stall gate

The banked load factor is:

$$
n=\frac{L}{mg}=\frac{1}{\cos\varphi}
$$

Stall speed rises with the square root of load factor:

$$
V_{S,\varphi}=V_{S,0}\sqrt n
$$

so:

$$
V_{S,\varphi}=\frac{V_{S,0}}{\sqrt{\cos\varphi}}
$$

A controlled-flight candidate cannot remain valid below this bank-adjusted stall speed. A separate loss-of-control branch may continue beyond the gate, but it must be labeled as stalled or uncontrolled rather than treated as a sustainable coordinated turn.

## 6. Time-stepped spiral propagation

For time step $\Delta t$:

$$
\psi_{k+1}=\psi_k+
\frac{g\tan\varphi_k}{V_{a,k}}\Delta t
$$

$$
E_{k+1}=E_k+
\left(V_{a,k}\cos\gamma_k\sin\psi_k+u_{E,k}\right)\Delta t
$$

$$
N_{k+1}=N_k+
\left(V_{a,k}\cos\gamma_k\cos\psi_k+u_{N,k}\right)\Delta t
$$

$$
h_{k+1}=h_k+V_{a,k}\sin\gamma_k\Delta t
$$

Propagation stops at the water-contact gate:

$$
h_{k+1}\leq0
$$

The final $(E,N)$ point is then transformed back to latitude and longitude.

## 7. Closed-form constant-state spiral

For constant $V_a$, $\gamma$, $\varphi$, and wind over a short terminal interval:

$$
\omega=\frac{g\tan\varphi}{V_a}
$$

$$
\psi(t)=\psi_0+\omega t
$$

$$
E(t)=E_0+
\frac{V_a\cos\gamma}{\omega}
\left[\cos\psi_0-\cos(\psi_0+\omega t)\right]
+u_Et
$$

$$
N(t)=N_0+
\frac{V_a\cos\gamma}{\omega}
\left[\sin(\psi_0+\omega t)-\sin\psi_0\right]
+u_Nt
$$

$$
h(t)=h_0+V_a\sin\gamma\,t
$$

For $\gamma<0$, the constant-state impact time is:

$$
t_{impact}=-\frac{h_0}{V_a\sin\gamma}
$$

The straight-flight limit as $\varphi\rightarrow0$ is:

$$
E(t)=E_0+V_a\cos\gamma\sin\psi_0\,t+u_Et
$$

$$
N(t)=N_0+V_a\cos\gamma\cos\psi_0\,t+u_Nt
$$

## 8. Glide-reach outer bound

For a powerless but controlled glide in still air:

$$
D_{glide}\approx h_0\left(\frac{L}{D}\right)
$$

This is an outer reach bound, not a spiral-dive prediction. A steep descending turn, increasing load factor, accelerated stall, loss of control, structural breakup, or water contact before recovery yields a smaller terminal footprint.

## 9. Candidate envelope

Rather than selecting one exact speed, bank, descent angle, or wind value, the solver propagates a bounded family:

$$
\mathcal P=
\left\{
\mathbf s_0,V_a,\gamma,\varphi,\mathbf V_w:
\text{values within accepted evidence bounds}
\right\}
$$

Each candidate is propagated until $h\leq0$. A candidate is rejected when it violates the fixed-wing gates, leaves the geographic mask, contradicts the known evidence, or requires discontinuous changes in speed, heading, bank, or descent state.

The surviving impact points define:

$$
\mathcal I=
\left\{
(\phi_i,\lambda_i):
\mathbf p_i\text{ survives the constraints and reaches }h\leq0
\right\}
$$

The modeled POI and displayed ellipse are the field-interface representation of that constrained candidate set.

## Source files

- `constants.ts` — configured coordinates, scene origin, projection, and inverse projection.
- `App.tsx` — GPS state, search path, marker creation, and scene assembly.
- `components/Vehicles/Plane.tsx` — recovered aircraft visualization.
- `components/Vehicles/Boat.tsx` — manual and GPS vessel movement.
- `components/World/SceneMarkers.tsx` — POIs, search ellipse, and marker rendering.
- `components/World/SearchTrail.tsx` — vessel-track rendering.
- `components/World/Water.tsx` — water surface.
- `components/Overlay/HUD.tsx` — GPS display and field controls.
- `types.ts` — geographic, boat, and marker data structures.

## What is directly reproducible

The public source establishes the configured POI, LKP, altitude label, debris reference, local projection, search ellipse, live GPS workflow, vessel track, marker taxonomy, and aircraft visualization.

The archive does not contain the complete upstream ADS-B table, every parameter sweep, or every conversation that preceded field deployment. The fixed-wing derivation stack is included so the physical constraint logic is explicit and independently implementable without falsely attributing the entire solver to the simplified animation component.

## Security sanitation

The original export contained a non-empty `.env.local`; that file was excluded. The recovered application does not make a Gemini API call at runtime, so no public API credential is required.

## Original AI Studio project

`https://ai.studio/apps/c80910d7-e780-4191-832b-39b3cf91e446`

## Safety scope

This repository is an evidentiary and portfolio archive. It is not certified flight-simulation, navigation, accident-investigation, or emergency-response software.