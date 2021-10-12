import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetNameOfComapnyByMasterIdComponent } from './get-name-of-comapny-by-master-id.component';

describe('GetNameOfComapnyByMasterIdComponent', () => {
  let component: GetNameOfComapnyByMasterIdComponent;
  let fixture: ComponentFixture<GetNameOfComapnyByMasterIdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GetNameOfComapnyByMasterIdComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GetNameOfComapnyByMasterIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
