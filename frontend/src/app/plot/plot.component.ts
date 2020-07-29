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

import { Component, OnInit } from '@angular/core';
import { UploadService } from '../upload.service'

@Component({
  selector: 'app-plot',
  templateUrl: './plot.component.html',
  styleUrls: ['./plot.component.css']
})

/**
 * Handles the Plotly plot and the plots' data.
 */
export class PlotComponent implements OnInit {

  /**
   * plot_data is an array of maps that define what is plotted.
   * Each map defines a single plotly trace with possible options.
   * Trace options:
   *    x: Takes an array of x-axis values that correspond to the y-axis.
   *        Usually timestamps.
   *    y: Takes an array of y-axis values.
   *    (Note: The lengths of x and y must be equal.)
   *    type: How the data is displayed to the user. 'scattergl' and 'historgram'
   *      will most likely be the only types used. (Avoid 'scatter' type since is
   *      has poorer performance on large datasets than 'scattergl'.) 
   *    mode: Finer details for how to display the type. 'markers' displays only a dot
   *      for each datapoint. 'lines' displays a line through all datapoints. 'lines+markers'
   *      displays both.
   */
  plot_data = [ {x: [0], y: [0], type: 'scattergl', mode: 'markers'}]
  message: any
  constructor(private sharedService: UploadService) { }

  ngOnInit(): void {

    /**
     * Subscribe to the shared service so when a new dataset is loaded
     * it can be added to the plot.
     */
    this.sharedService.sharedMessage.subscribe(message => {
      console.log("Plot message received: ", message)

      for(var i in message){
        console.log(message[i])
        this.plot_data.push(
          {x: message[i].timestamps, y: message[i].data[0], type: 'scattergl', mode: 'markers' }
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
