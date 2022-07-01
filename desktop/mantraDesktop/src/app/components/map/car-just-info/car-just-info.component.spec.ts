import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarJustInfoComponent } from './car-just-info.component';

describe('CarJustInfoComponent', () => {
  let component: CarJustInfoComponent;
  let fixture: ComponentFixture<CarJustInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CarJustInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CarJustInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
