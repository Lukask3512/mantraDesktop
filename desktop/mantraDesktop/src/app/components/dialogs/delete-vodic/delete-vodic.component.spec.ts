import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteVodicComponent } from './delete-vodic.component';

describe('DeleteVodicComponent', () => {
  let component: DeleteVodicComponent;
  let fixture: ComponentFixture<DeleteVodicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteVodicComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteVodicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
