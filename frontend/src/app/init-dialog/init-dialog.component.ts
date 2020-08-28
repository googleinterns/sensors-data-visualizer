import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
//import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-init-dialog',
  templateUrl: './init-dialog.component.html',
  styleUrls: ['./init-dialog.component.css']
})
export class InitDialogComponent {
  maxSize: number;
  stdev: number;
  avg: number;

  constructor(private dialogRef: MatDialogRef<InitDialogComponent>) {}

  confirm() {
    console.log('max', this.maxSize);
    console.log('std value', this.stdev);
    console.log('avg value', this.avg);
    this.dialogRef.close({stdev: this.stdev, avg: this.avg});
  }
}
