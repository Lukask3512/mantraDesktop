import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DragDropOfferComponent } from './drag-drop-offer.component';

describe('DragDropOfferComponent', () => {
  let component: DragDropOfferComponent;
  let fixture: ComponentFixture<DragDropOfferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DragDropOfferComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DragDropOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
