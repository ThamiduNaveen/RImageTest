import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ImageLoaderConfigService } from 'ionic-image-loader';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {


  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private imageLoaderConfig: ImageLoaderConfigService
  ) {
    this.initializeApp();
    this.imageLoaderConfig.useImageTag(true);
    this.imageLoaderConfig.setFileNameCachedWithExtension(true);
    //this.imageLoaderConfig.setImageReturnType('base64');
    this.imageLoaderConfig.setMaximumCacheAge(24 * 60 * 60 * 1000);
    this.imageLoaderConfig.setMaximumCacheSize(100 * 1024 * 1024);
    //this.imageLoaderConfig.setFallbackUrl('assets/load.gif'); 
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
