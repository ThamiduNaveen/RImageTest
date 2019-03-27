import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/firestore';


@Component({
  selector: 'app-book-details',
  templateUrl: './book-details.page.html',
  styleUrls: ['./book-details.page.scss'],
})
export class BookDetailsPage implements OnInit {

  private districtAr: string[] = ["Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", "Hambantota",
    "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala", "Mullaitivu",
    "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"]


  private date: {
    date: string,
    start: string,
    end: string,
    appoinments: number,
    booked: number ,
    id: string
  };
  private toast: HTMLIonToastElement;
  private birthday: string;
  private name: string;
  private telephone: string;
  private district: string;

  constructor(
    private afstore: AngularFirestore,
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController
  ) {

  }

  private sub: Subscription;

  ngOnInit() {
    this.sub = this.route
      .queryParams
      .subscribe(params => {
        this.date = JSON.parse(params["date"]);
      });
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  private CheckValidtyDate(dateEnter: string): void {
    if (dateEnter) {
      let today = new Date().toISOString();
      today = today.substr(0, today.indexOf('T'));
      const todayDateArr = today.split('-');
      const dateEnterArr = dateEnter.split('-');

      if (parseInt(todayDateArr[0]) < parseInt(dateEnterArr[0])) {
        this.presentToast("Enter a valid birthday");
        this.birthday = null;
      } else if (
        parseInt(todayDateArr[0]) === parseInt(dateEnterArr[0])
        && (parseInt(todayDateArr[1]) < parseInt(dateEnterArr[1]))
      ) {
        this.presentToast("Enter a valid birthday");
        this.birthday = null;
      } else if (
        parseInt(todayDateArr[0]) === parseInt(dateEnterArr[0])
        && parseInt(todayDateArr[1]) === parseInt(dateEnterArr[1])
        && parseInt(todayDateArr[2]) < parseInt(dateEnterArr[2])
      ) {
        this.presentToast("Enter a valid birthday");
        this.birthday = null;
      }
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

  submit(name: string, birthday: string, telephone: string, district: string, id: string) {
    if (!name) {
      this.presentToast("please enter valid name");
    } else if (!birthday) {
      this.presentToast("please enter valid birthday");
    } else if (!telephone || telephone.length < 10) {
      this.presentToast("please enter valid telephone number");
    } else if (!district) {
      this.presentToast("please select your district");
    } else {
      let booked: number;
      let appoinments: number;
      let sub: Subscription = this.afstore.doc(`appoinments/dates/available/${id}`).valueChanges().subscribe((obj: any) => {
        this.date = obj;
        sub.unsubscribe();
        if (this.date.booked < this.date.appoinments) {
          this.date.booked = this.date.booked + 1;
          this.afstore.doc(`appoinments/dates/available/${id}`).set(this.date).then(res => {
            this.databaseUpdate(name, birthday, telephone, district, id);

          }).catch(err => {
            this.presentToast('Unexpected error occured try again');

          });

        } else {
          this.name = "";
          this.birthday = "";
          this.telephone = "";
          this.district = null;

          this.presentToast('Date limit exeeded');
          this.router.navigate(['/book/'])
        }
      });

    }

  }

  private databaseUpdate(name: string, birthday: string, telephone: string, district: string, id: string) {
    let bookId = this.createFileName();
    this.afstore.doc(`appoinments/dates/${id}/${bookId}`).set({

      name: name,
      birthday: birthday,
      telephone: telephone,
      district: district,
      bookId: bookId,
      appoinmentNo: 0,
      id: id

    }).then(res => {
      this.name = "";
      this.birthday = "";
      this.telephone = "";
      this.district = null;
      this.presentToast('Date booked successfully');
      this.router.navigate(['/book/'])

    });
  }

  private createFileName(): string {
    return (2552750023644 - new Date().getTime()).toString();
  }



}
