import { Component, OnInit } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { File, FileEntry } from '@ionic-native/File/ngx';
import { HttpClient } from '@angular/common/http';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { Platform, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-upload-photo',
  templateUrl: './upload-photo.page.html',
  styleUrls: ['./upload-photo.page.scss'],
})
export class UploadPhotoPage implements OnInit {


  private localImageSrc: string;
  private toast: HTMLIonToastElement;
  private description: string = "";

  constructor(
    private camera: Camera,
    private platform: Platform,
    private filePath: FilePath,
    private file: File,
    private toastController: ToastController,
    private webview: WebView
  ) { }

  ngOnInit() {
  }




  private takePicture(): void {
    var options: CameraOptions = {
      quality: 100,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      saveToPhotoAlbum: false,
      correctOrientation: true
    };

    this.camera.getPicture(options).then(imagePath => {
      if (this.platform.is('android')) {
        this.filePath.resolveNativePath(imagePath)
          .then(filePath => {

            let correctPath: string = filePath.substr(0, filePath.lastIndexOf('/') + 1);
            let currentName: string = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
            this.copyFileToLocalDir(correctPath, currentName, "upload.jpg");
          });
      } else {
        let currentName: string = imagePath.substr(imagePath.lastIndexOf('/') + 1);
        let correctPath: string = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
        this.copyFileToLocalDir(correctPath, currentName, "upload.jpg");
      }
    });

  }

  // private createFileName(): string {
  //   let d = new Date();
  //   let n = d.getTime();
  //   let newFileName = n + ".jpg";
  //   return newFileName;
  // }

  private copyFileToLocalDir(namePath: string, currentName: string, newFileName: string): void {
    this.file.copyFile(namePath, currentName, this.file.dataDirectory, newFileName).then(success => {
      this.localImageSrc = newFileName;
    }, error => {
      this.presentToast('Error while loading the image.');
    });
  }

  private pathForImage(img: string): string {
    if (img === null) {
      return '';
    } else {
      let converted: string = this.webview.convertFileSrc(this.file.dataDirectory + img);
      return converted;
    }
  }



  private async presentToast(message: string) {
    try {
      this.toast.dismiss();
    } catch (err) { }
    finally {
      this.toast = await this.toastController.create({
        message: message,
        duration: 3000
      });
      this.toast.present();
    }

  }

}
