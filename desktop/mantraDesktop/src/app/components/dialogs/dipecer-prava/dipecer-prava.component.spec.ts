import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DipecerPravaComponent } from './dipecer-prava.component';

describe('DipecerPravaComponent', () => {
  let component: DipecerPravaComponent;
  let fixture: ComponentFixture<DipecerPravaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DipecerPravaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DipecerPravaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
