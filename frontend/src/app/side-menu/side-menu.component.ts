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

import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { UploadService } from '../upload.service'

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.css']
})
/**
 * SideMenu defines the collapsible navigation menu on the left side.
 * The component also uses the UploadService to send files to the backend
 * when the upload file button is clicked. 
 */
export class SideMenuComponent {

  @ViewChild("fileUpload", {static: false}) fileUpload: ElementRef
  files = []
  message: any

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver, private sharedService: UploadService) {}

  /**
   * The upload button onClick function.
   * Uses the UploadService to send the formData then
   * when a response arrives uses UploadService to 
   * share the response with other listening components.
   * @param file The file to send to the backend.
   */
  sendFile(file){
    const formData = new FormData()
    formData.append('file', file.data)
    file.inProgress = true

    console.log(file)

    this.sharedService.sendFormData(formData).subscribe((event: any) => {
      if(typeof (event) === 'object'){

        if(event.body != undefined){
          this.sharedService.nextMessage(event.body)
        }
      }
    })
  }

  /**
   * A helper method to send all files collected to the backend.
   */
  private sendFiles(){
    this.fileUpload.nativeElement.value = ''
    this.files.forEach(file => {
      this.sendFile(file)
    })
  }

  /**
   * Collects all files selected by the users and invokes sendFiles()
   * to send them to the backend.
   */
  uploadFiles(){
    const fileUpload = this.fileUpload.nativeElement
    console.log(fileUpload)
    fileUpload.onchange = () => {
      for(let index = 0; index < fileUpload.files.length; index++){
        const file = fileUpload.files[index]
        this.files.push({data: file, inProgress: false, progress: 0})
      }
      this.sendFiles()
    }
    fileUpload.click()
  }

}
