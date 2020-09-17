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
import {
  ComponentFactoryResolver,
  ComponentRef,
  Injectable,
  ViewContainerRef,
} from '@angular/core';
import {HttpClient} from '@angular/common/http';

// Project Imports
import {DatasetComponent} from './dataset/dataset.component';
import {MainDashboardComponent} from './main-dashboard/main-dashboard.component';

@Injectable({
  providedIn: 'root',
})
/**
 * UploadService handles communication with the backend.
 * When a response is received, it shares it to other components
 * through a shared message system.
 */
export class UploadService {
  /**
   * @param serverUrl The location of the backend parser server. Default when running
   * locally is localhost:5000/upload since Flask runs on port 5000.
   * This is the only place in the frontend where serverUrl needs to be specified.
   */
  serverUrl = 'http://localhost:5000/';

  constructor(
    private httpClient: HttpClient,
    private resolver: ComponentFactoryResolver
  ) {}

  /**
   * Sends a POST request to the backend containing the files to be parsed.
   * @param formData The files the user selected in file system to upload.
   * @param route The server route to send formData to. this.serverUrl + route
   * will be sent a POST request. Omit '/' from the route.
   */
  public sendFormData(formData, route) {
    return this.httpClient.post<any>(this.serverUrl + route, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }
  /**
   * Creates a dataset component and inserts it into the page at ref.
   * Called by side-menu.component inside sendFile(file) when a server response is received.
   * @param tabNumber: The tab where the primary data for this dataset is plotted.
   * @param dashboard A reference to the main dashboard so that new tabs can be created
   *  and plots can be accessed.
   * @param ref A reference to the side-menu component so that the new dataset can be added.
   * @param data The sample object this dataset will store.
   */
  async loadDataset(
    tabNumber: number,
    dashboard: MainDashboardComponent,
    ref: ViewContainerRef,
    data
  ) {
    const component: any = DatasetComponent;
    const compRef: ComponentRef<DatasetComponent> = ref.createComponent(
      this.resolver.resolveComponentFactory(component)
    );
    compRef.instance.initDataset(tabNumber, data, dashboard, compRef);
    return compRef.instance;
  }
}
