import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from "@angular/fire/firestore";
import Dispecer from "../models/Dispecer";
import {BehaviorSubject, Observable} from "rxjs";
import {DataService} from "../data/data.service";
import {map} from "rxjs/operators";
import Cars from "../models/Cars";
import Prives from "../models/Prives";

@Injectable({
  providedIn: 'root'
})
export class PrivesService {
  private privesCollection: AngularFirestoreCollection<Dispecer>;
  private prives: Observable<Dispecer[]>;
  privesCollectionRef: AngularFirestoreCollection<Dispecer>;

  allPrives;

  constructor(private afs: AngularFirestore, private dataService: DataService) {
    this.privesCollection = this.afs.collection<any>('prives');

    this.getPrives().subscribe(res => {
      this._prives.next(res);
      this.allPrives = res;
    })

  }

  private _prives = new BehaviorSubject<any>([]);
  readonly prives$ = this._prives.asObservable();

  getPrives(){
    var createdBy;
    var loggedUser = this.dataService.getDispecer();
    if (loggedUser.createdBy != 'master'){
      createdBy = loggedUser.createdBy;
    }else {
      createdBy = loggedUser.id;
    }
    return this.afs.collection<Dispecer>('prives', ref => {
      let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
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

  createPrives(prives: Prives){
    return this.afs.collection('prives').add(prives);
  }

  deletePrives(privesId){
    return this.privesCollection.doc(privesId).delete();
  }

  getPrive(privesId){
    return this.privesCollection.doc(privesId).valueChanges();
  }

  getPrivesByEcv(privesEcv){
    return this.afs.collection('prives', ref => {
      let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;

      query = query.where('ecv', '==', privesEcv)
      return query;
    }).valueChanges();
  }

  getPrivesById(id){
    if (this.allPrives != undefined)
    return this.allPrives.find(prives => prives.id == id);
  }

  // getCarByNumber(carNumber){
  //   return this.afs.collection('cars', ref => {
  //     let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
  //
  //     query = query.where('phoneNumber', '==', carNumber)
  //     return query;
  //   }).valueChanges();
  // }
}
