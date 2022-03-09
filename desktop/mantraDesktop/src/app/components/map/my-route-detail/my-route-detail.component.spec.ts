import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyRouteDetailComponent } from './my-route-detail.component';

describe('MyRouteDetailComponent', () => {
  let component: MyRouteDetailComponent;
  let fixture: ComponentFixture<MyRouteDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyRouteDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyRouteDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
