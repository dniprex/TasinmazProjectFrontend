import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTasinmazComponent } from './add-tasinmaz.component';

describe('AddTasinmazComponent', () => {
  let component: AddTasinmazComponent;
  let fixture: ComponentFixture<AddTasinmazComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddTasinmazComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTasinmazComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
