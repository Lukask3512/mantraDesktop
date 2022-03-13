import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletePrivesComponent } from './delete-prives.component';

describe('DeletePrivesComponent', () => {
  let component: DeletePrivesComponent;
  let fixture: ComponentFixture<DeletePrivesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeletePrivesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeletePrivesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
