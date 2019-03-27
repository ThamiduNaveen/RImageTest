import { Component, OnInit } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';


@Component({
  selector: 'app-book',
  templateUrl: './book.page.html',
  styleUrls: ['./book.page.scss'],
})
export class BookPage implements OnInit {

  private dates: {
    date: string,
    start: string,
    end: string,
    appoinments: Number,
    booked: number,
    id: string
  }[];
  private postReferance: AngularFirestoreCollection<{}>;
  private postReferanceSub: Subscription;
  private toast: HTMLIonToastElement;

  constructor(
    private afstore: AngularFirestore,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController,
  ) {
    this.postReferance = this.afstore.collection(`appoinments/dates/available`);
    this.postReferanceSub = this.postReferance.valueChanges().subscribe((obj: any[]) => {
      this.dates = obj
    });
  }

  ngOnInit() {
  }

  private bookDate(date): void {
    if (date.booked >= date.appoinments) {
      this.presentToast("this date is full")
    } else {
      this.router.navigate(['/book/book-details'], { queryParams: { date: JSON.stringify(date) } })
    }
  }
  private getDetails(date): void {
    this.router.navigate(['/book/date-details'], { queryParams: { date: JSON.stringify(date) } })
  }


  private navigate() {
    this.router.navigate(['/book/tabs'])
  }

  private deleteDate(id: string, books: number) {
    this.presentAlertConfirm(id, books);

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

  async presentAlertConfirm(id: string, books: number) {

    const alert = await this.alertController.create({
      header: 'Note',
      message: 'Are you sure you want to <strong> delete </strong> date with ' + books.toString() + ' appoinments',
      cssClass: 'alert',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            let sub: Subscription = this.afstore.collection(`appoinments/dates/${id}`).valueChanges().subscribe((res: any) => {
              //console.log(res);
              res.forEach(date => {
                this.afstore.doc(`appoinments/dates/${id}/${date.bookId}`).delete();
              });
              sub.unsubscribe();
              this.afstore.doc(`appoinments/dates/available/${id}`).delete().then(res => {
                this.presentToast("Succefully deleted the date")
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

}
