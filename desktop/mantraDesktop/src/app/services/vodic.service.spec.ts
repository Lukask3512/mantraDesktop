import { TestBed } from '@angular/core/testing';

import { VodicService } from './vodic.service';

describe('VodicService', () => {
  let service: VodicService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VodicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
