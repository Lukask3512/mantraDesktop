import { TestBed } from '@angular/core/testing';

import { DetailAboutRouteService } from './detail-about-route.service';

describe('DetailAboutRouteService', () => {
  let service: DetailAboutRouteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DetailAboutRouteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
