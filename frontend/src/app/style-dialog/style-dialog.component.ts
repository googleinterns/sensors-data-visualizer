import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-style-dialog',
  templateUrl: './style-dialog.component.html',
  styleUrls: ['./style-dialog.component.css']
})
export class StyleDialogComponent implements OnInit {
  traceName: string = 'test';
  constructor() { }

  ngOnInit(): void {
  }

}
