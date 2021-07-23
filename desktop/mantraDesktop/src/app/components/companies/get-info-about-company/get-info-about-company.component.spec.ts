import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetInfoAboutCompanyComponent } from './get-info-about-company.component';

describe('GetInfoAboutCompanyComponent', () => {
  let component: GetInfoAboutCompanyComponent;
  let fixture: ComponentFixture<GetInfoAboutCompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GetInfoAboutCompanyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GetInfoAboutCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
