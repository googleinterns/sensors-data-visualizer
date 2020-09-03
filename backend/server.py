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
import time
import pandas as pd

from flask import Flask
from flask import request

from flask_cors import CORS

import json
import numpy as np

from parser import GoogleSensorParser
from parser import Parser

from werkzeug.utils import secure_filename

app = Flask(__name__)
#development only. https://flask-cors.readthedocs.io/en/latest/#resource-specific-cors
CORS(app)


@app.route('/')
def index():
    """The default route. Doesn't do anything.
    """
    return ""


@app.route('/upload', methods = ['POST'])
def upload_file():
    """Handles file uploads and responds with parsed sensor data.

    Attributes:
        request: What was recieved by the POST request. 
        request.files: A list of the uploaded files.

    Returns: Dictionary object for the fronend to consume.
        type: The type of data being returned. Set to 'upload'
            so the fronent knows the source of the data being returned.
        data: The data being returned from the sensor parser.
    """
    if request.method == "POST":
        f = request.files['file']
        f.save(secure_filename(f.filename))
        
        samples = GoogleSensorParser([f.filename]).parse_files()

        return {'type': 'upload', 'data': samples}

@app.route('/stats', methods = ['POST'])
def compute_stats():
    """Handles requests for stats data and responds with the requested
    stats.

    Attributes:
        request.data: The data sent from the frontend.
        request.data.channels: Key value pairs of channels and arrays
            to compute statistics for.
        
    Returns: Dictionary object for the frontend to consume.
        type: The type of data being returned. Set to 'upload'
            so the fronent knows the source of the data being returned.
        avgs: Object mapping channel type to a list of computed averages.
        stdevs: Object mapping channel type to a list of computed standard deviations.
    """
    if request.method == "POST":
        received = json.loads(request.data)
        avgs, stdevs = {}, {}

        stdev_period = received['stdev_period']
        avg_period = received['avg_period']
        for i, j in enumerate(received['channels']):
            avgs[j] = compute_running_avg(received['channels'][j], avg_period)
            stdevs[j] = compute_stdev(received['channels'][j], avgs[j], stdev_period)

        return {'type': 'stats', 'avgs': avgs, 'stdevs': stdevs}

def compute_running_avg(trace, period=100):
    """Computes the running average of a single data trace.

    Attributes:
        trace: The Python list data trace to compute averages for.
        period: The size of the window of previous data points that are
            used in the moving average computation.

    Returns: Python list containing the running average at each point.
    """
    start = time.time()
    n = len(trace)
    if period > n:
        period = n

    avgs = pd.Series(trace).rolling(period).mean()

    avgs[0] = trace[0]
    for i in range(1, period - 1):
        avgs[i] = avgs[i - 1] + (trace[i] - avgs[i - 1]) / (i + 1)

    end = time.time()
    print("computed avgs size: ", n, " period: ", period)
    print("new time: ", end-start)
    return avgs.to_list()

def compute_stdev(trace, avgs, period=100):
    """Computes the standard deviation of a single data trace.

    Attributes:
        trace: The Python list data trace to compute stdev for.
        avgs: The previously computed averages for the same trace, used
            in the computation of the first period-1 standard deviations.
        period: The size of the window of previous data points that are
            used in the standard deviation computation.

    Returns: Python list containing the standard deviation at each point.
    """
    start = time.time()
    n = len(trace)
    if period > n:
        period = n

    stdevs = pd.Series(trace).rolling(period).var()
    stdevs[0] = 0

    M = np.square(np.subtract(trace[0], avgs[0]))
    for i in range(1, period - 1):
        #M += (trace[i] - avgs[i - 1]) * (trace[i] - avgs[i])
        np.add(M, np.multiply(np.subtract(trace[i], avgs[i - 1]), np.subtract(trace[i], avgs[i])))
        stdevs[i] = M / i

    end = time.time()
    print("computed stdevs size: ", n, " period: ", period)
    print("new time: ", end-start)
    return np.sqrt(stdevs).tolist()

if __name__ == '__main__':
    app.run(debug=True)
