import { TestBed } from '@angular/core/testing';

import { DrawOfferService } from './draw-offer.service';

describe('DrawOfferService', () => {
  let service: DrawOfferService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DrawOfferService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
