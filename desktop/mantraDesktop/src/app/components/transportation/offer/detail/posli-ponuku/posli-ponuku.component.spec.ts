import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosliPonukuComponent } from './posli-ponuku.component';

describe('PosliPonukuComponent', () => {
  let component: PosliPonukuComponent;
  let fixture: ComponentFixture<PosliPonukuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PosliPonukuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PosliPonukuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
