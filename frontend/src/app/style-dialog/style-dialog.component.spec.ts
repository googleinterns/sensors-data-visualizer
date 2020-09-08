import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StyleDialogComponent } from './style-dialog.component';

describe('StyleDialogComponent', () => {
  let component: StyleDialogComponent;
  let fixture: ComponentFixture<StyleDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StyleDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StyleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
