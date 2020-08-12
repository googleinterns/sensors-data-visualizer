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

import json
import re

class Sample:
    """Sample holds the data recorded for a sensor.

    Attributes:
        sensor_name: A string holding the name of the sensor.
        sensor_id: The unique ID of a sensor.
        timestamps: A list of each recorded timestamp in the sample.
        timestamp_diffs: A list where index i contains timestamps[i] - timestamps[i-1]. If i==0, timestamps_diff[i] = 0.
        data: A dictionary that holds a list of each dimmensions recorded datapoints. Initialized to hold 1D data,
            But can be extended to hold an arbitary number of dimmensions.
                e.g. data[0] holds a list of all the data's first dimmension datapoints, usually the x-axis.
        latencies: A List of the recorded latency of each datapoint
        next_index: Index where the next datapoint will be added for every list in the sample
    """

    def __init__(self, sensor_name: str, sensor_id: str):
        """Initializes Sample with the sensor_name and a numeric sensor_id"""
        self.sensor_name = sensor_name
        self.sensor_id = sensor_id

        # Tracks the next index where data will be added.
        self.next_index = 0
        # Checks if the data dimensions for this sample have already been parsed.
        self.performed_dimension_set = False

        self.initial_timestamp = None
        self.timestamps = []
        self.timestamp_diffs = []

        self.data = {}
        self.data[0] = []

        self.latencies = []

    def add_point(self, timestamp, datapoints: list, latency=-1):
        """Adds a single datapoint to the Sample
        
        Args:
            timestamp: The recorded timestamp for this datapoint
            data: A list of the datapoints to be added ordered by dimension.
                e.g. If data = [1, 2, 3] and timestamp = 10 for a gyroscope, then
                the gyroscope returned x-axis = 1, y-axis = 2, z-axis = 3 at time 10.
            latency: The recorded latency for this datapoint. Optional.
        
        Returns: None
        """

        self.timestamps.append(timestamp)

        if self.next_index > 0:
            self.timestamp_diffs.append(timestamp - self.timestamps[self.next_index-1])
        else:
            self.timestamp_diffs.append(0)

        if latency >= 0:
            self.latencies.append(latency)

        for i, point in enumerate(datapoints):
            self.data[i].append(point)
            
        self.next_index += 1

    def set_dimensions(self, dimensions: int):
        """Initializes empty lists in dict after parser determines data dimensions.
        
        Args:
            dimensions: The number of dimensions that the data has. e.g. if the
                gyroscope returns (x,y,z) tuples the parser calls set_dimensions(3).
        
        Raises:
            ValueError: "< 1 dimension error". 0 or negative dimensions are not valid.
        """

        if dimensions < 1:
            raise ValueError("< 1 dimension error")
        if dimensions == 1:
            self.performed_dimension_set = True
            return

        for i in range(1, dimensions):
            self.data[i] = []

        self.performed_dimension_set = True

