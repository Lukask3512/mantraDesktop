import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TheDispecerComponent } from './the-dispecer.component';

describe('TheDispecerComponent', () => {
  let component: TheDispecerComponent;
  let fixture: ComponentFixture<TheDispecerComponent>;

  beforeEach(async(() => {
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
