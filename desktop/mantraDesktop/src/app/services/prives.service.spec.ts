import { TestBed } from '@angular/core/testing';

import { PrivesService } from './prives.service';

describe('PrivesService', () => {
  let service: PrivesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrivesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
