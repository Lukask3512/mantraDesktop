import { TestBed } from '@angular/core/testing';

import { GetOneCompanyService } from './get-one-company.service';

describe('GetOneCompanyService', () => {
  let service: GetOneCompanyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetOneCompanyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
