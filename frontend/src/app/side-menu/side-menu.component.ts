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
export class SideMenuComponent implements OnInit{

  @ViewChild("fileUpload", {static: false}) fileUpload: ElementRef
  files = []
  message: any

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver, private sharedService: UploadService) {}

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


  private sendFiles(){
    this.fileUpload.nativeElement.value = ''
    this.files.forEach(file => {
      this.sendFile(file)
    })
  }

  uploadFiles(){
    const fileUpload = this.fileUpload.nativeElement
    console.log("Line38")
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

  ngOnInit(){
    this.sharedService.sharedMessage.subscribe(message => this.message = message)
  }

}
