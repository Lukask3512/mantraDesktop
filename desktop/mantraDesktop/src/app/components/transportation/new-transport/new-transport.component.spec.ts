import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NewTransportComponent } from './new-transport.component';

describe('NewTransportComponent', () => {
  let component: NewTransportComponent;
  let fixture: ComponentFixture<NewTransportComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NewTransportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewTransportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
