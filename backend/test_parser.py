"""
Copyright 2020 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""

import unittest

from parser import GoogleSensorParser
from parser import Parser
from parser import Sample

class TestParser(unittest.TestCase):
    def test_sample_init(self):
        """Tests the Sample.__init__ method."""

        sample = Sample("Test", 1)

        self.assertEqual(sample.sensor_name, "Test")
        self.assertEqual(sample.sensor_id, 1)

    def test_sample_add_point_single(self):
        """Tests adding a single point using Sample.add_point."""
        
        sample = Sample("Test", 1)

        sample.add_point(100, [1])

        self.assertEqual(sample.data[0], [1])
        self.assertEqual(sample.timestamps[0], 100)

    def test_sample_add_point_many(self):
        """Tests the Sample.add_point method when many data points are added."""

        sample = Sample("Test", 1)
        sample.set_dimensions(2)

        for i in range(10):
            sample.add_point(i * 10, [i, -i])

        for i in range(10):
            self.assertEqual(sample.data[0][i], i)
            self.assertEqual(sample.data[1][i], -i)
            self.assertEqual(sample.timestamps[i], i * 10)

    def test_sample_add_point_with_latency(self):
        """Tests the Sample.add_point method when latency arg is not default."""

        sample = Sample("Test", 1)
        sample.set_dimensions(3)

        for i in range(50):
            sample.add_point(i, [i, -i, 10 * i], 9 * i)

        for i in range(50):
            self.assertEqual(sample.latencies[i], 9 * i)

    def test_sample_set_dimensions(self):
        """Test the set dimensions mechanism."""
        sample_3d = Sample("test", 1)
        sample_5d = Sample("test", 2)

        #good test
        sample_3d.set_dimensions(3)
        sample_5d.set_dimensions(5)

        sample_3d.add_point(1, [1, 2, 3])
        sample_5d.add_point(1, [1, 2, 3, 4, 5])

        self.assertEqual(sample_3d.data[2], [3])
        self.assertEqual(sample_5d.data[4], [5])

        self.assertTrue(sample_3d.performed_dimension_set)
        self.assertTrue(sample_5d.performed_dimension_set)

        #bad test
        self.assertRaises(KeyError, sample_3d.add_point, 1, [1, 2, 3, 4])
        self.assertRaises(ValueError, sample_5d.set_dimensions, -10)


    def test_parser_regex(self):
        """Tests loading a regex into the basic Parser class."""

        self.assertRaises(KeyError, Parser, ['test'], {})

        try:
            temp = Parser(['test'], {
                'sensor_name': '',
                'sensor_id': '',
                'timestamp': [],
                'data': []
            })
        except KeyError:
            self.fail("Unexpected exception on correct Parser() init.")

    def test_parser_file(self):
        """Opens and parses a test file with multiple samples and checks if each sample was found"""

        file_path = '../test_files/test_multi.txt'
        actual_names = ['BMI160 Gyroscope', 'Linear Acceleration Sensor', 'TMD2725 Ambient Light']
        parser = GoogleSensorParser([file_path])

        samples = parser.parse_files()
        parsed_names = []
        for sample in samples:
            parsed_names.append(sample.sensor_name)

        for name in actual_names:
            if not name in parsed_names:
                self.fail("Sensor: " + name + " not parsed.")

        # Test if certain data points were correctly added.
        gyro_first = [0.008589, 0.001221, 0.004163]
        gyro_last = [-0.000998, 0.001221, 0.000967]

        acceler_first = [-0.010448, -0.012941, -0.074984]
        acceler_last = [-0.009400, 0.009837, -0.051540]

        light = [53.471672, 0.000000, 0.000000]

        for sample in samples:
            if sample.sensor_id == '4.0':
                self.assertEqual(gyro_first, [sample.data[0][0], sample.data[1][0], sample.data[2][0]])
                self.assertEqual(gyro_last, [sample.data[0][-1], sample.data[1][-1], sample.data[2][-1]])
            if sample.sensor_id == '10.0':
                self.assertEqual(acceler_first, [sample.data[0][0], sample.data[1][0], sample.data[2][0]])
                self.assertEqual(acceler_last, [sample.data[0][-1], sample.data[1][-1], sample.data[2][-1]])
            if sample.sensor_id == '5.0':
                self.assertEqual(light, [sample.data[0][0], sample.data[1][0], sample.data[2][0]])

    

    
        
if __name__ == '__main__':
    unittest.main()