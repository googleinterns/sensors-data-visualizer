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
import {UploadService} from '../upload.service';
import {IdManagerService} from '../id-manager.service';
import {MainDashboardComponent} from '../main-dashboard/main-dashboard.component';
import {InitDialogComponent} from '../init-dialog/init-dialog.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.css'],
})
export class DatasetComponent {
  /**
   * Tracks the tabs where data for this dataset is located.
   * tabNumbers[0] holds the tab where standard data is located.
   * tabNumbers[1] holds the tab where statistics data is located.
   */
  tabNumbers: number[];
  sample: any;
  /**
   * A reference to the main dashboard that allows this data set to
   * access any plot and create new tabs on its own, without help from
   * the side-menu component.
   */
  dashboard: MainDashboardComponent;
  containerRef: ComponentRef<DatasetComponent>;
  /**
   * A map from channel name/number to trace id.
   * I.E. ids.get('latencies') holds the trace id for latency data.
   */
  ids = new Map<string, number>();
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

  /**
   * normalizationX[0] = If this dataset is currently normalized on x-axis.
   * normalizationX[1] = The original Timestamp 0 for the array so
   *  that it can be converted back and forth.
   */
  normalizationX = [false, -1];
  normalizationY = false;

  constructor(
    private sharedService: UploadService,
    private idMan: IdManagerService,
    private dialog: MatDialog
  ) {
    this.hasLatencies = false;
  }

