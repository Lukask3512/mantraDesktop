import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateOfferPriceComponent } from './update-offer-price.component';

describe('UpdateOfferPriceComponent', () => {
  let component: UpdateOfferPriceComponent;
  let fixture: ComponentFixture<UpdateOfferPriceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateOfferPriceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateOfferPriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
