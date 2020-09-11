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
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Component, ViewChild, ElementRef} from '@angular/core';
import {Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';

// Project Imports.
import {MainDashboardComponent} from '../main-dashboard/main-dashboard.component';
import {UploadDirective} from '../upload.directive';
import {UploadService} from '../upload.service';

import {IdManagerService} from '../id-manager.service';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.css'],
})

/**
 * SideMenu defines the collapsible navigation menu on the left side.
 * The component also uses the UploadService to send files to the backend
 * when the upload file button is clicked.
 */
export class SideMenuComponent {
  @ViewChild(UploadDirective, {static: true}) uploadDirective: UploadDirective;
  // Provides a reference to the file upload button.
  @ViewChild('fileUpload', {static: false}) fileUpload: ElementRef;
  // Provides a reference to the MainDashboardComponent.
  @ViewChild(MainDashboardComponent, {static: true})
  dashboard: MainDashboardComponent;
  @ViewChild('checkBox') checkBox;

  files = [];
  showNormalize = false;
  normalizationX = false;
  normalizationY = false;
  message: any;
  datasets = [];
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    private breakpointObserver: BreakpointObserver,
    private sharedService: UploadService,
    private idMan: IdManagerService
  ) {
    this.sharedService.sharedMessage.subscribe((event: any) => {
      if (typeof event === 'object' && event !== null) {
        switch (event.type) {
          case 'stats': {
            break;
          }
          case 'upload': {
            // Plot new datasets added by the upload button.
            const tabNumber = this.dashboard.currentTab;
            const viewContainerRef = this.uploadDirective.viewContainerRef;
            const samples = [];
            const plotRef = this.dashboard.plot.toArray()[tabNumber];
            const parsed = JSON.parse(event.data);

            for (const i in parsed) {
              let sample = JSON.parse(parsed[i]);
              sample = this.idMan.assignIDs(sample);
              samples.push(sample);

              this.sharedService
                .loadDataset(
                  tabNumber,
                  this.dashboard,
                  viewContainerRef,
                  sample
                )
                .then(ref => {
                  this.datasets.push(ref);
                  this.normalizationX ? ref.normalizeX(true) : null;
                  this.normalizationY ? ref.normalizeY(true) : null;
                });
            }
            plotRef.addSamples(samples);
            break;
          }
          // To add new possible features, add a route to backend/server.py
          // and add a case statement here matching the name of that route.
        }
      }
    });
  }

  /**
   * sendFile(file) is called when the user presses the upload button.
   * Uses the UploadService to send the formData then
   * when a response arrives uses UploadService to
   * share the response with other listening components.
   * The message shared is an array of Sample objects.
   * @param file The file to send to the backend.
   */
  sendFile(file) {
    const formData = new FormData();
    formData.append('file', file.data);
    file.inProgress = true;

    this.sharedService
      .sendFormData(formData, '/upload')
      .subscribe((event: any) => {
        if (
          typeof event === 'object' &&
          event.body !== undefined &&
          event.body.type === 'upload'
        ) {
          this.sharedService.nextMessage(event.body);
        }
      });
  }

  /**
   * A helper method to send all files collected to the backend.
   */
  private sendFiles() {
    this.fileUpload.nativeElement.value = '';
    this.files.forEach(file => {
      this.sendFile(file);
    });
  }

  /**
   * Collects all files selected by the users and invokes sendFiles()
   * to send them to the backend.
   */
  uploadFiles() {
    const fileUpload = this.fileUpload.nativeElement;
    if (this.checkBox.checked) {
      this.dashboard.newTab();
    }

    fileUpload.onchange = () => {
      for (let index = 0; index < fileUpload.files.length; index++) {
        const file = fileUpload.files[index];
        this.files.push({data: file, inProgress: false, progress: 0});
      }
      this.sendFiles();
    };
    fileUpload.click();

    this.files = [];
  }

  /**
   * Triggers a x-normalization of all datasets contained in the app.
   * @param event Contains the status of the frontend slide toggle.
   */
  normalizeX(event) {
    this.normalizationX = event.checked ? true : false;
    this.datasets.forEach(dataset => dataset.normalizeX(event.checked));
  }

  /**
   * Triggers a y-normalization of all datasets contained in the app.
   * @param event Contains the status of the frontend slide toggle.
   */
  normalizeY(event) {
    this.normalizationY = event.checked ? true : false;
    this.datasets.forEach(dataset => dataset.normalizeY(event.checked));
  }

  /**
   * Opens and closes the normalization options menu on the frontend.
   */
  toggleOptions() {
    this.showNormalize = !this.showNormalize;
  }

  /**
   * Used by html to determine if the 'normalize options'
   * button should be shown.
   */
  dataAdded() {
    return this.datasets.length > 0;
  }
}
