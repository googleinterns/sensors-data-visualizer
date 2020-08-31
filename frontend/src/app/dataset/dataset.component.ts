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
import {Component, ComponentRef} from '@angular/core';

// Project Imports.
import {PlotComponent} from '../plot/plot.component';
import {UploadService} from '../upload.service';

@Component({
  selector: 'app-dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.css'],
})
export class DatasetComponent {
  tabNumber: number;
  sample: any;
  plotRef: PlotComponent;
  containerRef: ComponentRef<DatasetComponent>;
  /**
   * A map from channel name/number to trace id.
   * I.E. ids.get('latencies') holds the trace id for latency data.
   */
  ids = new Map<any, number>();
  hasLatencies: boolean;
  panelOpenState = false;
  /**
   * Tracks which options menu is currently selected by the user.
   */
  currentOptions: any = null;
  /**
   * A map from data channel to slider type to boolean that is used to correctly
   * show the user which stats and channels are showing or not.
   * I.E. If the user has switched on channel 1 standard deviation then
   * currentShowing.get('1').get('stdev') is true.
   */
  currentShowing: Map<string, Map<string, boolean>> = new Map();
  isChecked = true;

  constructor(private sharedService: UploadService) {
    this.hasLatencies = false;
  }
  /**
   * Setter method to initialize the dataset with appropriate sample data.
   * @param sample The sample object received by UploadService from the backend.
   */
  public setSample(sample) {
    this.sample = sample;
    for (const i in sample.data) {
      this.ids.set(Number(i), sample.data[i][0]);
      this.currentShowing.set(
        i, // The data channel key.
        new Map([
          ['show', true], // Always initially shows channel data.
          ['stdev', false], // But a request is required to show stats, so these are false.
          ['avg', false],
        ])
      );
    }
    this.ids.set('ts_diff', sample.timestamp_diffs[0]);
    this.currentShowing.set(
      'ts_diff',
      new Map([
        ['show', false],
        ['stdev', false],
        ['avg', false],
      ])
    );

    if ('latencies' in sample) {
      this.hasLatencies = true;
      this.ids.set('latencies', sample.latencies[0]);
      this.currentShowing.set(
        'latencies',
        new Map([
          ['show', false],
          ['stdev', false],
          ['avg', false],
        ])
      );
    }
  }

  /**
   * Allows UploadService to pass in a reference to the PlotComponent being displayed.
   * @param ref A reference to the plot component that allows dataset to access the
   * methods and fields of the plot.
   */
  public setPlotRef(ref) {
    this.plotRef = ref;
  }

  /**
   * Initializes the dataset with a reference to itself. This enables
   * the dataset to self-destruct when needed.
   * @param ref A reference to this component.
   */
  public setContainerRef(ref: ComponentRef<DatasetComponent>) {
    this.containerRef = ref;
  }
  /**
   * Triggered when toggle on page is clicked. Calls the plot component toggleTrace method.
   * @param channel The channel of the trace to toggle.
   */
  toggleTrace(channel) {
    if (!(channel in this.ids.keys())) {
      console.log('channel not detected', channel);
      const data = {
        channels: {
          ts_diffs: this.sample.timestamp_diffs[1],
        },
      };
      for (const i in this.sample.data) {
        data.channels[i] = this.sample.data[i][1];
      }
      if (this.hasLatencies) {
        data.channels['latencies'] = this.sample.latencies[1];
      }
      console.log('sending to server....', data);
      this.sharedService.sendFormData(data, 'stats').subscribe((event: any) => {
        if (typeof event === 'object') {
          if (event.body !== undefined && event.body.type === 'stats') {
            for (const i in event.body.avgs) {
              this.plotRef.addTrace(
                this.sample.timestamps,
                event.body.avgs[i],
                -1,
                i + ' running avg',
                true
              );
            }
            // Plot Stdevs here.
          }
        }
      });
    } else {
      this.currentShowing
        .get(String(this.currentOptions))
        .set(channel, !this.currentOn(channel));
      this.plotRef.toggleTrace(this.ids.get(this.currentOptions));
    }
  }

  /**
   * Toggles hiding and showing the expansion menu for each channel.
   * @param channel The channel that was selected.
   */
  showOptions(channel) {
    //If the selected channel is clicked again, toggle panel hide
    if (channel === this.currentOptions) {
      this.panelOpenState = !this.panelOpenState;
      return;
    }
    if (this.currentOptions === null) {
      this.panelOpenState = true;
    }
    this.currentOptions = channel;
  }

  /**
   * Checks if a specific trace is currently on in the plot so that slide toggles are always
   * correctly shown as on or off.
   * @param channel The channel that is being checked. Either 'show', 'stdev', or 'avg'.
   */
  currentOn(channel) {
    return this.currentShowing.get(String(this.currentOptions)).get(channel);
  }

  openStyleOptions(){
    console.log('styling...');
    //Test change to line plot

  }
  /**
   * Removes all traces from plot and removes self from dataset list.
   */
  deleteDataset() {
    console.log('Deleting myself...', this.ids.values());
    this.plotRef.deleteDataset(new Set<number>(this.ids.values()));
    this.containerRef.destroy();
  }
}
