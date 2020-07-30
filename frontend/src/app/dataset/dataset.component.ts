import { Component, OnInit, Input } from '@angular/core';
import { UploadService } from '../upload.service'

@Component({
  selector: 'app-dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.css']
})
export class DatasetComponent implements OnInit {
  
  message: string
  @Input()
  set _message(inputMessage: string){
    this.message = inputMessage
  }

  name = "test"
  constructor () { }

  ngOnInit(): void {
    console.log("Test")

  }

  public setName (name: string){
    this.name = name
  }
}
