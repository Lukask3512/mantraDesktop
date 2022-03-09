import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CakarenWrapperComponent } from './cakaren-wrapper.component';

describe('CakarenWrapperComponent', () => {
  let component: CakarenWrapperComponent;
  let fixture: ComponentFixture<CakarenWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CakarenWrapperComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CakarenWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
