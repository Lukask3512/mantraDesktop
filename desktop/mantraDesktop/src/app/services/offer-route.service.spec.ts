import { TestBed } from '@angular/core/testing';

import { OfferRouteService } from './offer-route.service';

describe('OfferRouteService', () => {
  let service: OfferRouteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OfferRouteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
