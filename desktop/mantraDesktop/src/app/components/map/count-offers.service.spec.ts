import { TestBed } from '@angular/core/testing';

import { CountOffersService } from './count-offers.service';

describe('CountOffersService', () => {
  let service: CountOffersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CountOffersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
