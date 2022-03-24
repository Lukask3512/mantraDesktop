import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComapnyContantsDialogComponent } from './comapny-contants-dialog.component';

describe('ComapnyContantsDialogComponent', () => {
  let component: ComapnyContantsDialogComponent;
  let fixture: ComponentFixture<ComapnyContantsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComapnyContantsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComapnyContantsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
