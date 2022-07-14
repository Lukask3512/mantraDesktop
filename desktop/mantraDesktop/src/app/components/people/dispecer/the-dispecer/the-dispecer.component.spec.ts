import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TheDispecerComponent } from './the-dispecer.component';

describe('TheDispecerComponent', () => {
  let component: TheDispecerComponent;
  let fixture: ComponentFixture<TheDispecerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TheDispecerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TheDispecerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
