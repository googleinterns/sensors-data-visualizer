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

import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-init-dialog',
  templateUrl: './init-dialog.component.html',
  styleUrls: ['./init-dialog.component.css'],
})
export class InitDialogComponent {
  maxSize: number;
  stdev: number;
  avg: number;
  valid = true;

  constructor(private dialogRef: MatDialogRef<InitDialogComponent>) {}

  confirm() {
    if (this.inRange(this.avg) && this.inRange(this.stdev)) {
      this.dialogRef.close({stdev: this.stdev, avg: this.avg});
    } else {
      this.valid = false;
    }
  }

  inRange(number) {
    return number >= 2 && number <= this.maxSize;
  }
  cancel() {
    this.dialogRef.close(false);
  }
}
