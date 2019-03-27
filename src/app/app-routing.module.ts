import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'photos', pathMatch: 'full' },
  { path: 'photos', loadChildren: './pages/photos/photos.module#PhotosPageModule' },
  { path: 'upload-photo', loadChildren: './pages/upload-photo/upload-photo.module#UploadPhotoPageModule' },
  { path: 'book/tabs', loadChildren: './pages/bookings/tabs/tabs.module#TabsPageModule' },
  { path: 'book', loadChildren: './pages/bookings/book/book.module#BookPageModule' },
  { path: 'book/book-details', loadChildren: './pages/bookings/book-details/book-details.module#BookDetailsPageModule' },
  { path: 'book/date-details', loadChildren: './pages/bookings/date-details/date-details.module#DateDetailsPageModule' },
  
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
