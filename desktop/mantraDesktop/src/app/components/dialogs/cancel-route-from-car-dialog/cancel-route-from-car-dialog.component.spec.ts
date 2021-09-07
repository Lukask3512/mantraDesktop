import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelRouteFromCarDialogComponent } from './cancel-route-from-car-dialog.component';

describe('CancelRouteFromCarDialogComponent', () => {
  let component: CancelRouteFromCarDialogComponent;
  let fixture: ComponentFixture<CancelRouteFromCarDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CancelRouteFromCarDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelRouteFromCarDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
