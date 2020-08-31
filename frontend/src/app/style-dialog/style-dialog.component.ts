import {Component} from '@angular/core';

@Component({
  selector: 'app-style-dialog',
  templateUrl: './style-dialog.component.html',
  styleUrls: ['./style-dialog.component.css']
})
export class StyleDialogComponent {
  traceName: string;
  panelOpenState = false;
  currentOptions: any = null;
  traceID: number;
  plotRef;
  currentChecked;

  constructor() {}
  init(traceID: number, ref) {
    this.traceID = traceID;
    this.plotRef = ref;
    this.panelOpenState = true;

    const trace = this.plotRef.plot_data[this.plotRef.idMap.get(traceID)];
    if (trace.type === 'scattergl') {
      if (trace.mode === 'lines+markers') {
        this.currentOptions = 'lines';
        this.currentChecked = ['lines', trace.marker.symbol];
      } else {
        this.currentOptions = 'markers';
        this.currentChecked = ['markers', trace.marker.symbol];
      }
    } else {
      this.currentOptions = 'histogram';
      this.currentChecked = ['histogram', null];
    }
    console.log('init current on', this.currentChecked, this.currentOptions);
  }

  toggleShapes(mode: string) {
    this.plotRef.toggleMarkerStyle(this.traceID, mode);
  }
  showOptions(mode: string) {
    console.log('mode: ', mode);
    //this.panelOpenState = true;
    this.currentOptions = mode;

    if (mode === 'lines') {
      this.plotRef.toggleLineStyle(this.traceID, mode + '+markers');
    } else if (mode === 'markers') {
      this.plotRef.toggleLineStyle(this.traceID, mode);
    } else {
      this.plotRef.toggleHistogram(this.traceID);
    }
  }
  currentOn(mode: string) {
    switch (mode) {
      case 'toggle_buttons':
        return this.currentOptions === 'lines' ||
          this.currentOptions === 'markers'
          ? true
          : false;
      case 'lines':
        return this.currentOptions === 'lines';
      case 'histogram':
        return this.currentOptions === 'histogram';
    }
  }
}
