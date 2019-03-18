import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'photos', pathMatch: 'full' },
  { path: 'photos', loadChildren: './pages/photos/photos.module#PhotosPageModule' },
  { path: 'upload-photo', loadChildren: './pages/upload-photo/upload-photo.module#UploadPhotoPageModule' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
