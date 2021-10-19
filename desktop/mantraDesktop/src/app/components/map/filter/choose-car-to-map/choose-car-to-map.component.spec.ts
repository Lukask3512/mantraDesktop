import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseCarToMapComponent } from './choose-car-to-map.component';

describe('ChooseCarToMapComponent', () => {
  let component: ChooseCarToMapComponent;
  let fixture: ComponentFixture<ChooseCarToMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChooseCarToMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChooseCarToMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
