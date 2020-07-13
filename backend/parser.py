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

import re

class Sample:
    """Sample holds the data recorded for some sensor.

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

        #tracks the next index where data will be added
        self.next_index = 0
        #checks if the data dimensions for this sample have already been parsed
        self.performed_dimension_set = False

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
                e.g. if data = [1, 2, 3, 4] then x = 1, y = 2, etc.
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
        """Initializes empty lists in dict after parser determines data dimensions
        
        Args:
            dimensions: The number of dimensions that the data has. e.g. if the
                gyroscope returns (x,y,z) tuples the parser calls set_dimensions(3)
        
        Raises:
            ValueError: "<= 1 dimension error" 1 dimensions is always initialized and negative/0 dimensions don't exist
        """

        if dimensions <= 1:
            raise ValueError("<= 1 dimension error")

        for i in range(1, dimensions+1):
            self.data[i] = []

        self.performed_dimension_set = True

class Parser:
    """Parse takes in one or more files and converts them to JSON

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
        self.regex = regex
        self.samples = []

        try: #Test if any required fields are not defined
            self.regex['sensor_name']
            self.regex['sensor_id']
            self.regex['timestamp']
            self.regex['data']
        except:
            raise KeyError("One or more required regex fields not defined.")

    def parse_files(self): #TODO Document method
        json_samples = []

        for file in self.files:
            json_samples.append(self.parse(file))

        return self.json(json_samples) #TODO convert the samples to JSON then return

    def parse(self, file): #parse a single file TODO document method
        
        samples = {}
        with open(file, "r") as f:
            #read the header lines to determine how many samples are present
            #and create sample objects for each

            line = f.readline()
            while line:
                matched_name = re.search(self.regex['sensor_name'], line)
                matched_id = re.search(self.regex['sensor_id'], line)
                
                if matched_name and matched_id:
                    matched_name = matched_name.group(0)
                    matched_id = matched_id.group(0)

                    samples[matched_id] = Sample(matched_name, matched_id)
                    line = f.readline()
                else:
                    break
            print("Samples Collected: ", len(samples)) #Test
            print("Samples: ", samples)


    def json(self, samples): #TODO document method
        pass #TODO