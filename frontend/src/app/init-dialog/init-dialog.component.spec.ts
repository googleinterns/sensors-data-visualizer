import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InitDialogComponent } from './init-dialog.component';

describe('InitDialogComponent', () => {
  let component: InitDialogComponent;
  let fixture: ComponentFixture<InitDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InitDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InitDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
