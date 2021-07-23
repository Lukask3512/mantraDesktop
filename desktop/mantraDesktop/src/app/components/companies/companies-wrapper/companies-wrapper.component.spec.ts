import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompaniesWrapperComponent } from './companies-wrapper.component';

describe('CompaniesWrapperComponent', () => {
  let component: CompaniesWrapperComponent;
  let fixture: ComponentFixture<CompaniesWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompaniesWrapperComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompaniesWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
