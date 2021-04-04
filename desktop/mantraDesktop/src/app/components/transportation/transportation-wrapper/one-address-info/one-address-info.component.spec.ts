import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OneAddressInfoComponent } from './one-address-info.component';

describe('OneAddressInfoComponent', () => {
  let component: OneAddressInfoComponent;
  let fixture: ComponentFixture<OneAddressInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OneAddressInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OneAddressInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
