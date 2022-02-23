import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransportWrapperComponent } from './transport-wrapper.component';

describe('TransportWrapperComponent', () => {
  let component: TransportWrapperComponent;
  let fixture: ComponentFixture<TransportWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransportWrapperComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransportWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
