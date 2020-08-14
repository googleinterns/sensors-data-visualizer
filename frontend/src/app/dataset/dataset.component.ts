/*Copyright 2020 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. */

// Angular Imports.
import {Component} from '@angular/core';

// Project Imports.
import {PlotComponent} from '../plot/plot.component';

@Component({
  selector: 'app-dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.css'],
})
export class DatasetComponent {
  sample: any;
  plotRef: PlotComponent;
  ids = new Map<any, number>();
  hasLatencies: boolean;

  constructor() {
    this.hasLatencies = false;
  }

  /**
   * Setter method to initialize the dataset with appropriate sample data.
   * @param sample The sample object received by UploadService from the backend.
   */
  public setSample(sample) {
    console.log('sample: ', sample);
    this.sample = sample;
    for (const i in sample.data) {
      this.ids.set(Number(i), sample.data[i][0]);
    }
    this.ids.set('ts_diff', sample.timestamp_diffs[0]);

    if ('latencies' in sample) {
      this.hasLatencies = true;
      this.ids.set('latencies', sample.latencies[0]);
    }
  }

  /**
   * Allows UploadService to pass in a reference to the PlotComponent being displayed.
   * @param ref A reference to the plot component that allows dataset to access the
   * methods and fields of the plot.
   */
  public setPlotRef(ref) {
    this.plotRef = ref.first;
  }

  /**
   * Triggered when toggle on page is clicked. Calls the plot component toggleTrace method.
   * @param channel The channel of the trace to toggle.
   */
  toggleTrace(channel) {
    this.plotRef.toggleTrace(this.ids.get(channel));
  }
}
