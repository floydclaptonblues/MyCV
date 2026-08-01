#!/usr/bin/env python3
"""Deterministic reference model for independent review of the N80FP workflow.

This is a low-order coordinated-turn descent model. It is intentionally separate
from the recovered Three.js visualization. It uses only Python's standard library,
validates provenance-sensitive inputs, and writes reproducible CSV/JSON outputs.
"""

from __future__ import annotations

import argparse
import csv
import itertools
import json
import math
import sys
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Any, Iterable

EARTH_RADIUS_M = 6_371_008.8
GRAVITY_MPS2 = 9.80665
KNOT_TO_MPS = 0.5144444444444445
FT_TO_M = 0.3048
FPM_TO_MPS = FT_TO_M / 60.0


class ConfigurationError(ValueError):
    """Raised when a configuration is incomplete or internally inconsistent."""


@dataclass(frozen=True)
class State:
    time_s: float
    east_m: float
    north_m: float
    altitude_m: float
    airspeed_mps: float
    heading_rad: float
    flight_path_rad: float
    bank_rad: float


@dataclass(frozen=True)
class Result:
    status: str
    reason: str
    impact_lat_deg: float | None
    impact_lon_deg: float | None
    impact_time_s: float | None
    numerical_east_m: float | None
    numerical_north_m: float | None
    closed_form_east_m: float | None
    closed_form_north_m: float | None
    numerical_closed_form_difference_m: float | None
    bank_adjusted_stall_kt: float | None
    load_factor: float | None
    steps: int


def load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, dict):
        raise ConfigurationError("Top-level JSON value must be an object.")
    return data


def require_number(mapping: dict[str, Any], key: str, context: str) -> float:
    value = mapping.get(key)
    if value is None:
        raise ConfigurationError(f"Missing required value: {context}.{key}")
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ConfigurationError(f"{context}.{key} must be numeric, not {type(value).__name__}.")
    if not math.isfinite(float(value)):
        raise ConfigurationError(f"{context}.{key} must be finite.")
    return float(value)


def normalize_heading_rad(degrees: float) -> float:
    return math.radians(degrees % 360.0)


def wind_components_mps(speed_kt: float, from_deg_true: float) -> tuple[float, float]:
    """Return east/north components using meteorological 'from' convention."""
    speed = speed_kt * KNOT_TO_MPS
    theta = math.radians(from_deg_true % 360.0)
    return -speed * math.sin(theta), -speed * math.cos(theta)


def local_to_geodetic(
    east_m: float,
    north_m: float,
    reference_lat_deg: float,
    reference_lon_deg: float,
) -> tuple[float, float]:
    ref_lat_rad = math.radians(reference_lat_deg)
    lat = reference_lat_deg + math.degrees(north_m / EARTH_RADIUS_M)
    cos_lat = math.cos(ref_lat_rad)
    if abs(cos_lat) < 1e-12:
        raise ConfigurationError("Reference latitude is too close to a pole for the local tangent approximation.")
    lon = reference_lon_deg + math.degrees(east_m / (EARTH_RADIUS_M * cos_lat))
    return lat, lon


