import { Component, OnInit } from '@angular/core';
import { UploadService } from '../upload.service'

@Component({
  selector: 'app-plot',
  templateUrl: './plot.component.html',
  styleUrls: ['./plot.component.css']
})
export class PlotComponent implements OnInit {

  plot_data = [ {x: [1, 2], y: [1, 2]}]
  message: any
  constructor(private sharedService: UploadService) { }

  ngOnInit(): void {
    this.sharedService.sharedMessage.subscribe(message => {
      if(message){
        this.message = message
        console.log("New Message: ", this.message)

        // Parse message for datasets.
        var samples = []

        for(var i in this.message){
          console.log(this.message[i])
          samples.push(JSON.parse(this.message[i]))
        }

        console.log(samples)
        this.plot_data = [ {x: samples[0].timestamps, y: samples[0].data[0] }]
      }
    })

  }

}
