import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { ToastController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Network } from '@ionic-native/network/ngx';
import { Subscription } from 'rxjs';
import { ImageModalPage } from '../image-modal/image-modal.page';
import { AngularFireStorageReference, AngularFireUploadTask, AngularFireStorage } from '@angular/fire/storage';


@Component({
  selector: 'app-photos',
  templateUrl: './photos.page.html',
  styleUrls: ['./photos.page.scss'],
})
export class PhotosPage implements OnInit {

  private postReferance: AngularFirestoreCollection<{}>;
  private postReferanceSub: Subscription;
  private images: {}[];
  private toast: HTMLIonToastElement;


  constructor(private afstore: AngularFirestore,
    private toastController: ToastController,
    private router: Router,
    private network: Network,
    private modalController: ModalController,
    private afStorage: AngularFireStorage,
  ) { }

  ngOnInit() {
    this.postReferance = this.afstore.collection(`Images/panivida/panividaImage`);
    this.postReferanceSub = this.postReferance.valueChanges().subscribe(obj => {
      //console.log(obj);
      this.images = obj
    });
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

  openPreview(imageUrl: string, imageChilds: string[]) {
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

}
