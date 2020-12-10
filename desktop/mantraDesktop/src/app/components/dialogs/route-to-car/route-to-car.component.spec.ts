import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteToCarComponent } from './route-to-car.component';

describe('RouteToCarComponent', () => {
  let component: RouteToCarComponent;
  let fixture: ComponentFixture<RouteToCarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RouteToCarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RouteToCarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
