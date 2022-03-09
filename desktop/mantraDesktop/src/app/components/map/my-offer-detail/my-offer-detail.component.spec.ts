import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyOfferDetailComponent } from './my-offer-detail.component';

describe('MyOfferDetailComponent', () => {
  let component: MyOfferDetailComponent;
  let fixture: ComponentFixture<MyOfferDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyOfferDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyOfferDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
