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
      this.ids.set(i, sample.data[i][0]);
      this.currentShowing.set(
        i, // The data channel key.
        new Map([
          ['show', true], // Always initially shows channel data.
          ['stdev', false], // But a request is required to show stats, so these are false.
          ['avg', false],
        ])
      );
    }
    this.ids.set('ts_diffs', sample.timestamp_diffs[0]);
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
        console.log('data', periods);
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
        console.log(this.currentOptions, channel);
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
          ts_diffs: this.sample.timestamp_diffs[1],
        },
      };
      for (const i in this.sample.data) {
        data.channels[i] = this.sample.data[i][1];
      }
      if (this.hasLatencies) {
        data.channels['latencies'] = this.sample.latencies[1];
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
      if (
        typeof event === 'object' &&
        event.body !== undefined &&
        event.body.type === 'stats'
      ) {
        console.log('DS received: ', event.body);
        const plots = [
          this.dashboard.plot.toArray()[this.dashboard.currentTab - 1], // Tab for avgs
          this.dashboard.plot.toArray()[this.dashboard.currentTab], // Tab for stdevs.
        ];

        for (const i in event.body.avgs) {
          const avg_id = this.idMan.assignSingleID();
          const stdev_id = this.idMan.assignSingleID();
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
    console.log('Deleting myself...', this.ids.values());
    this.dashboard.plot
      .toArray()
      [this.tabNumbers[0]].deleteDataset(new Set<number>(this.ids.values()));
    this.containerRef.destroy();
  }
}
