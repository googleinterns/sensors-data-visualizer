**This is not an officially supported Google product.**

# Sensors Data Visualizer

Debugging sensors using raw sensor data is not intuitive. Sensor data represents physical movements and so reading raw data does not allow a developer to understand where sensor issues may be present, especially when they are trying to compare multiple sensors. This project aims to provide a visual representation of sensor data so that a user can more easily diagnose issues. This visualization tool will allow users to input sensor data from multiple sources and will be easily extendible to new sources.  The tool will then parse the input data and plot the data on an easily readable graph, with additional features that allow for more insights into the data.

# Frontend Build Instructions (Run commands from /sensors-data-visualizer/frontend)
1. Ensure Node.js >= 12.0 is installed. https://nodejs.org/en/download/
2. Install Angular CLI by running: npm install -g @angular/cli
3. Install Angular devkit by running: npm install --save-dev @angular-devkit/build-angular
4. While in sensors-data-visualizer/frontend: ng serve -o
5. Should automatically open a browser to localhost:4200. Open server.py to enable backend.

# Backend Build Instructions (Run commands from /sensors-data-visualizer/backend)
1. pip install flask
2. pip install flask_cors
3. python server.py

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
