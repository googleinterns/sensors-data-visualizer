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

  //@ViewChild(UploadDirective, { static: true }) uploadDirective: UploadDirective

  /**
   * plot_data is an array of maps that define what is plotted.
   * It is initialized with (0,0) point so that the plot appears when the page is opened.
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
  plot_data = [ {x: [0], y: [0], type: 'scattergl',
   mode: 'markers', id: 0, visible: 'true',
   name: 'Placeholder Point'
  }]

  // Plot Configurations.
  plot_layout = { title: 'Add a new dataset.', legend: 'false' }//, height:5000, width: 500  }
  plot_config = { scrollZoom: true, displayModeBar: true}
  
  message: any
  constructor (private sharedService: UploadService) { }

  ngOnInit (): void {
    /**
     * Subscribe to the shared service so when a new dataset is loaded
     * it can be added to the plot.
     */
    this.sharedService.sharedMessage.subscribe (message => {
      if (message) {

        // This will only be true when no data has been added yet.
        // Removes the placeholder datapoint and title.
        if (this.plot_data.length == 1 && this.plot_data[0].id == 0) {
          this.plot_data.pop()
          this.plot_layout.title = ""
        }

        for (var i in message) {
        
          // Plot each individual data channel.
          for (var j in message[i].data) {
            this.plot_data.push(
              {x: message[i].timestamps, y: message[i].data[j],
              type: 'scattergl', mode: 'markers', id: Number(j), 
              visible: 'true', name: j + " " + message[i].sensor_name
              }
            ) 
          }

        }
     }
    })

  }

  /**
   * Called by dataset.component button to toggle a trace.
   * @param id The id of the trace to toggle on/off.
   */
  toggleTrace (id: number){
    this.plot_data.forEach(obj => {
      if(obj.id === id){
        if(obj.visible === 'true'){ obj.visible = 'legendonly' }
        else { obj.visible = 'true' }
      }
    })
  }

  

}