  /**
   * Setter method to initialize the dataset with appropriate sample data.
   * @param sample The sample object received by UploadService from the backend.
   */
  public setSample(sample) {
    this.sample = sample;
    for (const i in sample.data) {
      this.ids.set(i, sample.data[i]['id']);
      this.currentShowing.set(
        i, // The data channel key.
        new Map([
          ['show', true], // Always initially shows channel data.
          ['stdev', false], // But a request is required to show stats, so these are false.
          ['avg', false],
        ])
      );
    }
    this.ids.set('ts_diff', sample.timestamp_diffs['id']);
    this.currentShowing.set(
      'ts_diffs',
      new Map([
        ['show', false],
        ['stdev', false],
        ['avg', false],
      ])
    );

    if ('latencies' in sample) {
      this.hasLatencies = true;
      this.ids.set('latencies', sample.latencies['id']);
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
   * Initializes the dataset with a reference to the main dashboard.
   * This enables the dataset to create new tabs and access any plots.
   * @param ref A reference to the main dashboard.
   */
  public setDashboardRef(ref) {
    this.dashboard = ref;
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
   * Opens the dialog and waits for a user response.
   * Returns periods, which is false if the user clicked cancel,
   * or {stdev: number, avg: number} if the user input valid values.
   * @param maxSize The length of the dataset. User cannot define a period
   *  larger than this.
   */
  openDialog(maxSize: number) {
    return new Promise(resolve => {
      const dialogRef = this.dialog.open(InitDialogComponent);
      dialogRef.componentInstance.maxSize = maxSize;
      dialogRef.afterClosed().subscribe((periods: any) => {
        resolve(periods);
      });
    });
  }

  /**
   * Triggered when toggle on page is clicked. Calls the plot component toggleTrace method.
   * @param channel The channel of the trace to toggle.
   */
  async toggleTrace(channel) {
    const toggleStats = channel === 'avg' || channel === 'stdev';
    // If toggling stats data that hasn't been requested yet.
    if (toggleStats && this.tabNumbers[1] === -1) {
      const periods: any = await this.openDialog(this.sample.timestamps.length);
      // If the user cancels.
      if (periods === false) {
        this.currentShowing
          .get(String(this.currentOptions))
          .set(channel, false);
        return;
      }
      this.tabNumbers[1] = this.dashboard.newTab();
      // Package data to send to the backend.
      const data = {
        avg_period: periods.avg,
        stdev_period: periods.stdev,
        channels: {
          ts_diffs: this.sample.timestamp_diffs['arr'],
        },
      };
      for (const i in this.sample.data) {
        data.channels[i] = this.sample.data[i]['arr'];
      }
      if (this.hasLatencies) {
        data.channels['latencies'] = this.sample.latencies['arr'];
      }
      this.requestStats(data, channel);
    } else {
      const tab = channel === 'stdev' ? this.tabNumbers[1] : this.tabNumbers[0];
      const id = toggleStats
        ? channel + this.currentOptions
        : String(this.currentOptions);

      this.dashboard.plot.toArray()[tab].toggleTrace(this.ids.get(id));

      this.currentShowing
        .get(String(this.currentOptions))
        .set(channel, !this.currentOn(channel));
    }
  }

  /**
   * Handles all needed operations for requesting stats from the backend
   * including sending a POST, and receiving and plotting the data.
   * @param data The traces to send to the backend for which
   *  stats will be computed.
   * @param channel The data channel for which the stats were requested.
   */
  requestStats(data, channel) {
    console.log('sending to server....', data);
    this.sharedService.sendFormData(data, 'stats').subscribe((event: any) => {
      if (/*eslint-disable*/
          typeof event === 'object' &&
          event.body !== undefined &&
          event.body.type === 'stats'
      ) { /*eslint-enable */
        const plots = [
          this.dashboard.plot.toArray()[this.dashboard.currentTab - 1], // Tab for avgs
          this.dashboard.plot.toArray()[this.dashboard.currentTab], // Tab for stdevs.
        ];

        for (const i in event.body.avgs) {
          const avg_id = this.idMan.assignSingleID(event.body.avgs[i]);
          const stdev_id = this.idMan.assignSingleID(event.body.stdevs[i]);
          this.ids.set('avg' + i, avg_id);
          this.ids.set('stdev' + i, stdev_id);

          plots[0].addTrace(
            this.sample.timestamps,
            event.body.avgs[i],
            avg_id,
            i + ' running avg',
            false
          );
          plots[1].addTrace(
            this.sample.timestamps,
            event.body.stdevs[i],
            stdev_id,
            i + ' stdev',
            false
          );
          this.currentShowing
            .get(String(this.currentOptions))
            .set(channel, true);
        }
        // Turn on the plot that the user requested.
        plots[channel === 'avg' ? 0 : 1].toggleTrace(
          this.ids.get(channel + this.currentOptions)
        );
      }
    });
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

  /**
   * Removes all traces from plot and removes self from dataset list.
   */
  deleteDataset() {
    console.log('Self destructing...', this.ids.values());
    this.dashboard.plot
      .toArray()
      [this.tabNumbers[0]].deleteDataset(new Set<number>(this.ids.values()));
    this.containerRef.destroy();
  }

  /**
   * Normalizes this datasets timestamps and sends the update to
   * the plot component to be displayed to the user.
   * @param toggle The status of the frontend slide toggle.
   */
  normalizeX(toggle: boolean) {
    if (toggle === this.normalizationX[0]) {
      return;
    }
    const plot = this.dashboard.plot.toArray()[this.tabNumbers[0]];
    // If currently normalized, de-normalize.
    if (this.normalizationX[0]) {
      this.normalizationX[0] = false;
      plot.normalizeX(Array.from(this.ids.values()), this.normalizeXHelper(1));
    } else {
      this.normalizationX = [true, Number(this.sample.timestamps[0])];
      plot.normalizeX(Array.from(this.ids.values()), this.normalizeXHelper(-1));
    }
  }

  /**
   * Handles the addition or subtraction needed to normalize timestamps.
   * @param toggle Operand that determines if the timestamps are being
   *  normalized or de-normalized. If toggle == -1, the helper will normalize
   *  the timestamps, if toggle == 1, it will de-normalize.
   */
  normalizeXHelper(toggle: number) {
    const new_timestamps = new Array<number>(this.sample.timestamps.length);
    for (let i = 0; i < new_timestamps.length; i++) {
      new_timestamps[i] =
        this.sample.timestamps[i] + Number(this.normalizationX[1]) * toggle;
    }
    return new_timestamps;
  }

  /**
   * Normalizes the Y-axis for all traces in this sample between [-1, 1].
   * Math source at:
   * https://stats.stackexchange.com/questions/178626/how-to-normalize-data-between-1-and-1
   * @param toggle The status of the frontend slide toggle.
   */
  normalizeY(toggle: boolean) {
    if (toggle === this.normalizationY) {
      return;
    }
    const plot = this.dashboard.plot.toArray()[this.tabNumbers[0]];
    this.normalizationY = !this.normalizationY;
    for (const i in this.sample.data) {
      const new_data = new Array<number>(this.sample.data[0]['arr'].length);
      const [min, max] = this.sample.data[i]['minmax'];

      this.normalizeYHelper(i, toggle, new_data, min, max);
      plot.normalizeY(this.sample.data[i]['id'], new_data);
    }
  }

  /**
   * Iterates over a data channel, (de)normalizing it and filling the new_data
   * array with values.
   * @param i The channel of this.sample.data to iterate over.
   * @param normalize Whether to normalize or denormalize.
   * @param new_data The new array to fill with values.
   * @param min The minimum value in the trace.
   * @param max The maximum value in the trace.
   */
  normalizeYHelper(
    i: string,
    normalize: boolean,
    new_data: Array<number>,
    min: number,
    max: number
  ) {
    // Edge case where a straight line trace would cause a divide by 0.
    if (min === max) {
      if (min === 0) {
        new_data.fill(0);
      } else if (normalize) {
        new_data.fill(min >= 0 ? 1 : -1);
      } else {
        new_data.fill(min);
      }
      this.sample.data[i]['arr'] = new_data;
      return;
    }

    this.sample.data[i]['arr'].forEach((value, index) => {
      if (normalize) {
        new_data[index] = 2 * ((value - min) / (max - min)) - 1;
      } else {
        new_data[index] = (max - min) * ((value + 1) / 2) + min;
      }
    });
    this.sample.data[i]['arr'] = new_data;
  }
}
