import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';

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
  depRevByCat:any;
  month:number;
  nowMonth:number = new Date().getMonth();
  year:number = new Date().getFullYear()
  monthName:string[];
  loader:any;

  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public fb: FirebaseService
  ) {
    let user = this.fb.fireAuth.currentUser
    if(user!= null){
      this.userID = user.uid
      this.loader = this.loadingCtrl.create({
        content: "Chargement..."
      });
      this.loader.present();
    }

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
    //console.log('Hello Stats Page');
    if(this.userID){
      this.loadData(this.userID)
      //this.ltest(this.userID)
    }
  }
  loadData(uid){
    let dateMin = new Date(this.year, this.month, 1)
    let dateMax = new Date(this.year, this.month, 31)
    let test = this.fb.userWallet.child(uid)
    test.on('value', (snapshot) => {
      //console.log('test-> ',snapshot.val())

      let dataReadyTrue = {};
      let dataReadyFalse = {};
      let datas = snapshot.val();
      this.getDepRevByAmount(datas,dateMin,dateMax);
      this.depRevByCat = this.getDepRevByCat(datas,dateMin,dateMax);
      //this.depRevByCat = this.depRevByCat.json();
      this.hideLoading()
      //let dataReady = arrayReady.sort((a, b) => a.category.localeCompare(b.category));
      console.log('dataReadyAll-> ',this.depRevByCat)
      //console.log('arrayReady-> ',arrayReady)
    })
  }
  keys(keyName) : Array<string> {
    return Object.keys(this.depRevByCat[keyName]);
  }

  daysInMonth(month) {
    return new Date(this.year, month, 0).getDate();
  }

  upMont(){
    if(this.month < 12){
      this.loader = this.loadingCtrl.create({
        content: "Chargement..."
      });
      this.loader.present();
      this.month = this.month + 1
      this.loadData(this.userID)
    }
    // else {
    //   this.month = 0
    //   this.year = this.year + 1
    // }
  }
  downMont(){
    if(this.month > 0){
      this.loader = this.loadingCtrl.create({
        content: "Chargement..."
      });
      this.loader.present();
      this.month = this.month - 1
      this.loadData(this.userID)
    }
    // else {
    //   this.month = 12
    //   this.year = this.year - 1
    // }
  }

  getDepRevByAmount(datas,dateMin,dateMax){

    let creditTotal:number = 0,
        debitTotal:number = 0;
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
    this.creditTotal = +(Math.round(creditTotal*Math.pow(10,2))/Math.pow(10,2)).toFixed(2);
    this.debitTotal = +(Math.round(debitTotal*Math.pow(10,2))/Math.pow(10,2)).toFixed(2);
    this.solde = +(Math.round((Number(creditTotal) - Number(debitTotal))*Math.pow(10,2))/Math.pow(10,2)).toFixed(2)
  }
  getDepRevByCat(datas,dateMin,dateMax){
    let dataReadyTrue = {},
        dataReadyFalse = {};
    Object.keys(datas).map((key) =>{
      if(datas[key].timestamp > dateMin.getTime() && datas[key].timestamp < dateMax.getTime()){
        let catReady = datas[key].category;
        switch (datas[key].status){
          case true:
            if(dataReadyTrue[catReady]){
              dataReadyTrue[catReady] = parseFloat((dataReadyTrue[catReady] + datas[key].price).toFixed(2))
            }
            else {
              if(catReady){
                dataReadyTrue[catReady] = datas[key].price
              }

            }
            break;
          case false:
            if(dataReadyFalse[catReady]){
              dataReadyFalse[catReady] = parseFloat((dataReadyFalse[catReady] + datas[key].price).toFixed(2))
            }
            else {
              dataReadyFalse[catReady] = datas[key].price
            }
          break;
        }
      }
    });
    return {'revenu': dataReadyTrue, 'depense': dataReadyFalse};
  }

  private hideLoading(){
    this.loader.dismiss();
  }
}
