import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffersPopUpComponent } from './offers-pop-up.component';

describe('OffersPopUpComponent', () => {
  let component: OffersPopUpComponent;
  let fixture: ComponentFixture<OffersPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OffersPopUpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OffersPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
