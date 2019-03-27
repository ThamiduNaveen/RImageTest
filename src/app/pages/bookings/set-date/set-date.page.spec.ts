import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetDatePage } from './set-date.page';

describe('SetDatePage', () => {
  let component: SetDatePage;
  let fixture: ComponentFixture<SetDatePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetDatePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetDatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
