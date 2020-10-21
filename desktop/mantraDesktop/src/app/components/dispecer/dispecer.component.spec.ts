import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DispecerComponent } from './dispecer.component';

describe('DispecerComponent', () => {
  let component: DispecerComponent;
  let fixture: ComponentFixture<DispecerComponent>;

  beforeEach(async(() => {
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
