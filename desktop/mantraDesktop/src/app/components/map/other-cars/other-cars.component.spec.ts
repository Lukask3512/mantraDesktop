import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherCarsComponent } from './other-cars.component';

describe('OtherCarsComponent', () => {
  let component: OtherCarsComponent;
  let fixture: ComponentFixture<OtherCarsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtherCarsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherCarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
