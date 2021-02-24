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

@Injectable({
  providedIn: 'root'
})
export class DetailAboutRouteService {
  private detailCollection: AngularFirestoreCollection<Dispecer>;
  private details: Observable<Dispecer[]>;
  detailsCollectionRef: AngularFirestoreCollection<Dispecer>;

  constructor(private afs: AngularFirestore, private dataService: DataService, private routeService: RouteService,
              private offerService: OfferRouteService) {
    this.detailCollection = this.afs.collection<any>('detailRoute');

    this.getDetails().subscribe(res => {
      this._details.next(res);
    });

    this.routeService.routes$.subscribe(routes => {
      var poleDetailikov = [];
      routes.forEach(route => {
        route.detailsAboutAdresses.forEach(idDetail => {
          this.getOneDetail(idDetail).pipe(take(1)).subscribe(detailik => {
            // @ts-ignore
            poleDetailikov.push({...detailik, id: idDetail});
            this._details.next(poleDetailikov);

          })
        })
      })
    })

    this.offerService.routes$.subscribe(routes => {
      var poleDetailikov = [];
      routes.forEach(route => {
        route.detailsAboutAdresses.forEach(idDetail => {
          this.getOneDetail(idDetail).pipe(take(1)).subscribe(detailik => {
            // @ts-ignore
            poleDetailikov.push({...detailik, id: idDetail});
            this._offerDetails.next(poleDetailikov);

          })
        })
      })
    })

  }

  private _offerDetails = new BehaviorSubject<any>([]);
  readonly offerDetails$ = this._offerDetails.asObservable();

  private _details = new BehaviorSubject<any>([]);
  readonly myDetails$ = this._details.asObservable();

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
