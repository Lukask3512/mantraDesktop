import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivesWrapperComponent } from './prives-wrapper.component';

describe('PrivesWrapperComponent', () => {
  let component: PrivesWrapperComponent;
  let fixture: ComponentFixture<PrivesWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrivesWrapperComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivesWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
