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
import {Component, ViewChildren, QueryList, AfterViewInit} from '@angular/core';

// Project Imports.
import {PlotComponent} from '../plot/plot.component';
import {MatTab} from '@angular/material/tabs';

@Component({
  selector: 'app-main-dashboard',
  templateUrl: './main-dashboard.component.html',
  styleUrls: ['./main-dashboard.component.css'],
})
export class MainDashboardComponent implements AfterViewInit {
  // Selects the plot component present on the page. Allows the grandparent component (side-menu)
  // to access the plot that is a child of this component.
  @ViewChildren(PlotComponent) plot: QueryList<PlotComponent>;
  @ViewChildren(MatTab) tabQueryList: QueryList<MatTab>;
  currentTab = 0;
  // Tracked by the *ngFor loop in main-dashboard.html to create/remove tabs.
  tabs = ['No Data Added'];

  constructor() {}

  /**
   * Saves a reference to the initial plot component after initialization.
   */
  ngAfterViewInit() {
    this.plot.first.setSelfRef(this.plot.first, false);
  }
  /**
   * Creates a new tab by pushing the name of the tab to this.tabs.
   * When a new item is added to this.tabs, the html will add a new tab.
   * Also updates this.currentTab so that the new data is plotted in the new tab.
   * @param title The name of the tab.
   */
  public newTab(title: string) {
    this.tabs.push(title);
    this.currentTab = this.tabs.length - 1;
    this.tabQueryList.changes.subscribe(() => {
      this.plot
        .toArray()
        [this.currentTab].setSelfRef(this.plot.toArray()[this.currentTab], true);
    });
    return this.currentTab;
  }

  /**
   * Changes the currentTab when the user selects a different tab.
   * @param event The MatTabChangeEvent that is emitted when the user
   * selects a new tab. The index field is the index of the tab selected.
   */
  switchTab(event) {
    this.currentTab = event.index;
    this.plot.toArray()[this.currentTab].forceResize();
  }
}
