import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DispecerComponent } from './dispecer.component';

describe('DispecerComponent', () => {
  let component: DispecerComponent;
  let fixture: ComponentFixture<DispecerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DispecerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DispecerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
