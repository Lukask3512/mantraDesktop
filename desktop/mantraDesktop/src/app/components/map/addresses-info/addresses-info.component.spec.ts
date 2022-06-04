import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressesInfoComponent } from './addresses-info.component';

describe('AddressesInfoComponent', () => {
  let component: AddressesInfoComponent;
  let fixture: ComponentFixture<AddressesInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddressesInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressesInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
