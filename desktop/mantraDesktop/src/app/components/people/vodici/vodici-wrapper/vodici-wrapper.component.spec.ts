import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VodiciWrapperComponent } from './vodici-wrapper.component';

describe('VodiciWrapperComponent', () => {
  let component: VodiciWrapperComponent;
  let fixture: ComponentFixture<VodiciWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VodiciWrapperComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VodiciWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
