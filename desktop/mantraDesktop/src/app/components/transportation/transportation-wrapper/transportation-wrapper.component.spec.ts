import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransportationWrapperComponent } from './transportation-wrapper.component';

describe('TransportationWrapperComponent', () => {
  let component: TransportationWrapperComponent;
  let fixture: ComponentFixture<TransportationWrapperComponent>;

  beforeEach(async(() => {
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
