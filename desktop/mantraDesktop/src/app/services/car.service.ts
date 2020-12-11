import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from "@angular/fire/firestore";
import Dispecer from "../models/Dispecer";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import Cars from "../models/Cars";
import {DataService} from "../data/data.service";
import {log} from "util";

@Injectable({
  providedIn: 'root'
})
export class CarService {
  private carsCollection: AngularFirestoreCollection<Dispecer>;
  private cars: Observable<Dispecer[]>;
  carsCollectionRef: AngularFirestoreCollection<Dispecer>;

  constructor(private afs: AngularFirestore, private dataService: DataService) {
    this.carsCollection = this.afs.collection<any>('cars');
  }
  getCars(){
    var createdBy;
    var loggedUser = this.dataService.getDispecer();
    if (loggedUser.createdBy != 'master'){
      createdBy = loggedUser.createdBy;
    }else {
      createdBy = loggedUser.id;
    }
    return this.afs.collection<Dispecer>('cars', ref => {
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

  createCar(car: Cars){
    return this.afs.collection('cars').add(car);
  }

  deleteCar(carId){
    return this.carsCollection.doc(carId).delete();
  }

  getCar(carId){
    return this.carsCollection.doc(carId).valueChanges();
  }
}
