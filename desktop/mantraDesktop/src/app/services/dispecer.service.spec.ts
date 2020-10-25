import { TestBed } from '@angular/core/testing';

import { DispecerService } from './dispecer.service';

describe('DispecerService', () => {
  let service: DispecerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DispecerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
