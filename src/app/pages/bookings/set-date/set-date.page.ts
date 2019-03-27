import { Component, OnInit } from '@angular/core';
import { DatePicker } from '@ionic-native/date-picker/ngx';
import { ToastController, AlertController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';


@Component({
  selector: 'app-set-date',
  templateUrl: './set-date.page.html',
  styleUrls: ['./set-date.page.scss'],
})
export class SetDatePage implements OnInit {

  constructor(
    private toastController: ToastController,
    private alertController: AlertController,
    private afstore: AngularFirestore,
    private route: Router,
  ) {
  }

  private fixedDate: string;
  private toast: HTMLIonToastElement;
  private today: string;
  private startTime: string;
  private endTime: string;
  private appoinments: Number;


  ngOnInit() {

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

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: 'Note',
      message: 'Are you sure you want to set<strong> old date </strong>?',
      cssClass: 'alert',
      buttons: [
        {
          text: 'Yes',
        },
        {
          text: 'No',
          handler: () => {
            this.fixedDate = "";
          }
        }
      ]
    });
    
    await alert.present();
  }
  private CheckValidtyDate(dateEnter: string): void {
    let today = new Date().toISOString();
    today = today.substr(0, today.indexOf('T'));
    const todayDateArr = today.split('-');
    const dateEnterArr = dateEnter.split('-');

    if (parseInt(todayDateArr[0]) > parseInt(dateEnterArr[0])) {
      this.presentAlertConfirm();
    } else if (
      parseInt(todayDateArr[0]) == parseInt(dateEnterArr[0])
      && (parseInt(todayDateArr[1]) > parseInt(dateEnterArr[1]))
    ) {
      this.presentAlertConfirm();
    } else if (
      parseInt(todayDateArr[0]) === parseInt(dateEnterArr[0])
      && parseInt(todayDateArr[1]) === parseInt(dateEnterArr[1])
      && parseInt(todayDateArr[2]) > parseInt(dateEnterArr[2])
    ) {
      this.presentAlertConfirm();
    }
  }
  
  private submit(fixedDate: string, startTime: string, endTime: string, appoinments: number): void {
    if (!fixedDate) {
      this.presentToast("Please enter the date");
    } else if (!startTime) {
      this.presentToast("Please enter the start time");
    } else if (!endTime) {
      this.presentToast("Please enter the end time");
    } else if (!appoinments || appoinments < 0) {
      this.presentToast("Please enter valid number of appoinments");
    } else if (this.checkValidityTime(startTime, endTime)) {
      this.databaseUpdate(fixedDate, startTime, endTime, appoinments);
    }

  }

  private checkValidityTime(start: string, end: string): boolean {
    const startArr: string[] = start.split(":");
    const endArr: string[] = end.split(":");
    const startNum: number = parseInt(startArr[0]) * 60 + parseInt(startArr[1]);
    const endNum: number = parseInt(endArr[0]) * 60 + parseInt(endArr[1]);
    if (startNum >= endNum) {
      this.presentToast("Please Enter later time to end from start");
      return false;
    } else {
      return true;
    }
  }

  private databaseUpdate(fixedDate: string, startTime: string, endTime: string, appoinments: number) {
    let id = this.createFileName();
    this.afstore.doc(`appoinments/dates/available/${id}`).set({

      date: fixedDate,
      start: startTime,
      end: endTime,
      appoinments: appoinments,
      booked:0,
      id: id

    }).then(res => {
      this.fixedDate = "";
      this.startTime = "";
      this.endTime = "";
      this.appoinments = null;
      this.presentToast('Date fixed successfully');
      this.route.navigate(['/book/'])

    });
  }

  private createFileName(): string {
    return (2552750023644 - new Date().getTime()).toString();
  }

}
