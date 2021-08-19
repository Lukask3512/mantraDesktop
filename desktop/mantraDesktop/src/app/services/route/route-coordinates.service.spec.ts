import { TestBed } from '@angular/core/testing';

import { RouteCoordinatesService } from './route-coordinates.service';

describe('RouteCoordinatesService', () => {
  let service: RouteCoordinatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RouteCoordinatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
