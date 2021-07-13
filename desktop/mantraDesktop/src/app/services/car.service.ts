import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from "@angular/fire/firestore";
import Dispecer from "../models/Dispecer";
import {BehaviorSubject, Observable} from "rxjs";
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
  allCars;
  constructor(private afs: AngularFirestore, private dataService: DataService) {
    this.carsCollection = this.afs.collection<any>('cars');

    this.getCars().subscribe(res => {
      const dispecer: Dispecer = this.dataService.getDispecer();
      // tu kontrolujem ci mam povolenie k adrese podla aut ktore mam pridelene
      let vyfiltrovanerRouty = res;
      if (dispecer.createdBy !== 'master'){
        vyfiltrovanerRouty = res.filter(oneCar =>
          dispecer.myCars.includes(oneCar.id));
      }
      this._cars.next(vyfiltrovanerRouty);
      this.allCars = vyfiltrovanerRouty;
    });

  }

  private _cars = new BehaviorSubject<any>([]);
  readonly cars$ = this._cars.asObservable();

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
      query = query.where('createdBy', '==', createdBy);
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

  getAllCars(){
    return this.allCars;
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

  getCarByEcv(carEcv){
    return this.afs.collection('cars', ref => {
      let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;

      query = query.where('ecv', '==', carEcv)
      return query;
    }).valueChanges();
  }

  getCarByNumber(carNumber){
    return this.afs.collection('cars', ref => {
      let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;

      query = query.where('phoneNumber', '==', carNumber)
      return query;
    }).valueChanges();
  }

  updateCar(updateCar, id) {
      return this.carsCollection.doc(id).update(updateCar);
  }

  addNavesToCar(updateCar, id) {
    return this.carsCollection.doc(id).update(updateCar);
  }
}
