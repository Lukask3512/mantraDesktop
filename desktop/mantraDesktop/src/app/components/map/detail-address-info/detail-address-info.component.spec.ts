import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailAddressInfoComponent } from './detail-address-info.component';

describe('DetailAddressInfoComponent', () => {
  let component: DetailAddressInfoComponent;
  let fixture: ComponentFixture<DetailAddressInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailAddressInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailAddressInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
