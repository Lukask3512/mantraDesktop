import { TestBed } from '@angular/core/testing';

import { PredpokladaneUlozenieService } from './predpokladane-ulozenie.service';

describe('PredpokladaneUlozenieService', () => {
  let service: PredpokladaneUlozenieService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PredpokladaneUlozenieService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
