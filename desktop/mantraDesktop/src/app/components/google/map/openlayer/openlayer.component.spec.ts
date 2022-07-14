import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OpenlayerComponent } from './openlayer.component';

describe('OpenlayerComponent', () => {
  let component: OpenlayerComponent;
  let fixture: ComponentFixture<OpenlayerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenlayerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
