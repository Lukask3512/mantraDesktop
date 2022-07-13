import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarPopUpComponent } from './car-pop-up.component';

describe('CarPopUpComponent', () => {
  let component: CarPopUpComponent;
  let fixture: ComponentFixture<CarPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CarPopUpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CarPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
