import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTasinmazComponent } from './edit-tasinmaz.component';

describe('EditTasinmazComponent', () => {
  let component: EditTasinmazComponent;
  let fixture: ComponentFixture<EditTasinmazComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditTasinmazComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTasinmazComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
