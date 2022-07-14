import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FindCarByIdComponent } from './find-car-by-id.component';

describe('FindCarByIdComponent', () => {
  let component: FindCarByIdComponent;
  let fixture: ComponentFixture<FindCarByIdComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FindCarByIdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FindCarByIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
