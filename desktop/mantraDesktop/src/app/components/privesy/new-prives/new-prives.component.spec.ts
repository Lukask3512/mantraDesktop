import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPrivesComponent } from './new-prives.component';

describe('NewPrivesComponent', () => {
  let component: NewPrivesComponent;
  let fixture: ComponentFixture<NewPrivesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewPrivesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewPrivesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
