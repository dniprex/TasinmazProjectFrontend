import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnaMenuComponent } from './ana-menu.component';

describe('AnaMenuComponent', () => {
  let component: AnaMenuComponent;
  let fixture: ComponentFixture<AnaMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnaMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnaMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
