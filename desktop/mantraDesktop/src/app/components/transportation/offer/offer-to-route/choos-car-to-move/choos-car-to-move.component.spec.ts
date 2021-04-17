import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoosCarToMoveComponent } from './choos-car-to-move.component';

describe('ChoosCarToMoveComponent', () => {
  let component: ChoosCarToMoveComponent;
  let fixture: ComponentFixture<ChoosCarToMoveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChoosCarToMoveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChoosCarToMoveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
