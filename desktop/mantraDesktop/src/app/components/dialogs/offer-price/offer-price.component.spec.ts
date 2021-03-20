import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferPriceComponent } from './offer-price.component';

describe('OfferPriceComponent', () => {
  let component: OfferPriceComponent;
  let fixture: ComponentFixture<OfferPriceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OfferPriceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OfferPriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
