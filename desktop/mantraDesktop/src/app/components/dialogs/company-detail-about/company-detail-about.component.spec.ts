import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyDetailAboutComponent } from './company-detail-about.component';

describe('CompanyDetailAboutComponent', () => {
  let component: CompanyDetailAboutComponent;
  let fixture: ComponentFixture<CompanyDetailAboutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompanyDetailAboutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyDetailAboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
