import { TestBed } from '@angular/core/testing';

import { IdManagerService } from './id-manager.service';

describe('IdManagerService', () => {
  let service: IdManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IdManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