def geodetic_distance_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Haversine distance for result comparison, not path propagation."""
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = phi2 - phi1
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * EARTH_RADIUS_M * math.asin(min(1.0, math.sqrt(a)))


def derive_flight_path_rad(initial: dict[str, Any], airspeed_mps: float) -> float:
    gamma_deg = initial.get("flight_path_angle_deg")
    vertical_fpm = initial.get("vertical_speed_fpm")
    supplied = int(gamma_deg is not None) + int(vertical_fpm is not None)
    if supplied != 1:
        raise ConfigurationError(
            "Supply exactly one of initial.flight_path_angle_deg or initial.vertical_speed_fpm."
        )
    if gamma_deg is not None:
        if isinstance(gamma_deg, bool) or not isinstance(gamma_deg, (int, float)):
            raise ConfigurationError("initial.flight_path_angle_deg must be numeric.")
        gamma = math.radians(float(gamma_deg))
    else:
        if isinstance(vertical_fpm, bool) or not isinstance(vertical_fpm, (int, float)):
            raise ConfigurationError("initial.vertical_speed_fpm must be numeric.")
        vertical_mps = float(vertical_fpm) * FPM_TO_MPS
        ratio = vertical_mps / airspeed_mps
        if abs(ratio) > 1.0:
            raise ConfigurationError(
                "The supplied vertical speed magnitude exceeds airspeed; no real flight-path angle exists."
            )
        gamma = math.asin(ratio)
    if gamma >= 0:
        raise ConfigurationError("The reference impact model requires a descending state (flight-path angle < 0).")
    return gamma


def validate_and_build(config: dict[str, Any]) -> tuple[State, dict[str, float], dict[str, Any]]:
    initial = config.get("initial")
    environment = config.get("environment")
    integration = config.get("integration")
    if not isinstance(initial, dict):
        raise ConfigurationError("Missing object: initial")
    if not isinstance(environment, dict):
        raise ConfigurationError("Missing object: environment")
    if not isinstance(integration, dict):
        raise ConfigurationError("Missing object: integration")

    lat = require_number(initial, "lat_deg", "initial")
    lon = require_number(initial, "lon_deg", "initial")
    altitude_ft = require_number(initial, "altitude_ft_above_water", "initial")
    airspeed_kt = require_number(initial, "airspeed_kt", "initial")
    heading_deg = require_number(initial, "heading_deg_true", "initial")
    bank_deg = require_number(initial, "bank_deg", "initial")

    if not -90 <= lat <= 90:
        raise ConfigurationError("initial.lat_deg must be between -90 and 90.")
    if not -180 <= lon <= 180:
        raise ConfigurationError("initial.lon_deg must be between -180 and 180.")
    if altitude_ft <= 0:
        raise ConfigurationError("initial.altitude_ft_above_water must be positive.")
    if airspeed_kt <= 0:
        raise ConfigurationError("initial.airspeed_kt must be positive.")
    if abs(bank_deg) >= 89:
        raise ConfigurationError("initial.bank_deg must have magnitude below 89 degrees.")

    airspeed_mps = airspeed_kt * KNOT_TO_MPS
    gamma = derive_flight_path_rad(initial, airspeed_mps)
    bank = math.radians(bank_deg)

    wind_speed_kt = require_number(environment, "wind_speed_kt", "environment")
    wind_from_deg = require_number(environment, "wind_from_deg_true", "environment")
    if wind_speed_kt < 0:
        raise ConfigurationError("environment.wind_speed_kt cannot be negative.")
    wind_east_mps, wind_north_mps = wind_components_mps(wind_speed_kt, wind_from_deg)

    dt_s = require_number(integration, "dt_s", "integration")
    max_time_s = require_number(integration, "max_time_s", "integration")
    if not 0 < dt_s <= 5:
        raise ConfigurationError("integration.dt_s must be greater than 0 and no more than 5 seconds.")
    if max_time_s <= 0:
        raise ConfigurationError("integration.max_time_s must be positive.")

    load_factor = 1.0 / math.cos(bank)
    stall_kt = initial.get("stall_speed_wings_level_kt")
    adjusted_stall_kt: float | None = None
    if stall_kt is not None:
        if isinstance(stall_kt, bool) or not isinstance(stall_kt, (int, float)) or float(stall_kt) <= 0:
            raise ConfigurationError("initial.stall_speed_wings_level_kt must be a positive number or null.")
        adjusted_stall_kt = float(stall_kt) * math.sqrt(load_factor)
        allow_stalled = bool(config.get("policy", {}).get("allow_stalled_branch", False))
        if airspeed_kt < adjusted_stall_kt and not allow_stalled:
            raise ConfigurationError(
                f"Airspeed {airspeed_kt:.2f} kt is below bank-adjusted stall speed "
                f"{adjusted_stall_kt:.2f} kt. Set policy.allow_stalled_branch=true only to label and inspect that branch."
            )

    state = State(
        time_s=0.0,
        east_m=0.0,
        north_m=0.0,
        altitude_m=altitude_ft * FT_TO_M,
        airspeed_mps=airspeed_mps,
        heading_rad=normalize_heading_rad(heading_deg),
        flight_path_rad=gamma,
        bank_rad=bank,
    )
    derived = {
        "reference_lat_deg": lat,
        "reference_lon_deg": lon,
        "wind_east_mps": wind_east_mps,
        "wind_north_mps": wind_north_mps,
        "dt_s": dt_s,
        "max_time_s": max_time_s,
        "load_factor": load_factor,
        "bank_adjusted_stall_kt": adjusted_stall_kt,
    }
    return state, derived, initial


def closed_form_position(state: State, t_s: float, wind_east_mps: float, wind_north_mps: float) -> tuple[float, float, float]:
    horizontal_speed = state.airspeed_mps * math.cos(state.flight_path_rad)
    omega = GRAVITY_MPS2 * math.tan(state.bank_rad) / state.airspeed_mps
    if abs(omega) < 1e-12:
        east = horizontal_speed * math.sin(state.heading_rad) * t_s + wind_east_mps * t_s
        north = horizontal_speed * math.cos(state.heading_rad) * t_s + wind_north_mps * t_s
    else:
        end_heading = state.heading_rad + omega * t_s
        east = horizontal_speed / omega * (math.cos(state.heading_rad) - math.cos(end_heading)) + wind_east_mps * t_s
        north = horizontal_speed / omega * (math.sin(end_heading) - math.sin(state.heading_rad)) + wind_north_mps * t_s
    altitude = state.altitude_m + state.airspeed_mps * math.sin(state.flight_path_rad) * t_s
    return east, north, altitude


def propagate(config: dict[str, Any], capture_track: bool = True) -> tuple[Result, list[State]]:
    state, derived, _ = validate_and_build(config)
    dt_s = derived["dt_s"]
    max_time_s = derived["max_time_s"]
    wind_east = derived["wind_east_mps"]
    wind_north = derived["wind_north_mps"]
    vertical_mps = state.airspeed_mps * math.sin(state.flight_path_rad)
    impact_time_exact = -state.altitude_m / vertical_mps
    if impact_time_exact > max_time_s:
        result = Result(
            status="rejected",
            reason="Water contact occurs after integration.max_time_s.",
            impact_lat_deg=None,
            impact_lon_deg=None,
            impact_time_s=None,
            numerical_east_m=None,
            numerical_north_m=None,
            closed_form_east_m=None,
            closed_form_north_m=None,
            numerical_closed_form_difference_m=None,
            bank_adjusted_stall_kt=derived["bank_adjusted_stall_kt"],
            load_factor=derived["load_factor"],
            steps=0,
        )
        return result, [state] if capture_track else []

    track = [state] if capture_track else []
    current = state
    steps = 0
    while current.altitude_m > 0 and current.time_s < max_time_s:
        step = min(dt_s, max_time_s - current.time_s)
        horizontal_speed = current.airspeed_mps * math.cos(current.flight_path_rad)
        turn_rate = GRAVITY_MPS2 * math.tan(current.bank_rad) / current.airspeed_mps
        east_rate = horizontal_speed * math.sin(current.heading_rad) + wind_east
        north_rate = horizontal_speed * math.cos(current.heading_rad) + wind_north
        altitude_rate = current.airspeed_mps * math.sin(current.flight_path_rad)

        next_altitude = current.altitude_m + altitude_rate * step
        if next_altitude <= 0:
            fraction = current.altitude_m / (current.altitude_m - next_altitude)
            step *= fraction

        next_state = State(
            time_s=current.time_s + step,
            east_m=current.east_m + east_rate * step,
            north_m=current.north_m + north_rate * step,
            altitude_m=max(0.0, current.altitude_m + altitude_rate * step),
            airspeed_mps=current.airspeed_mps,
            heading_rad=current.heading_rad + turn_rate * step,
            flight_path_rad=current.flight_path_rad,
            bank_rad=current.bank_rad,
        )
        current = next_state
        steps += 1
        if capture_track:
            track.append(current)
        if current.altitude_m <= 0:
            break

    if current.altitude_m > 0:
        result = Result(
            status="rejected",
            reason="Integration ended before water contact.",
            impact_lat_deg=None,
            impact_lon_deg=None,
            impact_time_s=None,
            numerical_east_m=None,
            numerical_north_m=None,
            closed_form_east_m=None,
            closed_form_north_m=None,
            numerical_closed_form_difference_m=None,
            bank_adjusted_stall_kt=derived["bank_adjusted_stall_kt"],
            load_factor=derived["load_factor"],
            steps=steps,
        )
        return result, track

    closed_east, closed_north, _ = closed_form_position(state, impact_time_exact, wind_east, wind_north)
    difference = math.hypot(current.east_m - closed_east, current.north_m - closed_north)
    impact_lat, impact_lon = local_to_geodetic(
        current.east_m,
        current.north_m,
        derived["reference_lat_deg"],
        derived["reference_lon_deg"],
    )
    result = Result(
        status="accepted",
        reason="Water-contact gate reached.",
        impact_lat_deg=impact_lat,
        impact_lon_deg=impact_lon,
        impact_time_s=current.time_s,
        numerical_east_m=current.east_m,
        numerical_north_m=current.north_m,
        closed_form_east_m=closed_east,
        closed_form_north_m=closed_north,
        numerical_closed_form_difference_m=difference,
        bank_adjusted_stall_kt=derived["bank_adjusted_stall_kt"],
        load_factor=derived["load_factor"],
        steps=steps,
    )
    return result, track


def write_track_csv(path: Path, track: Iterable[State], reference_lat: float, reference_lon: float) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow([
            "time_s", "east_m", "north_m", "altitude_m", "latitude_deg", "longitude_deg",
            "airspeed_mps", "heading_deg_true", "flight_path_angle_deg", "bank_deg"
        ])
        for state in track:
            lat, lon = local_to_geodetic(state.east_m, state.north_m, reference_lat, reference_lon)
            writer.writerow([
                f"{state.time_s:.6f}", f"{state.east_m:.6f}", f"{state.north_m:.6f}",
                f"{state.altitude_m:.6f}", f"{lat:.9f}", f"{lon:.9f}",
                f"{state.airspeed_mps:.6f}", f"{math.degrees(state.heading_rad) % 360:.6f}",
                f"{math.degrees(state.flight_path_rad):.6f}", f"{math.degrees(state.bank_rad):.6f}"
            ])


def expand_sweep(config: dict[str, Any]) -> Iterable[tuple[str, dict[str, Any]]]:
    sweep = config.get("sweep")
    if not isinstance(sweep, dict) or not sweep:
        yield "base", config
        return

    supported = {
        "airspeed_kt": ("initial", "airspeed_kt"),
        "heading_deg_true": ("initial", "heading_deg_true"),
        "bank_deg": ("initial", "bank_deg"),
        "flight_path_angle_deg": ("initial", "flight_path_angle_deg"),
        "vertical_speed_fpm": ("initial", "vertical_speed_fpm"),
        "wind_speed_kt": ("environment", "wind_speed_kt"),
        "wind_from_deg_true": ("environment", "wind_from_deg_true"),
    }
    keys: list[str] = []
    values: list[list[Any]] = []
    for key, candidate_values in sweep.items():
        if key not in supported:
            raise ConfigurationError(f"Unsupported sweep parameter: {key}")
        if not isinstance(candidate_values, list) or not candidate_values:
            raise ConfigurationError(f"sweep.{key} must be a non-empty array.")
        keys.append(key)
        values.append(candidate_values)

    for index, combination in enumerate(itertools.product(*values), start=1):
        clone = json.loads(json.dumps(config))
        clone.pop("sweep", None)
        labels = []
        for key, value in zip(keys, combination):
            section, field = supported[key]
            clone[section][field] = value
            if key == "flight_path_angle_deg":
                clone["initial"]["vertical_speed_fpm"] = None
            elif key == "vertical_speed_fpm":
                clone["initial"]["flight_path_angle_deg"] = None
            labels.append(f"{key}={value}")
        yield f"case_{index:04d}__" + "__".join(labels), clone


def run_single(config_path: Path, output_dir: Path) -> int:
    config = load_json(config_path)
    result, track = propagate(config)
    output_dir.mkdir(parents=True, exist_ok=True)
    with (output_dir / "summary.json").open("w", encoding="utf-8") as handle:
        json.dump(asdict(result), handle, indent=2, sort_keys=True)
        handle.write("\n")
    if result.status == "accepted":
        initial = config["initial"]
        write_track_csv(output_dir / "track.csv", track, float(initial["lat_deg"]), float(initial["lon_deg"]))
    print(json.dumps(asdict(result), indent=2, sort_keys=True))
    return 0 if result.status == "accepted" else 3


def run_sweep(config_path: Path, output_dir: Path) -> int:
    config = load_json(config_path)
    output_dir.mkdir(parents=True, exist_ok=True)
    rows: list[dict[str, Any]] = []
    for case_id, case_config in expand_sweep(config):
        try:
            result, _ = propagate(case_config, capture_track=False)
            row = {"case_id": case_id, **asdict(result)}
            comparison = case_config.get("comparison_target")
            if result.status == "accepted" and isinstance(comparison, dict):
                lat = comparison.get("lat_deg")
                lon = comparison.get("lon_deg")
                if isinstance(lat, (int, float)) and isinstance(lon, (int, float)):
                    row["distance_to_comparison_target_m"] = geodetic_distance_m(
                        result.impact_lat_deg, result.impact_lon_deg, float(lat), float(lon)
                    )
            rows.append(row)
        except ConfigurationError as exc:
            rows.append({"case_id": case_id, "status": "invalid", "reason": str(exc)})

    fieldnames = sorted({key for row in rows for key in row.keys()})
    with (output_dir / "impact_points.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    accepted = sum(row.get("status") == "accepted" for row in rows)
    print(f"Wrote {len(rows)} cases; {accepted} accepted: {output_dir / 'impact_points.csv'}")
    return 0 if accepted else 3


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("config", type=Path, help="Path to a completed JSON configuration.")
    parser.add_argument("--output-dir", type=Path, default=Path("output"), help="Output directory.")
    parser.add_argument("--sweep", action="store_true", help="Run the Cartesian parameter sweep in config.sweep.")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    try:
        return run_sweep(args.config, args.output_dir) if args.sweep else run_single(args.config, args.output_dir)
    except (OSError, json.JSONDecodeError, ConfigurationError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
