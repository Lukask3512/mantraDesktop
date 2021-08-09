import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetNameOfDriverComponent } from './get-name-of-driver.component';

describe('GetNameOfDriverComponent', () => {
  let component: GetNameOfDriverComponent;
  let fixture: ComponentFixture<GetNameOfDriverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GetNameOfDriverComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GetNameOfDriverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
