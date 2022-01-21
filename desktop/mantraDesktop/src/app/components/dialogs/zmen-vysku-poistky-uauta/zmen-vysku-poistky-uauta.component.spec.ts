import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZmenVyskuPoistkyUAutaComponent } from './zmen-vysku-poistky-uauta.component';

describe('ZmenVyskuPoistkyUAutaComponent', () => {
  let component: ZmenVyskuPoistkyUAutaComponent;
  let fixture: ComponentFixture<ZmenVyskuPoistkyUAutaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ZmenVyskuPoistkyUAutaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ZmenVyskuPoistkyUAutaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