class Parser:
    """Parser takes in one or more files and converts them to JSON

    Attributes:
        files: A list of files to parse
        regex: A dict that holds the string regular expressions that match to various fields.
            Keys:
                'sensor_name': (Required) Matches the name of the sensor.
                'sensor_id': (Required) Matches the ID of the sensor.
                'timestamp': (Required) Matches every timestamp in the file.
                'data': (Required) Matches the comma or space separated data fields. Should match all data points.
                'latency': Matches all latency points.
                'inline_id': For file formats where multiple sensors are present in the file.
                    The id should match the id declared in 'sensor_id'.
        samples: List of Sample objects parsed from the files
    """
    
    def __init__(self, files: list, regex: dict):
        """"Initializes the parser with a list of files and a dict of regex that details the file format

        Raises:
            KeyError: One or more required regex fields not defined
        """

        self.files = files
        self.compiled = {}
        self.samples = []

        # Test if any required fields are not defined.
        required = ['sensor_name', 'sensor_id', 'timestamp', 'data']
        for field in required:
            if field not in regex.keys():
                raise KeyError("Missing required regex field: " + field)

        # Pre-compile regexs for increased parsing speed.
        for key in regex.keys():
            self.compiled[key] = re.compile(regex[key])

    def parse_files(self) -> list:
        """Iterates through all files and returns the parsed Sample objects in json format

        Returns:
            A list of json strings representing each sample contained in the files
        """
        json_samples = []

        for file in self.files:
            for sample in self.parse(file):
                json_samples.append(sample)

        return self.jsonify(json_samples)

    def parse(self, file):
        """Parses a single file and creates Sample objects based on how many samples are in the file.
        Args:
            file: The file containing sensor data.

        Returns:
            A list containing Sample objects for each sample contained in the file.
        """
        
        samples = {}
        with open(file, "r") as f:
            # Read the header lines to determine how many samples are present
            # and create sample objects for each.

            line = f.readline()
            while line:
                if self.read_header(line, samples):
                    line = f.readline()
                else:
                    break

            # Check if no header detected and create a Sample.
            if not samples:
                samples[0] = Sample('unknown_sensor', '0')
                
            # Read data fields and add to the corresponding sample object.
            while line:
                self.read_body(line, samples)
                line = f.readline()

        # Return only the values since the keys are no longer relevant.
        return list(samples.values())

    def read_header(self, line, samples) -> bool:
        """Parses a header line to determine sensor name and id.
            Creates new Sample objects for sensors.

        Args:
            line: The file line to be read.
            samples: The dict of samples to add to when a new Sample is created.

        Returns:
            True if name and id data was parsed from the line.
            False if the line did not contain data.
        """

        matched_name = self.compiled['sensor_name'].search(line)
        matched_id = self.compiled['sensor_id'].search(line)

        if matched_name and matched_id:
            matched_name = matched_name.group(0)
            matched_id = matched_id.group(0)

            samples[matched_id] = Sample(matched_name, matched_id)
            return True
        else:
            return False

    def read_body(self, line, samples: dict):
        """Reads a line from a file and parses relevant data fields from it.

        Args:
            line: The line from a file to be read.
            samples: A dict with keys: sensor_id and values: Sample objects.
        """
        
        # Determine this sensors ID.
        if 'inline_id' in self.compiled:
            search = self.compiled['inline_id'].search(line)
            if search:
                this_id = search.group(0)
        else:
            this_id = samples.keys()[0]
            
        # Determine the timestamp for this line.
        search = self.compiled['timestamp'].search(line)
        if search:
            matched_timestamp = int(search.group(0))
        else: 
            # Timestamp is required data for a point, return if no timestamp present.
            return

        # Find the data present in this line.
        search = self.compiled['data'].search(line)
        if search:
            matched_data = search.group(0).split()
            #convert from str to float
            matched_data = [float(i) for i in matched_data]
        else:
            return

        # Detect the dimensions of the data if not already done.
        if not samples[this_id].performed_dimension_set:
            samples[this_id].set_dimensions(len(matched_data))

        matched_latency = -1
        if 'latency' in self.compiled:
            search = self.compiled['latency'].search(line)
            if search:
                matched_latency = int(search.group(0))

        samples[this_id].add_point(matched_timestamp, matched_data, matched_latency)

    def jsonify(self, samples: list):
        """Takes a list of sample objects and returns a list of JSON versions of those objects.

        Args:
            samples: A list of sample objects to be converted.

        Returns:
            A JSON string in the format:
                {   0: {Sample Object},
                    1: {Sample Object},
                    ....   }
        """
        ret_dict = {}

        
        for i, sample in enumerate(samples):
            # sample.data[key][0] is a placeholder for the unique id
            # assigned to each trace in the frontend.
            for key in sample.data.keys():
                sample.data[key] = [-1, sample.data[key]]

            temp_dict = {
                "sensor_name": sample.sensor_name,
                "sensor_id": sample.sensor_id,
                "timestamps": sample.timestamps,
                "timestamp_diffs": [-1, sample.timestamp_diffs],
                "data": sample.data,
                "data_len": len(sample.data)
            }

            if sample.latencies:
                temp_dict['latencies'] = [-1, sample.latencies]

            ret_dict[i] = json.dumps(temp_dict)

        return json.dumps(ret_dict)

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
        # Matches the number following 'Latency: '.
        self.regex['latency'] = "(?<=Latency: )[+-]?([0-9]*[.])?[0-9]+"

        super().__init__(files, self.regex)
