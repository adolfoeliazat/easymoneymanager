import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { FirebaseService } from '../../providers/firebase-service';

/*
  Generated class for the Stats page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-stats',
  templateUrl: 'stats.html'
})
export class StatsPage {

  userID:string;
  creditTotal:number;
  debitTotal:number;
  solde:number;
  month:number;
  nowMonth:number = new Date().getMonth();
  year:number = new Date().getFullYear()
  monthName:string[];

  constructor(
    public navCtrl: NavController,
    public fb: FirebaseService
  ) {
    this.fb.fireAuth.onAuthStateChanged((user)=> {
        if (user) {
          // User is signed in.
          this.userID = user.uid
          this.loadData(this.userID)
        } else {
          // No user is signed in.
        }
    });
    this.month = new Date().getMonth()
    this.monthName = [
      'janvier',
      'février',
      'mars',
      'avril',
      'mai',
      'juin',
      'juillet',
      'août',
      'septembre',
      'octobre',
      'novembre',
      'décembre'
    ]
  }

  ionViewDidLoad() {
    console.log('Hello Stats Page');
  }

  loadData(uid){
    let dateMin = new Date(new Date().getFullYear(), this.month, 1)
    let dateMax = new Date(new Date().getFullYear(), this.month, 31)
    this.fb.userWallet.child(uid)
    .on('value', (snapshot)=> {
      let creditTotal:number = 0;
      let debitTotal:number = 0;
      let datas = snapshot.val();
      Object.keys(datas).map((key) =>{
        if(datas[key].timestamp > dateMin.getTime() && datas[key].timestamp < dateMax.getTime()){
          switch (datas[key].status) {
            case true:
              creditTotal = Number(creditTotal) + Number(datas[key].price)
              break;
            case false:
              debitTotal = Number(debitTotal) + Number(datas[key].price)
              break;
          }
        }
      });
      this.creditTotal = creditTotal;
      this.debitTotal = debitTotal;
      this.solde = Number(creditTotal) - Number(debitTotal);
      //console.log('true-> ', creditTotal)
      //console.log('false-> ', debitTotal)
    });
  }

  daysInMonth(month) {
    return new Date(this.year, month, 0).getDate();
  }

  upMont(){
    if(this.month < 12){
      this.month = this.month + 1
      this.loadData(this.userID)
    }

  }
  downMont(){
    if(this.month > 0){
      this.month = this.month - 1
      this.loadData(this.userID)
    }
  }
}
