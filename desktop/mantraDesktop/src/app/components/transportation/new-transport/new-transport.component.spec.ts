import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewTransportComponent } from './new-transport.component';

describe('NewTransportComponent', () => {
  let component: NewTransportComponent;
  let fixture: ComponentFixture<NewTransportComponent>;

  beforeEach(async(() => {
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
