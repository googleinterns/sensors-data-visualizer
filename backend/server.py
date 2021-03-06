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

from flask import Flask
from flask import request

from flask_cors import CORS

import json
import numpy as np

from parser import GoogleSensorParser
from parser import Parser

from stats import compute_running_avg
from stats import compute_stdev

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

if __name__ == '__main__':
    app.run(debug=True)
