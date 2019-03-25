import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { File } from '@ionic-native/File/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';

@Component({
  selector: 'app-image-modal',
  templateUrl: './image-modal.page.html',
  styleUrls: ['./image-modal.page.scss'],
})
export class ImageModalPage implements OnInit {

  @ViewChild('slider', { read: ElementRef }) slider: ElementRef;
  private imageUrl: string;
  private imageChilds: string[] = [];
  private id: string;
  private imageIDArr: string[] = [];
  private childSrc: string[] = [];
  private DATA_DIRECTORY: string = this.file.dataDirectory;
  private fileTransfer: FileTransferObject = this.transfer.create();


  sliderOpts = {
    zoom: {
      maxRatio: 3
    }
  };

  constructor(
    private navParams: NavParams,
    private modalController: ModalController,
    private storage: Storage,
    private webview: WebView,
    private file: File,
    private transfer: FileTransfer,
  ) {
    this.imageUrl = this.navParams.get('imageUrl');
    this.imageChilds = this.navParams.get('imageChilds');
    this.id = this.navParams.get('id');

    this.storage.get(this.id).then(imageIDs => {
      if (imageIDs) {
        this.imageIDArr = imageIDs;
      }
      this.makeUrl();
    });
  }

  private async makeUrl() {
    for (let i = 0; i < this.imageChilds.length; i++) {
      if (this.imageIDArr.includes(i.toString() + ".jpg")) {

        this.childSrc[i] = this.webview.convertFileSrc(this.DATA_DIRECTORY + this.id + i.toString() + ".jpg");

      } else {

        //this.presentToast("not availabe");
        this.fileTransfer.download(this.imageChilds[i], this.DATA_DIRECTORY + this.id + i.toString() + ".jpg").then((entry) => {

          this.childSrc[i] = this.webview.convertFileSrc(entry.toURL());
          this.imageIDArr.push(i.toString() + ".jpg");
          this.storage.set(this.id, this.imageIDArr);

        }, (error) => {
          //this.presentToast(error.message);
        });
      }

    }
  }

  ngOnInit() {
  }

  zoom(zoomIn: boolean) {
    let zoom = this.slider.nativeElement.swiper.zoom;
    if (zoomIn) {
      zoom.in();
    } else {
      zoom.out();
    }
  }

  close() {
    this.modalController.dismiss();
  }

}
