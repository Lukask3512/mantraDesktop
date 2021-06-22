import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarItiDetailComponent } from './car-iti-detail.component';

describe('CarItiDetailComponent', () => {
  let component: CarItiDetailComponent;
  let fixture: ComponentFixture<CarItiDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CarItiDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CarItiDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
