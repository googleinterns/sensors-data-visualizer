import { Component, OnInit, Input } from '@angular/core';
import { UploadService } from '../upload.service'
import { PlotComponent } from '../plot/plot.component'

@Component({
  selector: 'app-dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.css']
})

export class DatasetComponent implements OnInit {
  
  panelOpenState: boolean
  message: string
  sample: any

  @Input()
  set _message(inputMessage: string){
    this.message = inputMessage
  }

  name = "test"
  constructor (private plot: PlotComponent, private sharedService: UploadService) { }

  ngOnInit(): void {
    console.log("Testyteststser")

  }

  public setSample(sample){
    this.sample = sample

    console.log("Sample attributes")
    console.log(this.sample.sensor_name)
    
  }

}
