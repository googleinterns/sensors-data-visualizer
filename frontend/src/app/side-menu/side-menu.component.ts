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
import {UploadService} from '../upload.service';
import {UploadDirective} from '../upload.directive';
import {MainDashboardComponent} from '../main-dashboard/main-dashboard.component';

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

  files = [];
  message: any;

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    private breakpointObserver: BreakpointObserver,
    private sharedService: UploadService
  ) {}

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

    console.log(file);

    this.sharedService.sendFormData(formData).subscribe((event: any) => {
      if (typeof event === 'object') {
        if (event.body !== undefined) {
          const viewContainerRef = this.uploadDirective.viewContainerRef;
          const samples = [];

          for (const i in event.body) {
            const sample = JSON.parse(event.body[i]);
            samples.push(sample);
            this.sharedService.loadDataset(
              this.dashboard.plot,
              viewContainerRef,
              sample
            );
          }
          this.sharedService.nextMessage(samples);
        }
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
}
