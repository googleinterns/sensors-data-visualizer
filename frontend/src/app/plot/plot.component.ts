import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-plot',
  templateUrl: './plot.component.html',
  styleUrls: ['./plot.component.css']
})
export class PlotComponent implements OnInit {

  plot_data = [ {x: [1, 2], y: [1, 2]}]

  constructor() { }

  ngOnInit(): void {
  }

}
