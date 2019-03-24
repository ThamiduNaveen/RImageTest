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

@Component({
  selector: 'app-photos',
  templateUrl: './photos.page.html',
  styleUrls: ['./photos.page.scss'],
})
export class PhotosPage implements OnInit {

  private postReferance: AngularFirestoreCollection<{}>;
  private postReferanceSub: Subscription;
  private images: { id: string, title: string, url: string, src: string }[];
  private toast: HTMLIonToastElement;

  private fileTransfer: FileTransferObject = this.transfer.create();

  constructor(private afstore: AngularFirestore,
    private toastController: ToastController,
    private router: Router,
    private network: Network,
    private afStorage: AngularFireStorage,
    private transfer: FileTransfer,
    private file: File,
    private webview: WebView,
    private modalController: ModalController,
  ) {
    this.postReferance = this.afstore.collection(`Images/panivida/panividaImage`);
    this.postReferanceSub = this.postReferance.valueChanges().subscribe((obj: any[]) => {
      this.images = obj
      this.makeSrc();
    });


  }
  async makeSrc() {
    this.images.forEach(image => {
      this.getImage(image);
    })
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

  private openPreview(imageUrl: string, imageChilds: string[]) {

    this.modalController.create({
      component: ImageModalPage,
      componentProps: {
        imageUrl: imageUrl,
        imageChilds: imageChilds
      }
    }).then(modal => {
      modal.present();
    });
  }

  private getImage(image: { id: string, title: string, url: string, src: string }) {
    this.file.checkFile(this.file.dataDirectory, image.id).then(isExist => {
      if (isExist.valueOf()) {

        //this.presentToast("availabe");
        image.src = this.webview.convertFileSrc(this.file.dataDirectory + image.id);
      } else {
        this.presentToast("unexpceted place");
      }

    }).catch(err => {

      //this.presentToast(err.message);

      if (err.message === "NOT_FOUND_ERR") {
        this.fileTransfer.download(image.url, this.file.dataDirectory + image.id).then((entry) => {

          image.src = this.webview.convertFileSrc(entry.toURL());

        }, (error) => {
          this.presentToast(error.message)
          image.src = image.url;
        });

      } else {
        this.presentToast("unexpceted place 2");
      }

    })

  }


}
