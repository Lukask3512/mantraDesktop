import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteFromItiComponent } from './delete-from-iti.component';

describe('DeleteFromItiComponent', () => {
  let component: DeleteFromItiComponent;
  let fixture: ComponentFixture<DeleteFromItiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteFromItiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteFromItiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
