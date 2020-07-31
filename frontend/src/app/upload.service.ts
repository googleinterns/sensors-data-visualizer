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

import { Injectable, ComponentFactoryResolver, ViewContainerRef, ComponentRef, EventEmitter, ViewChild, QueryList } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { BehaviorSubject } from 'rxjs'
import { DatasetComponent } from './dataset/dataset.component';

@Injectable({
  providedIn: 'root'
})
/**
 * UploadService handles communication with the backend.
 * When a response is received, it shares it to other components
 * through a shared message system.
 */
export class UploadService {
  serverUrl: string = "http://localhost:5000/upload"

  

  private message = new BehaviorSubject(null)
  sharedMessage = this.message.asObservable()

  constructor(private httpClient: HttpClient, private resolver: ComponentFactoryResolver) { }

  /**
   * Sends a POST request to the backend containing the files to be parsed.
   * @param formData The files the user selected in file system to upload.
   */
  public sendFormData(formData){
    return this.httpClient.post<any>(this.serverUrl, formData, {
      reportProgress: true,
      observe: 'events'
    })
  }

  /**
   * Updates the message field with new data. Any components that are subscribed
   * to the message will receive the new message.
   * @param message The data to be shared with any listening components.
   */
  public nextMessage(message: any){
    // this.message.next(message)

    if(message){
      var samples = []

      console.log("Upload Service msg: ", message)
      for(var i in message){
        samples.push(JSON.parse(message[i]))
      }


      this.message.next(samples)
    }
  }

  async loadDataset(plotRef: any, ref: ViewContainerRef, data){
    const { DatasetComponent } = await import('./dataset/dataset.component')

    let component: any = DatasetComponent

    const compRef: ComponentRef<DatasetComponent> = ref.createComponent(this.resolver.resolveComponentFactory(component))
    console.log("Loading dataset: ", data)
    const sample = JSON.parse(data[0])

    compRef.instance.setSample(sample)
    compRef.instance.setPlotRef(plotRef)
  }
}
