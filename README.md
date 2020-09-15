**This is not an officially supported Google product.**

# Sensors Data Visualizer

Debugging sensors using raw sensor data is not intuitive. Sensor data represents physical movements and so reading raw data does not allow a developer to understand where sensor issues may be present, especially when they are trying to compare multiple sensors. This project aims to provide a visual representation of sensor data so that a user can more easily diagnose issues. This visualization tool will allow users to input sensor data from multiple sources and will be easily extendible to new sources.  The tool will then parse the input data and plot the data on an easily readable graph, with additional features that allow for more insights into the data.

# Setup Instructions
1. Install Node.js >= 12.0 from https://nodejs.org/en/download/
2. Install Angular CLI: `npm install -g @angular/cli --save-dev`
3. Install Angular devkit: `npm install --save-dev @angular-devkit/build-angular`
4. Install flask: `pip install flask`
5. Install flask_cors: `pip install flask_cors`
6. Install pandas: `pip install pandas`
7. Run `git clone https://github.com/googleinterns/sensors-data-visualizer.git`
8. `cd sensors-data-visualizer`

# Frontend Build Instructions
1. `cd frontend`
2. Compile and run app (will automatically open browser to localhost:4200): `ng serve -o`

# Backend Build Instructions
1. `cd sensors-data-visualizer/backend`
2. Run server: `python server.py`

## Source Code Headers

Every file containing source code must include copyright and license
information. This includes any JS/CSS files that you might be serving out to
browsers. (This is to help well-intentioned people avoid accidental copying that
doesn't comply with the license.)

Apache header:

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
