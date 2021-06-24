import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UlozeniePonukyComponent } from './ulozenie-ponuky.component';

describe('UlozeniePonukyComponent', () => {
  let component: UlozeniePonukyComponent;
  let fixture: ComponentFixture<UlozeniePonukyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UlozeniePonukyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UlozeniePonukyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
