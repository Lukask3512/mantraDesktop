import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainDetailAboutComponent } from './main-detail-about.component';

describe('MainDetailAboutComponent', () => {
  let component: MainDetailAboutComponent;
  let fixture: ComponentFixture<MainDetailAboutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainDetailAboutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MainDetailAboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
