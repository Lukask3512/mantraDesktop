import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CarsWrapperComponent } from './cars-wrapper.component';

describe('CarsWrapperComponent', () => {
  let component: CarsWrapperComponent;
  let fixture: ComponentFixture<CarsWrapperComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CarsWrapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CarsWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
