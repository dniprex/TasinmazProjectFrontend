import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TasinmazlarComponent } from './tasinmazlar.component';

describe('TasinmazlarComponent', () => {
  let component: TasinmazlarComponent;
  let fixture: ComponentFixture<TasinmazlarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TasinmazlarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TasinmazlarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
