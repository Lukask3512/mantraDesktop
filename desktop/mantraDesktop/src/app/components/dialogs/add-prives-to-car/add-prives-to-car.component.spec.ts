import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPrivesToCarComponent } from './add-prives-to-car.component';

describe('AddPrivesToCarComponent', () => {
  let component: AddPrivesToCarComponent;
  let fixture: ComponentFixture<AddPrivesToCarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddPrivesToCarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPrivesToCarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
