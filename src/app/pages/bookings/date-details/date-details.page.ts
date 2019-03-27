import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
import { CallNumber } from '@ionic-native/call-number/ngx';

@Component({
  selector: 'app-date-details',
  templateUrl: './date-details.page.html',
  styleUrls: ['./date-details.page.scss'],
})
export class DateDetailsPage implements OnInit {

  constructor(
    private afstore: AngularFirestore,
    private route: ActivatedRoute,
    private toastController: ToastController,
    private callNumber: CallNumber,
    private alertController: AlertController
  ) {
    this.sub = this.route
      .queryParams
      .subscribe(params => {
        this.date = JSON.parse(params["date"]);
      });

  }

  private sub: Subscription;
  private bookingsSub: Subscription;
  private toast: HTMLIonToastElement;
  private date: {
    date: string,
    start: string,
    end: string,
    appoinments: number,
    booked: number,
    id: string
  };
  private dates: {}[];

  ngOnInit() {
    this.bookingsSub = this.afstore.collection(`appoinments/dates/${this.date.id}`).valueChanges().subscribe((obj: any[]) => {
      this.dates = obj
    });
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
    this.bookingsSub.unsubscribe();
  }
  private call(telephone: string) {
    this.callNumber.callNumber(telephone, true)
      .then(res => { })
      .catch(err => { });

  }
  private deleteBook(id: string) {
    this.presentAlertConfirm(id);
  }

  async presentAlertConfirm(id: string) {

    const alert = await this.alertController.create({
      header: 'Note',
      message: 'Are you sure you want to <strong> delete </strong> Booking',
      cssClass: 'alert',
      buttons: [
        {
          text: 'Yes',
          handler: () => {

            let sub: Subscription = this.afstore.doc(`appoinments/dates/available/${this.date.id}`).valueChanges().subscribe((result: any) => {
              result.booked = result.booked - 1;
              sub.unsubscribe();
              this.afstore.doc(`appoinments/dates/available/${this.date.id}`).set(result).then(res => {
                this.afstore.doc(`appoinments/dates/${this.date.id}/${id}`).delete().then(res => {
                  this.presentToast("Succefully deleted the date")
                });
              });
            }, err => {
              console.log(err);
            });

          }
        },
        {
          text: 'No',
        }
      ]
    });

    await alert.present();
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
