import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepeatRouteDialogComponent } from './repeat-route-dialog.component';

describe('RepeatRouteDialogComponent', () => {
  let component: RepeatRouteDialogComponent;
  let fixture: ComponentFixture<RepeatRouteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RepeatRouteDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RepeatRouteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
