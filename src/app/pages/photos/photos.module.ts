import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { PhotosPage } from './photos.page';

import { IonicImageLoader } from 'ionic-image-loader';
import { ImageFilterPipe } from 'src/app/pipes/image-filter.pipe';

const routes: Routes = [
  {
    path: '',
    component: PhotosPage
  }
];

@NgModule({
  imports: [
    IonicImageLoader,
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [PhotosPage, ImageFilterPipe]
})
export class PhotosPageModule {}
