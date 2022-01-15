import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowCoorOnMapComponent } from './show-coor-on-map.component';

describe('ShowCoorOnMapComponent', () => {
  let component: ShowCoorOnMapComponent;
  let fixture: ComponentFixture<ShowCoorOnMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowCoorOnMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowCoorOnMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
