import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewVodicComponent } from './new-vodic.component';

describe('NewVodicComponent', () => {
  let component: NewVodicComponent;
  let fixture: ComponentFixture<NewVodicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewVodicComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewVodicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
