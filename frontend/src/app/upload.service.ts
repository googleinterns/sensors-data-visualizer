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
import {BehaviorSubject} from 'rxjs';

// Project Imports
import {DatasetComponent} from './dataset/dataset.component';

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
   */
  serverUrl = 'http://localhost:5000/';

  private message = new BehaviorSubject(null);
  sharedMessage = this.message.asObservable();

  constructor(
    private httpClient: HttpClient,
    private resolver: ComponentFactoryResolver
  ) {}

  /**
   * Sends a POST request to the backend containing the files to be parsed.
   * @param formData The files the user selected in file system to upload.
   */
  public sendFormData(formData, route) {
    return this.httpClient.post<any>(this.serverUrl + route, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }

  /**
   * Updates the message field with new samples. Any components that are subscribed
   * to the message will receive the new samples.
   * @param samples The samples to be shared with any listening components.
   */
  public nextMessage(samples: any) {
    this.message.next(samples);
  }

  /**
   * Creates a dataset component and inserts it into the page at ref.
   * Called by side-menu.component inside sendFile(file) when a server response is received.
   * @param plotRef A reference to the plot component so that the datase is eventually able to access it.
   * @param ref A reference to the side-menu component so that the new dataset can be added to it.
   * @param data The sample object this dataset will store.
   */
  async loadDataset(
    tabNumber: number,
    plotRef: any,
    ref: ViewContainerRef,
    data
  ) {
    const {DatasetComponent} = await import('./dataset/dataset.component');
    const component: any = DatasetComponent;
    const compRef: ComponentRef<DatasetComponent> = ref.createComponent(
      this.resolver.resolveComponentFactory(component)
    );

    compRef.instance.tabNumber = tabNumber;
    compRef.instance.setSample(data);
    compRef.instance.setPlotRef(plotRef);
    compRef.instance.setContainerRef(compRef);
  }
}
