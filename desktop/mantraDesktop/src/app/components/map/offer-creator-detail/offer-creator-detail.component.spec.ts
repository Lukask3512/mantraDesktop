import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferCreatorDetailComponent } from './offer-creator-detail.component';

describe('OfferCreatorDetailComponent', () => {
  let component: OfferCreatorDetailComponent;
  let fixture: ComponentFixture<OfferCreatorDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OfferCreatorDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OfferCreatorDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
