import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TransportationWrapperComponent } from './transportation-wrapper.component';

describe('TransportationWrapperComponent', () => {
  let component: TransportationWrapperComponent;
  let fixture: ComponentFixture<TransportationWrapperComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TransportationWrapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransportationWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
