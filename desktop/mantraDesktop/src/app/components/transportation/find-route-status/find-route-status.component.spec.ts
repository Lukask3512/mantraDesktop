import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FindRouteStatusComponent } from './find-route-status.component';

describe('FindRouteStatusComponent', () => {
  let component: FindRouteStatusComponent;
  let fixture: ComponentFixture<FindRouteStatusComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FindRouteStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FindRouteStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
