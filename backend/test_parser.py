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
from parser import Parser
from parser import Sample

class GoogleSensorParser(Parser):
    """Implementation of Parser for Google formatted sensor data.
    
    Attributes:
        regex: A dict that defines the Google sensor data format.
    """
    def __init__(self, files: list):
        """Inits class with list of files only."""

        self.regex = {}
        # Space separated words preceded by ': ' followed by '. \n'.
        self.regex['sensor_name'] = "(?<=: )[\w\s]+(?=.\n)"
        # A number preceded by 'sensor type '.
        self.regex['sensor_id'] = "(?<=sensor type )[+-]?([0-9]*[.])?[0-9]+"
        # A number preceded by 'TS: '.
        self.regex['timestamp'] = "(?<=TS: )[+-]?([0-9]*[.])?[0-9]+"
        # Matches a series of space separated numbers preceded by 'Data: '.
        self.regex['data'] = "(?<=Data: )([+-]?([0-9]*[.])?[0-9]+\s)+"
        # Matches the number following 'Sensor'.
        self.regex['inline_id'] = "(?<=Sensor: )[+-]?([0-9]*[.])?[0-9]"

        super().__init__(files, self.regex)


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

        for i in range(10):
            sample.add_point(i * 10, [i, -i])

        for i in range(10):
            self.assertEqual(sample.data[0][i], i)
            self.assertEqual(sample.data[1][i], -i)
            self.assertEqual(sample.timestamps[i], i * 10)

    def test_sample_add_point_with_latency(self):
        """Tests the Sample.add_point method when latency arg is not default."""

        sample = Sample("Test", 1)

        for i in range(50):
            sample.add_point(i, [i, -i, 10 * i], 9 * i)

        for i in range(50):
            self.assertEqual(sample.latencies[i], 9 * i)

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
        parser = GoogleSensorParser([file_path])

        samples = parser.parse_files()[0]

        self.assertEqual(samples['4.0'].sensor_name, 'BMI160 Gyroscope')
        self.assertEqual(samples['10.0'].sensor_name, 'Linear Acceleration Sensor')
        self.assertEqual(samples['5.0'].sensor_name, 'TMD2725 Ambient Light')

if __name__ == '__main__':
    unittest.main()