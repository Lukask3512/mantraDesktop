import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteToItinerarComponent } from './route-to-itinerar.component';

describe('RouteToItinerarComponent', () => {
  let component: RouteToItinerarComponent;
  let fixture: ComponentFixture<RouteToItinerarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RouteToItinerarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RouteToItinerarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
