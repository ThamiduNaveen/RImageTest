import { Component, OnInit, NgZone, Input } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { File, FileEntry } from '@ionic-native/File/ngx';
import { HttpClient } from '@angular/common/http';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { Platform, ToastController, LoadingController } from '@ionic/angular';
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/storage';
import { finalize, tap } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';

const NAME: string = "upload.jpg"

@Component({
  selector: 'app-upload-photo',
  templateUrl: './upload-photo.page.html',
  styleUrls: ['./upload-photo.page.scss'],
})
export class UploadPhotoPage implements OnInit {


  private localImageSrc: string = "";
  private toast: HTMLIonToastElement;
  private title: string = "";
  private imageName: string = ""
  private loadingElement: HTMLIonLoadingElement;
  private uploadProgress: number = 0;
  private downloadUrl: string;
  private uploadingBool: boolean = false;


  constructor(
    private camera: Camera,
    private platform: Platform,
    private filePath: FilePath,
    private file: File,
    private toastController: ToastController,
    private webview: WebView,
    private loadingController: LoadingController,
    private afStorage: AngularFireStorage,
    private ngZone: NgZone,
    private afstore: AngularFirestore,
    private route: Router,
  ) { }

  ngOnInit() {

  }

  ngOnDestroy() {
    this.deleteImage();
  }





  private takePicture(): void {
    var options: CameraOptions = {
      quality: 100,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      saveToPhotoAlbum: false,
      correctOrientation: true
    };
    this.presentLoading('Please wait..');
    this.camera.getPicture(options).then(imagePath => {
      if (this.platform.is('android')) {
        this.filePath.resolveNativePath(imagePath)
          .then(filePath => {

            let correctPath: string = filePath.substr(0, filePath.lastIndexOf('/') + 1);
            let currentName: string = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
            this.imageName = this.createFileName();
            this.copyFileToLocalDir(correctPath, currentName, this.imageName);

          });
      } else {
        let currentName: string = imagePath.substr(imagePath.lastIndexOf('/') + 1);
        let correctPath: string = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
        this.copyFileToLocalDir(correctPath, currentName, NAME);
      }
    });

  }

  private createFileName(): string {
    return (2552750023644 - new Date().getTime()) + ".jpg";
  }

  private copyFileToLocalDir(namePath: string, currentName: string, newFileName: string): void {
    this.file.copyFile(namePath, currentName, this.file.dataDirectory, newFileName).then(success => {
      this.localImageSrc = this.pathForImage(this.imageName);
      this.loadingElement.dismiss();
    }, error => {
      this.loadingElement.dismiss();
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
 

  private deleteImage(): void {

    let filePath = this.file.dataDirectory + this.imageName;
    let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
    this.localImageSrc = "";
    this.title = "";
    this.file.removeFile(correctPath, this.imageName).then(res => {
      //this.presentToast('File removed.' + res.success);
    }).catch(err => {
      //this.presentToast('File error.');
    });;

  }

  async presentLoading(message: string) {
    this.loadingElement = await this.loadingController.create({
      message: message,
      duration: 300000,
      backdropDismiss: true,
    });
    await this.loadingElement.present();

  }

  private startUpload(): void {
    if (this.title.trim()) {
      let filePath: string = this.file.dataDirectory + this.imageName;
      this.file.resolveLocalFilesystemUrl(filePath)
        .then(entry => {
          this.uploadingBool = true;
          (<FileEntry>entry).file(file => this.readFile(file))
        })
        .catch(err => {
          this.presentToast('Error while reading file.');
        });
    } else {
      this.presentToast('Please enter tiltle for the image.');
    }
  }

  private readFile(file: any): void {
    const reader: FileReader = new FileReader();
    reader.onloadend = () => {

      const imgBlob: Blob = new Blob([reader.result], {
        type: file.type
      });

      const storagePath = `Images/panivida/${this.imageName}.jpg`;

      const ref: AngularFireStorageReference = this.afStorage.ref(storagePath);
      const task: AngularFireUploadTask = ref.put(imgBlob);

      const perChangeSub: Subscription = task.percentageChanges().subscribe(res => {
        this.ngZone.run(() => {
          this.uploadProgress = res;
        });

      });

      const urlSub: Subscription = task.snapshotChanges().pipe(
        finalize(() => {
          let downSub: Subscription = ref.getDownloadURL().subscribe(res => {
            this.downloadUrl = res;
            this.databaseUpdate();
            downSub.unsubscribe();
            perChangeSub.unsubscribe();
            urlSub.unsubscribe();
          });
        })
      ).subscribe();


      task.then(res => {

      }).catch(err => {
        perChangeSub.unsubscribe();
        urlSub.unsubscribe();
        this.uploadingBool = false;
        this.presentToast('Error Uploading the image :' + err.message);
      });



    };

    reader.readAsArrayBuffer(file);

  }

  private databaseUpdate() {
    this.afstore.doc(`Images/panivida/panividaImage/${this.imageName}`).set({

      title: this.title,
      url: this.downloadUrl,
      id: this.imageName

    }).then(res => {
      this.downloadUrl = "";
      this.title = "";
      this.uploadingBool = false;
      this.deleteImage();
      this.presentToast('Uploading Successful');
      this.route.navigate(['/photos'])

    });

  }

}
