import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from "@angular/fire/firestore";
import Dispecer from "../models/Dispecer";
import {BehaviorSubject, Observable} from "rxjs";
import {DataService} from "../data/data.service";
import {map, take} from "rxjs/operators";
import Cars from "../models/Cars";
import DeatilAboutAdresses from "../models/DeatilAboutAdresses";
import {RouteService} from "./route.service";
import {OfferRouteService} from "./offer-route.service";
import {CarService} from "./car.service";
import {PrivesService} from "./prives.service";
import Prives from "../models/Prives";
import Route from "../models/Route";

@Injectable({
  providedIn: 'root'
})
export class DetailAboutRouteService {
  private detailCollection: AngularFirestoreCollection<Dispecer>;
  private details: Observable<Dispecer[]>;
  detailsCollectionRef: AngularFirestoreCollection<Dispecer>;

  myDetailsForCheck = [];

  constructor(private afs: AngularFirestore, private dataService: DataService, private routeService: RouteService,
              private offerService: OfferRouteService, private carService: CarService,
              private privesService: PrivesService) {
    this.detailCollection = this.afs.collection<any>('detailRoute');
    //
    // this.getDetails().subscribe(res => {
    //   this._details.next(res);
    // });

    // this.routeService.routes$.subscribe(routes => {
    //   var poleDetailikov = [];
    //   routes.forEach(route => {
    //     route.detailsAboutAdresses.forEach(idDetail => {
    //     if (!this.isThereDetail(idDetail)){
    //
    //         this.getOneDetail(idDetail).subscribe(detailik => { // tu mi dakedy nenatiahne vsetky detaily dal som prec pipu
    //           // @ts-ignore
    //           poleDetailikov.push({...detailik, id: idDetail});
    //           this._details.next(poleDetailikov);
    //           this.setDetails(poleDetailikov);
    //
    //         })
    //     }
    //
    //     })
    //   })
    // })


    //toto je zbytocne, urobim to tak ,ze stiahnem vsetky adresy po 1 ktore mi pridu z ponuk, ,,,
    // this.offerService.routes$.subscribe(routes => {
    //   var poleDetailikov = [];
    //   routes.forEach(route => {
    //     route.detailsAboutAdresses.forEach(idDetail => {
    //       this.getOneDetail(idDetail).pipe(take(1)).subscribe(detailik => {
    //         // @ts-ignore
    //         poleDetailikov.push({...detailik, id: idDetail});
    //         this._offerDetails.next(poleDetailikov);
    //
    //       })
    //     })
    //   })
    // })

  }

  private _offerDetails = new BehaviorSubject<any>([]);
  readonly offerDetails$ = this._offerDetails.asObservable();

  private _details = new BehaviorSubject<any>([]);
  readonly myDetails$ = this._details.asObservable();

  setDetails(detail){
    this.myDetailsForCheck.push(detail)
  }
  isThereDetail(id){
    return this.myDetailsForCheck.find(oneDetail => oneDetail.id == id);
  }

  getDetails() {
    var createdBy;
    var loggedUser = this.dataService.getDispecer();
    if (loggedUser.createdBy != 'master') {
      createdBy = loggedUser.createdBy;
    } else {
      createdBy = loggedUser.id;
    }
    return this.afs.collection<Dispecer>('cars', ref => {
      let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.where('createdBy', '==', createdBy); // na upravu stahujem len novsie sporty
      return query;
    }).snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc['id']
          return {id, ...data};
        });
      })
    );
  }

  createDetail(detail: DetailAboutRouteService) {
    const id = this.afs.createId();
     this.afs.collection('detailRoute').doc(id).set(detail);
    return id;

  }

  deleteCar(carId) {
    return this.detailCollection.doc(carId).delete();
  }

  getOneDetail(detailId) {
    return this.detailCollection.doc(detailId).valueChanges();
  }

  // getCarByEcv(carEcv) {
  //   return this.afs.collection('cars', ref => {
  //     let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
  //
  //     query = query.where('ecv', '==', carEcv)
  //     return query;
  //   }).valueChanges();
  // }

  countFreeWeightOfCarOnAdress(detail: DeatilAboutAdresses[], route: Route){
    var poleVolnejVahy = [];
    var car: Cars;
    var prives: Prives;
      car = this.carService.getAllCars().find(car => car.id == route.carId);

        if (car.navesis != undefined && car.navesis[0] != undefined && car.navesis[0] != ""){
            prives =  this.privesService.getAllPriveses().find(onePrives => onePrives.id == car.navesis[0])
        }
        var celkovaNosnost;
        if (prives != undefined){
          celkovaNosnost = car.nosnost + prives.nosnost;
        }else{
          celkovaNosnost = car.nosnost
        }


        var aktualaHmotnost = 0;
        detail.forEach((oneDetail, index) => {
          var vahaVMeste = 0;
          oneDetail.weight.forEach(jednaVaha => {
            // vahaVMeste += jednaVaha;
            // if (route.type[index] == 'nakladka'){ //treba upravit
            //   aktualaHmotnost += jednaVaha
            // }else{
            //   aktualaHmotnost -= jednaVaha;
            // }
          })
          poleVolnejVahy.push(celkovaNosnost - aktualaHmotnost);
        })

        return poleVolnejVahy

  }

  getCarByNumber(carNumber) {
    return this.afs.collection('cars', ref => {
      let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;

      query = query.where('phoneNumber', '==', carNumber)
      return query;
    }).valueChanges();
  }

  updateDetail(updateCar, id) {
    return this.detailCollection.doc(id).update(updateCar);
  }
}
