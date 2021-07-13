import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewVodicDialogComponent } from './new-vodic-dialog.component';

describe('NewVodicDialogComponent', () => {
  let component: NewVodicDialogComponent;
  let fixture: ComponentFixture<NewVodicDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewVodicDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewVodicDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
