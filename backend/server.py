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

from werkzeug.utils import secure_filename

app = Flask(__name__)
#development only. https://flask-cors.readthedocs.io/en/latest/#resource-specific-cors
CORS(app)

@app.route('/')
def index():
    return ""

@app.route('/upload', methods = ['POST'])
def upload_file():
    if request.method == "POST":
        f = request.files['file']
        f.save(secure_filename(f.filename))
        
        samples = GoogleSensorParser([f.filename]).parse_files()

        return {'type': 'upload', 'data': samples}

@app.route('/stats', methods = ['POST'])
def compute_stats():
    if request.method == "POST":
        received = json.loads(request.data)
        avgs, stdevs = {}, {}

        for i, j in enumerate(received['channels']):
            avgs[j] = compute_running_avg(received['channels'][j])
            stdevs[j] = compute_stdev(received['channels'][j])

        return {'type': 'stats', 'avgs': avgs, 'stdevs': stdevs}

def compute_running_avg(trace):
    n = len(trace)
    avgs = np.cumsum(trace[:n+1], dtype=float)
    for i in range(len(avgs)):
        avgs[i] = avgs[i] / (i + 1)

    return avgs.tolist()
    

def compute_stdev(trace):
    return -1 #TODO

if __name__ == '__main__':
    app.run(debug=True)
