import { TestBed } from '@angular/core/testing';

import { CountFreeSpaceService } from './count-free-space.service';

describe('CountFreeSpaceService', () => {
  let service: CountFreeSpaceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CountFreeSpaceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
