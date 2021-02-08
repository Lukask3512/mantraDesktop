import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffNavesDialogComponent } from './off-naves-dialog.component';

describe('OffNavesDialogComponent', () => {
  let component: OffNavesDialogComponent;
  let fixture: ComponentFixture<OffNavesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OffNavesDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OffNavesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
