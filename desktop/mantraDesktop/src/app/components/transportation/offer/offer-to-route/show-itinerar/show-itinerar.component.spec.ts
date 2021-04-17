import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowItinerarComponent } from './show-itinerar.component';

describe('ShowItinerarComponent', () => {
  let component: ShowItinerarComponent;
  let fixture: ComponentFixture<ShowItinerarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowItinerarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowItinerarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
