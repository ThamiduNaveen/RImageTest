import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { HttpModule } from '@angular/http';

import firebaseConfig from './firebase/firebase'
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { Network } from '@ionic-native/network/ngx';

import { Camera } from '@ionic-native/camera/ngx';
import { File } from '@ionic-native/File/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { HttpClient } from '@angular/common/http';
import { ImageModalPageModule } from './pages/image-modal/image-modal.module';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { IonicImageLoader } from 'ionic-image-loader';
import { FileTransfer} from '@ionic-native/file-transfer/ngx';

import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { IonicStorageModule } from '@ionic/storage';
//import { ImageFilterPipe } from './pipes/image-filter.pipe';



@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFirestoreModule.enablePersistence(),
    AppRoutingModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    HttpModule,
    ImageModalPageModule,
    IonicImageLoader.forRoot(),
    
    IonicStorageModule.forRoot()
  ],

  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    Network,
    Camera,
    File,
    WebView,
    FilePath,
    Storage,
    HttpClient,
    ImagePicker,
    FileTransfer,
    SocialSharing,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
