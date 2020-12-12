import { TestBed } from '@angular/core/testing';

import { RouteStatusService } from './route-status.service';

describe('RouteStatusService', () => {
  let service: RouteStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RouteStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
