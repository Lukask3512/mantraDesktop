import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarsPopUpComponent } from './cars-pop-up.component';

describe('CarsPopUpComponent', () => {
  let component: CarsPopUpComponent;
  let fixture: ComponentFixture<CarsPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CarsPopUpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CarsPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
