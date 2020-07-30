import { Component, OnInit, Input } from '@angular/core';
import { UploadService } from '../upload.service'
import { MatExpansionModule } from '@angular/material/expansion'
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
  constructor (private plot: PlotComponent) { }

  ngOnInit(): void {
    console.log("Testyteststser")

  }

  public setSample(sample){
    this.sample = sample

    console.log("Sample attributes")
    console.log(this.sample.sensor_name)
    
  }

  toggle (channel: number) { 
    console.log(channel)
    this.plot.hideTrace(channel)
  }
}
