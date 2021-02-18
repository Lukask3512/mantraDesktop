import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferToRouteComponent } from './offer-to-route.component';

describe('OfferToRouteComponent', () => {
  let component: OfferToRouteComponent;
  let fixture: ComponentFixture<OfferToRouteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OfferToRouteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OfferToRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
