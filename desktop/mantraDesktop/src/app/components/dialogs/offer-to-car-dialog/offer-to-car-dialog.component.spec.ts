import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferToCarDialogComponent } from './offer-to-car-dialog.component';

describe('OfferToCarDialogComponent', () => {
  let component: OfferToCarDialogComponent;
  let fixture: ComponentFixture<OfferToCarDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OfferToCarDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OfferToCarDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
