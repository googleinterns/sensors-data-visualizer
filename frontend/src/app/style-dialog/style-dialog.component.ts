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

  constructor() {}
  showOptions(mode: string) {
    console.log('mode: ', mode);
    this.panelOpenState = true;
    this.currentOptions = mode;
  }
  currentOn(mode: string) {
    switch (mode) {
      case 'toggle_buttons':
        return this.currentOptions === 'line' ||
          this.currentOptions === 'scatter'
          ? true
          : false;
      case 'line':
        return this.currentOptions === 'line';
      case 'histogram':
        return this.currentOptions === 'histogram';
    }
  }
}
