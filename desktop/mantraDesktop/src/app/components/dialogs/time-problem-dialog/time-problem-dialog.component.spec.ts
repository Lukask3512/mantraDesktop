import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeProblemDialogComponent } from './time-problem-dialog.component';

describe('TimeProblemDialogComponent', () => {
  let component: TimeProblemDialogComponent;
  let fixture: ComponentFixture<TimeProblemDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimeProblemDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeProblemDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
