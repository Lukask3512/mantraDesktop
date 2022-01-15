import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpMapComponent } from './pop-up-map.component';

describe('PopUpMapComponent', () => {
  let component: PopUpMapComponent;
  let fixture: ComponentFixture<PopUpMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopUpMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopUpMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
