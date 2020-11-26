import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from "@angular/fire/firestore";
import Dispecer from "../models/Dispecer";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import Cars from "../models/Cars";

@Injectable({
  providedIn: 'root'
})
export class CarService {
  private carsCollection: AngularFirestoreCollection<Dispecer>;
  private cars: Observable<Dispecer[]>;
  carsCollectionRef: AngularFirestoreCollection<Dispecer>;

  constructor(private afs: AngularFirestore) {
    this.carsCollection = this.afs.collection<any>('cars');
  }
  getCars(){
    return this.afs.collection<Dispecer>('cars').snapshotChanges().pipe(
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
}
