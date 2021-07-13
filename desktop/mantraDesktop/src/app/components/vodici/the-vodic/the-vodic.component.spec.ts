import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TheVodicComponent } from './the-vodic.component';

describe('TheVodicComponent', () => {
  let component: TheVodicComponent;
  let fixture: ComponentFixture<TheVodicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TheVodicComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TheVodicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
