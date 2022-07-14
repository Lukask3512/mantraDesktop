import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RouteLogComponent } from './route-log.component';

describe('RouteLogComponent', () => {
  let component: RouteLogComponent;
  let fixture: ComponentFixture<RouteLogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RouteLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RouteLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
