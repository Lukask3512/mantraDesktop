import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarNakladComponent } from './car-naklad.component';

describe('CarNakladComponent', () => {
  let component: CarNakladComponent;
  let fixture: ComponentFixture<CarNakladComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CarNakladComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CarNakladComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
