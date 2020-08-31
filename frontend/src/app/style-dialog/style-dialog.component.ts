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

  /**
   * Initialized the dialog component with the traceID and plot
   * information needed. Also determines which styles are already
   * applied and displays that to the user.
   * @param traceID The ID of the trace to change.
   * @param ref A reference to the plot where the trace lives
   *  so that its options can be changed.
   */
  init(traceID: number, ref) {
    this.traceID = traceID;
    this.plotRef = ref;
    this.panelOpenState = true;

    const trace = this.plotRef.plot_data[this.plotRef.idMap.get(traceID)];
    if (trace.type === 'scattergl') {
      if (trace.mode === 'lines+markers') {
        this.currentOptions = 'lines';
        this.currentChecked = ['lines', trace.marker.symbol];
      } else if (trace.mode === 'lines') {
        this.currentOptions = 'lines';
        this.currentChecked = ['lines', 'none'];
      } else {
        this.currentOptions = 'markers';
        this.currentChecked = ['markers', trace.marker.symbol];
      }
    } else {
      this.currentOptions = 'histogram';
      this.currentChecked = ['histogram', null];
    }
    this.traceName = trace.name;
  }

  /**
   * Click event for a user to change the shape of markers in the plot.
   * @param mode What to switch the marker style to.
   */
  toggleShapes(mode: string) {
    this.plotRef.toggleMarkerStyle(this.traceID, mode);
  }

  /**
   * Handles switching the plot from scatter, line, histogram.
   * @param mode What to switch the plot mode to.
   */
  showOptions(mode: string) {
    this.currentOptions = mode;

    if (mode === 'lines') {
      this.plotRef.toggleLineStyle(this.traceID, mode + '+markers');
    } else if (mode === 'markers') {
      this.plotRef.toggleLineStyle(this.traceID, mode);
    } else {
      this.plotRef.toggleHistogram(this.traceID);
    }
  }

  /**
   * Displays the correct options menu in the UI.
   * @param mode Which options to display.
   */
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

  /**
   * Determines which toggle buttons on the frontend are already on.
   * @param index The level of options. If 0, a top level option
   *  such as 'markers', 'lines', or 'histograms'. If 1, a sub option
   *  such as 'circles'
   * @param mode The option.
   */
  checked(index: number, mode: string) {
    return this.currentChecked[index] === mode;
  }
}
