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

  constructor() {}
  toggleShapes(mode: string) {
    this.plotRef.toggleMarkerStyle(this.traceID, mode);
  }
  showOptions(mode: string) {
    console.log('mode: ', mode);
    this.panelOpenState = true;
    this.currentOptions = mode;

    if (mode === 'lines' || mode === 'markers') {
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
      case 'line':
        return this.currentOptions === 'lines';
      case 'histogram':
        return this.currentOptions === 'histogram';
    }
  }
}
