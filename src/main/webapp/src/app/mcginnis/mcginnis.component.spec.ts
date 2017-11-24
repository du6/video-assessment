import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { McginnisComponent } from './mcginnis.component';

describe('McginnisComponent', () => {
  let component: McginnisComponent;
  let fixture: ComponentFixture<McginnisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ McginnisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(McginnisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
