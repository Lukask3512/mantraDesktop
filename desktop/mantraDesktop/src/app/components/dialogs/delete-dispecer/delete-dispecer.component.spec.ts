import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DeleteDispecerComponent } from './delete-dispecer.component';

describe('DeleteDispecerComponent', () => {
  let component: DeleteDispecerComponent;
  let fixture: ComponentFixture<DeleteDispecerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteDispecerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteDispecerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
