import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BookViewPage } from './book-view.page';

describe('BookViewPage', () => {
  let component: BookViewPage;
  let fixture: ComponentFixture<BookViewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BookViewPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
