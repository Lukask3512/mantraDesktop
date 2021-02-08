import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPrivesDialogComponent } from './add-prives-dialog.component';

describe('AddPrivesDialogComponent', () => {
  let component: AddPrivesDialogComponent;
  let fixture: ComponentFixture<AddPrivesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddPrivesDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPrivesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
