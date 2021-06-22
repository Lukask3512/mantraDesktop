import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SizeOfBoxComponent } from './size-of-box.component';

describe('SizeOfBoxComponent', () => {
  let component: SizeOfBoxComponent;
  let fixture: ComponentFixture<SizeOfBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SizeOfBoxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SizeOfBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
