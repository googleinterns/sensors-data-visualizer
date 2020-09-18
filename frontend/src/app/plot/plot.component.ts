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
import {StyleDialogComponent} from '../style-dialog/style-dialog.component';
import {MatDialog} from '@angular/material/dialog';

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
   *      are the only currently used types. (Avoid 'scatter' type since it
   *      has poorer performance on large datasets than 'scattergl'.)
   *    mode: Finer details for how to display the type. 'markers' displays only a dot
   *      for each datapoint. 'lines' displays a line through all datapoints. 'lines+markers'
   *      displays both.
   *    marker: A map that allows custom changes to markers.
   *      marker.symbol: The shape markers take. Options used: 'circle', 'diamond', 'star'.
   *      https://plotly.com/python/marker-style/#custom-marker-symbols
   *    id: The id used by Sensor Visualizer to uniquely identify traces so they can be
   *      removed, altered, or referenced in some way. This field is not used by plotly.
   *    visible: If true, the trace will show up. If false, the trace is invisible.
   *    name: The trace name displayed to the user.
   */
  plot_data = [
    {
      x: [0],
      y: [0],
      type: 'scattergl',
      mode: 'markers',
      id: -1,
      marker: {symbol: 'diamond'},
      visible: true,
      name: 'Placeholder Point',
    },
  ];

  /**
   * Plot configurations.
   * hovermode must be set to closest. closest mode selects only
   * a single trace on hover, rather than every trace in
   * a dataset which would happen if hovermode was not specified.
   * Selecting a single trace allows for the options menu to know
   * which trace is being changed. Further documenation at:
   * https://plotly.com/javascript/reference/layout/
   */
  plot_layout = {
    title: 'Add a new dataset by clicking the upload button.',
    // Disable toggling of trace visibility through plotly legend clicks.
    legend: {itemclick: false, itemdoubleclick: false},
    hovermode: 'closest',
    autosize: true,
  };
  /**
   * Configuration options, further documentaion at:
   * https://plotly.com/javascript/configuration-options/
   */
  plot_config = {scrollZoom: true, displayModeBar: true};
  // A map from id number to array index that will speed up toggle operations.
  idMap = new Map<number, number>();
  // Tracks if this plot contains only histograms.
  isAHistogram = false;
  selfRef;
  // Tracks if this plot needs to be resized.
  resize: boolean;

  constructor(private dialog: MatDialog) {}

  /**
   * Forces a plot resize by adding a single invisible point to the plot,
   * which triggers a plotly resize. This is a hacky way to make sure the
   * plot fills its entire container, without it the plot is too small.
   * The invisible point is removed whenever a trace is added so it doesn't
   * cause any problems.
   */
  forceResize() {
    if (this.resize) {
      this.addTrace([0], [0], -2, 'fake', false);
      this.resize = false;
      this.idMap.set(-2, this.plot_data.length - 1);
    }
  }

  /**
   * Save a reference to self when created. This self reference is used when
   * opening the plot options menu so that the menu can directly change the plot.
   * Also sets the resize boolean.
   * @param ref A reference to this component.
   * @param resize Tracks if this plot has been viewed yet.
   */
  public setSelfRef(ref, resize: boolean) {
    this.selfRef = ref;
    this.resize = resize;
  }

  /**
   * If placeholder data is still present in the plot, remove it.
   * Helper method for addTrace and addSamples methods.
   */
  checkDataAdded() {
    if (this.idMap.has(-2)) {
      this.plot_data.pop();
      this.idMap.delete(-2);
    }
    if (this.plot_data.length === 1 && this.plot_data[0].id === -1) {
      this.plot_data.pop();
      this.plot_layout.title = '';
      return true;
    }
    return false;
  }
  /**
   * Add a single trace to the plot and set its id in idMap.
   * @param x The x data to plot. Length must match length(y).
   * @param y The y data to plot. Length must match length(x).
   * @param id The unique ID for the trace being added.
   * @param name The name of the trace to display to the user.
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
      throw error( /*eslint-disable*/
        'x and y arrays must match in length' +
        ' len x: ' + x.length +
        ' len y: ' + y.length);
    } /*eslint-enable*/
    this.checkDataAdded();

    this.plot_data.push({
      x: x,
      y: y,
      type: 'scattergl',
      mode: 'markers',
      marker: {symbol: 'circle'},
      id: id,
      visible: show,
      name: name,
    });
    this.plot_data[this.plot_data.length - 1].marker['size'] = 10;
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
          samples[i].data[j]['arr'],
          samples[i].data[j]['id'],
          j + ' ' + samples[i].sensor_name,
          true
        );
      }
      // Plot the timestamp difference, but don't show it until the user
      // toggles it in the dataset menu.
      this.addTrace(
        samples[i].timestamps,
        samples[i].timestamp_diffs['arr'],
        samples[i].timestamp_diffs['id'],
        'TS Diff ' + samples[i].sensor_name,
        false
      );
      // Plot the latencies if they are present in the sample.
      // Don't show until user toggles them on.
      if ('latencies' in samples[i]) {
        this.addTrace(
          samples[i].timestamps,
          samples[i].latencies['arr'],
          samples[i].latencies['id'],
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
   * Opens the style options menu dialog.
   * @param event The result of the click event generated by plotly.
   *  event.points gives the information for the clicked point.
   */
  async styleOptions(event) {
    if (event.points[0].data.id < 0) {
      return;
    }
    await this.showOptionsMenu(event.points[0].data.id);
  }

  /**
   * Opens the StyleDialogComponent menu.
   * @param traceID Which trace was clicked by the user.
   */
  showOptionsMenu(traceID: number) {
    return new Promise(() => {
      const optionsRef = this.dialog.open(StyleDialogComponent);
      optionsRef.componentInstance.init(
        traceID,
        this.selfRef,
        this.isAHistogram
      );
    });
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

  /**
   * Assigns new timestamps to an entire dataset.
   * @param traces The IDs for which to assign new timestamps.
   * @param timestamps The new timestamps to assign. These are either
   *  newly normalized or the original timestamps.
   */
  normalizeX(traces: Array<number>, timestamps: Array<number>) {
    traces.forEach(traceID => {
      if (this.idMap.has(traceID)) {
        this.plot_data[this.idMap.get(traceID)].x = timestamps;
      }
    });
  }

  /**
   * Apply the de/normalization performed in dataset.component.ts
   * @param traceID The ID of the trace to change.
   * @param data The new data to use.
   */
  normalizeY(traceID: number, data: Array<number>) {
    this.plot_data[this.idMap.get(traceID)].y = data;
  }

  /**
   * Changes a scattergl plot to either lines or markers mode.
   * @param traceID The ID of the trace to change.
   * @param mode Either 'lines' or 'markers'
   */
  toggleLineStyle(traceID: number, mode: string) {
    const trace = this.plot_data[this.idMap.get(traceID)];
    if (trace.type === 'histogram') {
      trace.type = 'scattergl';
    } else {
      trace.mode = mode;
    }
  }

  /**
   * Changes the shapes of the markers contained in the plot.
   * @param traceID The ID of the trace to change.
   * @param mode The style to apply. One of: 'none', 'circle', 'star', 'diamond'
   *  If mode === 'none' the trace type is switched to mode 'lines'.
   */
  toggleMarkerStyle(traceID: number, mode: string) {
    const trace = this.plot_data[this.idMap.get(traceID)];
    if (mode === 'none') {
      trace.mode = 'lines';
    } else {
      if (trace.mode === 'lines') {
        trace.mode = 'lines+markers';
      }
      trace.marker.symbol = mode;
    }
  }

  /**
   * Changes the color of a trace.
   * @param traceID The trace to change.
   * @param r red channel
   * @param g green channel
   * @param b blue channel
   */
  changeColor(traceID: number, r: number, g: number, b: number) {
    this.plot_data[this.idMap.get(traceID)].marker['color'] =
      'rgb(' + r + ', ' + g + ', ' + b + ')';
  }

  /**
   * Creates a histogram plot with the given sorted data. The x and y axes are the same as
   * plotly automatically converts the Y-axis to the number of values in each axis.
   * @param sorted Contains the data array, id and name of the histogram to create.
   *  Passed by dataset.component.ts toggleHistogram()
   */
  createHistogram(sorted) {
    this.isAHistogram = true;
    this.checkDataAdded();
    const index = this.plot_data.push({
      x: sorted['arr'],
      y: sorted['arr'],
      type: 'histogram',
      mode: '',
      id: sorted['id'],
      marker: {
        symbol: '',
      },
      visible: true,
      name: sorted['name'],
    });
    this.plot_data[index - 1].marker['line'] = {
      color: 'rgb(0, 0, 0)',
      width: 0.7,
    };
    this.plot_layout['xaxis'] = {title: 'Range of values'};
    this.plot_layout['yaxis'] = {title: 'Count'};
    this.idMap.set(sorted['id'], index - 1);
  }
}
