import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { ToastController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Network } from '@ionic-native/network/ngx';
import { Subscription } from 'rxjs';
import { ImageModalPage } from '../image-modal/image-modal.page';
import { AngularFireStorageReference, AngularFireUploadTask, AngularFireStorage } from '@angular/fire/storage';
import { File } from '@ionic-native/File/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Storage } from '@ionic/storage';

const STORAGE_KEY = 'images';

@Component({
  selector: 'app-photos',
  templateUrl: './photos.page.html',
  styleUrls: ['./photos.page.scss'],
})
export class PhotosPage implements OnInit {

  private postReferance: AngularFirestoreCollection<{}>;
  private postReferanceSub: Subscription;
  private images: {
    id: string,
    title: string,
    url: string,
    src: string
  }[];
  private toast: HTMLIonToastElement;
  private DATA_DIRECTORY: string = this.file.dataDirectory;
  private fileTransfer: FileTransferObject = this.transfer.create();
  private imageIDArr: string[] = [];
  private filterText: string = '';

  constructor(private afstore: AngularFirestore,
    private toastController: ToastController,
    private router: Router,
    private network: Network,
    private afStorage: AngularFireStorage,
    private transfer: FileTransfer,
    private file: File,
    private webview: WebView,
    private modalController: ModalController,
    private socialSharing: SocialSharing,
    private storage: Storage
  ) {
    this.postReferance = this.afstore.collection(`Images/panivida/panividaImage`);
    this.postReferanceSub = this.postReferance.valueChanges().subscribe((obj: any[]) => {
      this.images = obj
      this.storage.get(STORAGE_KEY).then(imageIDs => {
        if (imageIDs) {
          this.imageIDArr = imageIDs;
        }
        this.makeUrl();
      });
    });
  }

  private async makeUrl() {
    this.images.forEach(image => {
      if (this.imageIDArr.includes(image.id)) {

        //this.presentToast("availabe");
        image.src = this.webview.convertFileSrc(this.DATA_DIRECTORY + image.id);

      } else {

        //this.presentToast("not availabe");
        this.fileTransfer.download(image.url, this.DATA_DIRECTORY + image.id).then((entry) => {

          image.src = this.webview.convertFileSrc(entry.toURL());
          this.imageIDArr.push(image.id);
          this.storage.set(STORAGE_KEY, this.imageIDArr);

        }, (error) => {
          this.presentToast(error.message);
        });
      }
    });

  }


  ngOnInit() {

  }
  private deleteImage(id: string, childs: string[]): void {
    if (this.network.type !== "none") {
      this.afstore.doc(`Images/panivida/panividaImage/${id}`).delete().then(err => {

        if (childs) {
          for (let i = 0; i < childs.length; i++) {
            const storagePath = `Images/panivida/${id}/${i.toString()}.jpg`;
            this.afStorage.ref(storagePath).delete();
          }
        } else {
          const storagePath = `Images/panivida/${id}`;
          this.afStorage.ref(storagePath).delete();
        }


        this.presentToast("successfully Deleted the Image");
      });
    } else {
      this.presentToast("Check Your Internet Connection");
    }
  }

  ngOnDestroy() {
    this.postReferanceSub.unsubscribe();
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

  private openPreview(imageUrl: string, id: string, imageChilds: string[]) {

    this.modalController.create({
      component: ImageModalPage,
      componentProps: {
        imageUrl: imageUrl,
        imageChilds: imageChilds,
        id: id
      }
    }).then(modal => {
      modal.present();
    });
  }
  async share(id: string, message: string, childs: string[]) {
    if (childs) {
      this.file.checkFile(this.DATA_DIRECTORY, id + (childs.length - 1).toString() + ".jpg").then(async (res) => {
        let resfileArr: any[] = [];
        resfileArr[0] = (await this.file.resolveLocalFilesystemUrl(this.DATA_DIRECTORY + id)).nativeURL;
        for (let i = 1; i < childs.length; i++) {
          resfileArr[i] = (await this.file.resolveLocalFilesystemUrl(this.DATA_DIRECTORY + id + i.toString() + ".jpg")).nativeURL;
        }
        this.socialSharing.share(message, null, resfileArr, null);
      }).catch(err => {
        this.presentToast("please view all photos before share")
      });

    } else {
      let resfile = await this.file.resolveLocalFilesystemUrl(this.DATA_DIRECTORY + id);
      this.socialSharing.share(message, null, resfile.nativeURL, null);
    }
  }



}
