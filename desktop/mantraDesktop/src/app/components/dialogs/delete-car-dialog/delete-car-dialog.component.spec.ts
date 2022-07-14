import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DeleteCarDialogComponent } from './delete-car-dialog.component';

describe('DeleteCarDialogComponent', () => {
  let component: DeleteCarDialogComponent;
  let fixture: ComponentFixture<DeleteCarDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteCarDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteCarDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
