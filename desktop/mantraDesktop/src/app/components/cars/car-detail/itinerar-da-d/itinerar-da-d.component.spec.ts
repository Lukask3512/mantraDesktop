import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItinerarDaDComponent } from './itinerar-da-d.component';

describe('ItinerarDaDComponent', () => {
  let component: ItinerarDaDComponent;
  let fixture: ComponentFixture<ItinerarDaDComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItinerarDaDComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItinerarDaDComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
