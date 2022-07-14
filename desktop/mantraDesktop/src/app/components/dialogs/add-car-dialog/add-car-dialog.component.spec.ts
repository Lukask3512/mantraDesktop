import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddCarDialogComponent } from './add-car-dialog.component';

describe('AddCarDialogComponent', () => {
  let component: AddCarDialogComponent;
  let fixture: ComponentFixture<AddCarDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCarDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCarDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
