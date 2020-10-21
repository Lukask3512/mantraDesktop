import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewDispecerComponent } from './new-dispecer.component';

describe('NewDispecerComponent', () => {
  let component: NewDispecerComponent;
  let fixture: ComponentFixture<NewDispecerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewDispecerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewDispecerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
