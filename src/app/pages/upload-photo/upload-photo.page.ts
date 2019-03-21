import { Component, OnInit, NgZone, Input } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { File, FileEntry, IFile } from '@ionic-native/File/ngx';
import { HttpClient } from '@angular/common/http';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { Platform, ToastController, LoadingController } from '@ionic/angular';
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/storage';
import { finalize, tap } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { ImagePicker } from '@ionic-native/image-picker/ngx';

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

  private options: CameraOptions = {
    quality: 100,
    sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
    saveToPhotoAlbum: false,
    correctOrientation: true
  };
  private sliderOpts = {
    zoom: false,
    slidesPerView: 1.5,
    spaceBetween: 20,
    centeredSlides: true
  };

  private localImagesSrc: string[] = [];
  private imagePaths: string[] = [];
  private fileArray: IFile[] = [];
  private noOfFiles: number = 0;
  private downloadUrls: string[] = [];
  private uploadingBoolMul: boolean = false;


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
    private imagePicker: ImagePicker
  ) { }

  ngOnInit() {

  }

  ngOnDestroy() {
    this.deleteImage();
    this.deleteImageMulitiple()
  }

  private takePicture(): void {

    this.presentLoading('Please wait..');
    this.camera.getPicture(this.options).then(imagePath => {
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
        this.imageName = this.createFileName();
        this.copyFileToLocalDir(correctPath, currentName, this.imageName);
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

  private databaseUpdate():void {
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

  private multipleDatabaseUpdate():void {
    this.afstore.doc(`Images/panivida/panividaImage/${this.imageName}`).set({

      title: this.title,
      url: this.downloadUrls[0],
      id: this.imageName,
      childs: this.downloadUrls

    }).then(res => {

      this.deleteImageMulitiple();
      this.presentToast('Uploading Successful');
      this.route.navigate(['/photos'])

    }).catch(err=>{
      this.presentToast('Error updating the database :'+err.message);
    });
  }

  private takeMultiple():void {


    this.imagePicker.getPictures(this.options).then((imagePaths) => {
      if (imagePaths.length > 1) {
        this.imageName = this.createFileName();
        this.imagePaths = imagePaths;

        this.imageName = this.createFileName();

        for (var i = 0; i < imagePaths.length; i++) {
          this.localImagesSrc.push(this.webview.convertFileSrc(imagePaths[i]))
        }

      } else if (imagePaths.length == 1) {

        this.presentToast("Please select more than one image")
      } else {

      }

    }, (err) => {

      this.presentToast("Error while loading the files")
    });


  }

  private deleteImageMulitiple(): void {

    this.downloadUrls = [];
    this.title = "";
    this.uploadingBoolMul = false;
    this.localImagesSrc = [];
    this.fileArray = [];
    this.noOfFiles = 0;

    for (let i = 0; i < this.imagePaths.length; i++) {

      let correctPath = this.imagePaths[i].substr(0, this.imagePaths[i].lastIndexOf('/') + 1);
      let imageName = this.imagePaths[i].substr(this.imagePaths[i].lastIndexOf('/') + 1);

      this.file.removeFile(correctPath, imageName).then(res => {
        if (i === this.imagePaths.length - 1) {
          this.imagePaths = [];
          //this.presentToast('deleted');
        }

        //this.presentToast('File removed.' + res.success);
      }).catch(err => {
        //this.presentToast('File error.');
      });;
    }

  }

  private startMultipleUpload(imagePaths: string[]): void {


    if (this.title.trim()) {


      if (imagePaths.length) {

        this.file.resolveLocalFilesystemUrl(imagePaths.pop())
          .then(entry => {
            this.uploadingBoolMul = true;
            (<FileEntry>entry).file(file => {
              this.fileArray.push(file);
              if (imagePaths.length) {
                this.startMultipleUpload(imagePaths);
              } else {
                this.noOfFiles = this.fileArray.length;
                this.multipleUpload(this.fileArray);
              }

            })

          })
          .catch(err => {
            this.presentToast('Error while reading file.');

          });

      }

    } else {
      this.presentToast('Please enter tiltle for the image.');
    }

  }

  private multipleUpload(fileArray: IFile[]):void {

    if (fileArray.length) {
      let file: IFile = fileArray.pop()

      const reader: FileReader = new FileReader();
      reader.onloadend = () => {

        const imgBlob: Blob = new Blob([reader.result], {
          type: file.type
        });

        const storagePath = `Images/panivida/${this.imageName}/${fileArray.length}.jpg`;
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
              this.downloadUrls.push(res);
              downSub.unsubscribe();
              perChangeSub.unsubscribe();
              urlSub.unsubscribe();

              if (fileArray.length) {
                this.ngZone.run(() => {
                  this.uploadProgress = 0;
                });
                this.multipleUpload(fileArray);
              } else {
                this.multipleDatabaseUpdate();
              }
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

    } else {
      this.presentToast("done putha");
    }
  }

}

