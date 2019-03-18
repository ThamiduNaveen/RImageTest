import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadPhotoPage } from './upload-photo.page';

describe('UploadPhotoPage', () => {
  let component: UploadPhotoPage;
  let fixture: ComponentFixture<UploadPhotoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadPhotoPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadPhotoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
