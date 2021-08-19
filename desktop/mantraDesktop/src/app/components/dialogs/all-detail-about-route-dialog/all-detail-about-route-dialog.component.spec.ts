import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllDetailAboutRouteDialogComponent } from './all-detail-about-route-dialog.component';

describe('AllDetailAboutRouteDialogComponent', () => {
  let component: AllDetailAboutRouteDialogComponent;
  let fixture: ComponentFixture<AllDetailAboutRouteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllDetailAboutRouteDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AllDetailAboutRouteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
