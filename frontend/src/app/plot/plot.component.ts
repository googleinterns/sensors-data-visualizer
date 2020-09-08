/* Copyright 2020 Google LLC

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
import {error} from '@angular/compiler/src/util';

@Component({
  selector: 'app-plot',
  templateUrl: './plot.component.html',
  styleUrls: ['./plot.component.css'],
})

/**
 * Handles the Plotly plot and the plots' data.
 */
export class PlotComponent {
  /**
   * plot_data is an array of maps that define what is plotted.
   * It is initialized with a (0,0) point so that the plot appears when the page is opened.
   * Each map defines a single plotly trace with possible options.
   * Trace options:
   *    x: Takes an array of x-axis values that correspond to the y-axis.
   *        Usually timestamps.
   *    y: Takes an array of y-axis values.
   *    (Note: The lengths of x and y must be equal.)
   *    type: How the data is displayed to the user. 'scattergl' and 'historgram'
   *      will most likely be the only types used. (Avoid 'scatter' type since it
   *      has poorer performance on large datasets than 'scattergl'.)
   *    mode: Finer details for how to display the type. 'markers' displays only a dot
   *      for each datapoint. 'lines' displays a line through all datapoints. 'lines+markers'
   *      displays both.
   */
  plot_data = [
    {
      x: [0],
      y: [0],
      type: 'scattergl',
      mode: 'markers',
      id: -1,
      visible: true,
      name: 'Placeholder Point',
    },
  ];

  // Plot Configurations.
  plot_layout = {title: 'Add a new dataset.', legend: 'false'};
  plot_config = {scrollZoom: true, displayModeBar: true};
  message: any;

  // A map from id number to array index that will speed up toggle operations.
  idMap = new Map<number, number>();
  constructor() {}

  /**
   * If placeholder data is still present in the plot, remove it.
   * Helper method for addTrace and addSamples methods.
   */
  checkDataAdded() {
    if (this.plot_data.length === 1 && this.plot_data[0].id === -1) {
      this.plot_data.pop();
      this.plot_layout.title = '';
    }
  }
  /**
   * Add a single trace to the plot and set its id in idMap.
   * @param x The x data to plot.
   * @param y The y data to plot.
   * @param id
   * @param name
   * @param show If true, shows the trace, else hides the trace from view until toggled.
   */
  public addTrace(
    x: Array<number>,
    y: Array<number>,
    id: number,
    name: string,
    show: boolean
  ) {
    if (x.length !== y.length) {
      console.log('x: ', x, ' y: ', y);
      throw error(
        'x and y arrays must match in length' +
        ' len x: ' + x.length +
        ' len y: ' + y.length);
    }
    this.checkDataAdded();

    this.plot_data.push({
      x: x,
      y: y,
      type: 'scattergl',
      mode: 'markers',
      id: id,
      visible: show,
      name: name,
    });

    this.idMap.set(id, this.plot_data.length - 1);
  }

  /**
   * Adds a set of samples to this plot.
   * @param samples
   */
  public addSamples(samples) {
    this.checkDataAdded();

    for (const i in samples) {
      // Plot each individual data channel.
      for (const j in samples[i].data) {
        this.addTrace(
          samples[i].timestamps,
          samples[i].data[j][1],
          samples[i].data[j][0],
          j + ' ' + samples[i].sensor_name,
          true
        );
      }
      // Plot the timestamp difference, but don't show it until the user
      // toggles it in the dataset menu.
      this.addTrace(
        samples[i].timestamps,
        samples[i].timestamp_diffs[1],
        samples[i].timestamp_diffs[0],
        'TS Diff ' + samples[i].sensor_name,
        false
      );
      // Plot the latencies if they are present in the sample.
      // Don't show until user toggles them on.
      if ('latencies' in samples[i]) {
        this.addTrace(
          samples[i].timestamps,
          samples[i].latencies[1],
          samples[i].latencies[0],
          'Latencies ' + samples[i].sensor_name,
          false
        );
      }
    }
  }

  /**
   * Called by dataset.component button to toggle a trace.
   * @param id The id of the trace to toggle on/off.
   */
  toggleTrace(id: number) {
    const index = this.idMap.get(id);
    this.plot_data[index].visible = !this.plot_data[index].visible;
  }

  /**
   * Removes an entire dataset from plot_data.
   * @param ids The individual traces to delete.
   */
  async deleteDataset(ids: Set<number>) {
    let i = 0;
    while (i < this.plot_data.length) {
      if (ids.has(this.plot_data[i].id)) {
        // At index i, remove 1 element.
        this.plot_data.splice(i, 1);
      } else {
        i++;
      }
    }
    // Reorder idMap with remaining traces and delete removed traces.
    for (const i in this.plot_data) {
      this.idMap.set(this.plot_data[i].id, Number(i));
    }
    ids.forEach(id => this.idMap.delete(id));
  }
}
