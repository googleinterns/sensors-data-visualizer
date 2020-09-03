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
   *      removed, altered, or referenced in some way.
   *    visible: If true, the trace will show up. If false, the trace is invisible.
   *    name: The trace name displayed to the user.
   *    xbins: The size of the buckets in the histogram if type === 'histogram' TODO
   */
  plot_data = [
    {
      x: [0],
      y: [0],
      type: 'scattergl',
      mode: 'markers',
      marker: {symbol: 'diamond'},
      id: 0,
      visible: true,
      name: 'Placeholder Point',
      xbins: null,
    },
  ];

  /**
   * Plot configurations.
   * hovermode must be set to closest. closest mode selects only
   * a single trace on hover, rather than every trace in
   * a dataset which would happen if hovermode was not specified.
   * Selecting a single trace allows for the options menu to know
   * which trace is being changed.
   */
  plot_layout = {
    title: 'Add a new dataset.',
    legend: 'false',
    hovermode: 'closest',
  };
  plot_config = {scrollZoom: true, displayModeBar: true};
  message: any;

  // A map from id number to array index that will speed up toggle operations.
  idMap = new Map<number, number>();
  selfRef;
  constructor(private dialog: MatDialog) {}

  /**
   * Save a reference to self when created. This self reference is used when
   * opening the plot options menu so that the menu can directly change the plot.
   * @param ref A reference to this component.
   */
  public setSelfRef(ref) {
    this.selfRef = ref;
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
      throw error('x and y arrays must match in length');
    }

    this.plot_data.push({
      x: x,
      y: y,
      type: 'scattergl',
      mode: 'markers',
      marker: {symbol: 'circle'},
      id: id,
      visible: show,
      name: name,
      xbins: null,
    });

    this.idMap.set(id, this.plot_data.length - 1);
  }

  /**
   * Adds a set of samples to this plot.
   * @param samples
   */
  public addSamples(samples) {
    // This will only be true when no data has been added yet.
    // Removes the placeholder datapoint and title.
    console.log('plot addtrace: ', samples);
    if (this.plot_data.length === 1 && this.plot_data[0].id === 0) {
      this.plot_data.pop();
      this.plot_layout.title = '';
    }

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
   * Opens the style options menu dialog.
   * @param event The result of the click event generated by plotly.
   *  event.points gives the information for the clicked point.
   */
  async styleOptions(event) {
    await this.showOptionsMenu(event.points[0].data.id);
  }

  /**
   * Opens the StyleDialogComponent menu.
   * @param traceID Which trace was clicked by the user.
   */
  showOptionsMenu(traceID: number) {
    return new Promise(resolve => {
      const optionsRef = this.dialog.open(StyleDialogComponent);
      optionsRef.componentInstance.init(traceID, this.selfRef);
      optionsRef.afterClosed().subscribe(options => {
        resolve(options);
      });
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
      trace.marker.symbol = mode;
    }
  }

  /**
   * Changes the type of plot to a histogram.
   * @param traceID The ID of the trace to change.
   */
  toggleHistogram(traceID: number) {
    this.plot_data[this.idMap.get(traceID)].type = 'histogram';
    //TODO bin sizes
  }

  changeColor(traceID: number, r: number, g: number, b: number) {
    this.plot_data[this.idMap.get(traceID)].marker['color'] =
      'rgb(' + r + ', ' + g + ', ' + b + ')';
  }
}
