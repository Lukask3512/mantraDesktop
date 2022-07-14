import { TestBed } from '@angular/core/testing';

import { DataForSendingService } from './data-for-sending.service';

describe('DataForSendingService', () => {
  let service: DataForSendingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataForSendingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
