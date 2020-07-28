import { Component, OnInit } from '@angular/core';
import { UploadService } from '../upload.service'

@Component({
  selector: 'app-plot',
  templateUrl: './plot.component.html',
  styleUrls: ['./plot.component.css']
})
export class PlotComponent implements OnInit {

  plot_data = [ {x: [0], y: [0], type: 'scattergl'}]
  message: any
  constructor(private sharedService: UploadService) { }

  ngOnInit(): void {
    this.sharedService.sharedMessage.subscribe(message => {
      console.log("Plot message received: ", message)

      for(var i in message){
        console.log(message[i])
        this.plot_data.push(
          {x: message[i].timestamps, y: message[i].data[0], type: 'scattergl' }
        )
      }
      // if(message){
      //   this.message = message
      //   console.log("New Message: ", this.message)

      //   // Parse message for datasets.
      //   var samples = []

      //   for(var i in this.message){
      //     console.log(this.message[i])
      //     samples.push(JSON.parse(this.message[i]))
      //   }

      //   console.log(samples)
      //   this.plot_data = [ {x: samples[0].timestamps, y: samples[0].data[0], type: 'scattergl' }]
      // }
    })

  }

}
