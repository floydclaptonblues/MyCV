import unittest

import trajectory_model as tm


class TrajectoryModelTests(unittest.TestCase):
    def base_config(self):
        return {
            "initial": {
                "lat_deg": 30.0,
                "lon_deg": -90.0,
                "altitude_ft_above_water": 1000.0,
                "airspeed_kt": 80.0,
                "heading_deg_true": 0.0,
                "bank_deg": 0.0,
                "flight_path_angle_deg": -10.0,
                "vertical_speed_fpm": None,
                "stall_speed_wings_level_kt": 40.0,
            },
            "environment": {"wind_speed_kt": 0.0, "wind_from_deg_true": 0.0},
            "integration": {"dt_s": 0.01, "max_time_s": 300.0},
            "policy": {"allow_stalled_branch": False},
        }

    def test_wind_from_north_blows_south(self):
        east, north = tm.wind_components_mps(10.0, 0.0)
        self.assertAlmostEqual(east, 0.0, places=10)
        self.assertLess(north, 0.0)

    def test_straight_descent_matches_closed_form(self):
        result, _ = tm.propagate(self.base_config(), capture_track=False)
        self.assertEqual(result.status, "accepted")
        self.assertLess(result.numerical_closed_form_difference_m, 0.1)
        self.assertAlmostEqual(result.numerical_east_m, 0.0, places=3)
        self.assertGreater(result.numerical_north_m, 0.0)

    def test_right_bank_increases_heading(self):
        config = self.base_config()
        config["initial"]["bank_deg"] = 25.0
        result, track = tm.propagate(config)
        self.assertEqual(result.status, "accepted")
        self.assertGreater(track[-1].heading_rad, track[0].heading_rad)

    def test_left_bank_decreases_heading(self):
        config = self.base_config()
        config["initial"]["bank_deg"] = -25.0
        result, track = tm.propagate(config)
        self.assertEqual(result.status, "accepted")
        self.assertLess(track[-1].heading_rad, track[0].heading_rad)

    def test_missing_value_fails_closed(self):
        config = self.base_config()
        config["initial"]["airspeed_kt"] = None
        with self.assertRaises(tm.ConfigurationError):
            tm.propagate(config)

    def test_accelerated_stall_gate(self):
        config = self.base_config()
        config["initial"]["airspeed_kt"] = 45.0
        config["initial"]["bank_deg"] = 60.0
        with self.assertRaises(tm.ConfigurationError):
            tm.propagate(config)


if __name__ == "__main__":
    unittest.main()
