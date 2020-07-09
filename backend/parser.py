import re

class Sample:
    """Sample holds the data recorded for some sensor.

    Attributes:
        sensor_name: A string holding the name of the sensor.
        sensor_id: The numerical i.d. of the sensor.
        timestamps: A list of each recorded timestamp in the sample.
        timestamp_diffs: A list where index i contains timestamps[i] - timestamps[i-1]. If i==0, timestamps_diff[i] = 0.
        data: A dictionary that is initialized to hold 3D data but can be extended to any D data.
            e.g. data[0] holds a list of all the data's x points
        latencies: A List of the recorded latency of each datapoint
        next_index: Index where the next datapoint will be added for every list in the sample
    """

    def __init__(self, sensor_name: str, sensor_id):
        """Initializes Sample with the sensor_name and a numeric sensor_id"""
        self.sensor_name = sensor_name
        self.sensor_id = sensor_id

        #tracks the next index where data will be added
        self.next_index = 0

        self.timestamps = []
        self.timestamp_diffs = []

        self.data = {}
        self.data[0] = [] #x data
        self.data[1] = [] #y data
        self.data[2] = [] #z data

        self.latencies = []

    def add_point(self, timestamp, data: list, latency=None):
        """Adds a single datapoint to the Sample
        
        Args:
            timestamp: The recorded timestamp for this datapoint
            data: A list of the datapoints to be added ordered by dimension.
                e.g. if data = [1, 2, 3, 4] then x = 1, y = 2, etc.
            latency: The recorded latency for this datapoint. Optional.
        """

        self.timestamps.append(timestamp)

        if self.next_index > 0:
            self.timestamp_diffs[self.next_index] = timestamp - self.timestamps[self.next_index-1]
        else:
            self.timestamp_diffs.append(0)

        if latency:
            self.latencies.append(latency)

        for i, point in enumerate(data):
            self.data[i].append(point)
            
        self.next_index += 1

class Parser:
    """Parser takes in one or more files and converts them to JSON

    Attributes:
        files: A list of files to parse
        header: A regex that defines the header of the file, including fields such as sensor_name
        body: A regex that defines the body of the file, including all relevant data
            Header and body attributes allow extending file formats.
        samples: List of Sample objects parsed from the files
    """
    
    def __init__(self, files: list, header, body):
        self.files = files
        self.header = header
        self.body = body
        self.samples = []

    def parse_files(self):
        json_samples = []

        for file in self.files:
            json_samples.append(self.parse(file))

        return self.json(json_samples) #TODO convert the samples to JSON then return

    def parse(self, file): #parse a single file
        with open(file, "r") as f:
            pass #TODO

    def json(self, samples):
        pass #TODO