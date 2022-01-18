import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import Dispecer from '../models/Dispecer';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import Cars from '../models/Cars';
import {DataService} from '../data/data.service';


@Injectable({
  providedIn: 'root'
})
export class CarService {
  private carsCollection: AngularFirestoreCollection<Cars>;
  private cars: Observable<Cars[]>;

  allCars;
  constructor(private afs: AngularFirestore, private dataService: DataService) {
    this.carsCollection = this.afs.collection<Cars>('cars');

    let createdBy;
    const loggedUser = this.dataService.getDispecer();
    if (loggedUser.createdBy !== 'master'){
      createdBy = loggedUser.createdBy;
    }else {
      createdBy = loggedUser.id;
    }

    this.getCars(createdBy).subscribe(res => {
      const dispecer: Dispecer = this.dataService.getDispecer();
      // tu kontrolujem ci mam povolenie k adrese podla aut ktore mam pridelene
      let vyfiltrovanerRouty: Cars[] = res;
      if (dispecer.createdBy !== 'master' && !dispecer.allCars){
        vyfiltrovanerRouty = res.filter(oneCar =>
          dispecer.myCars.includes(oneCar.id));
      }
      this._cars.next(vyfiltrovanerRouty);
      this.allCars = vyfiltrovanerRouty;
    });

  }

  private _cars = new BehaviorSubject<Cars[]>([]);
  readonly cars$ = this._cars.asObservable();

  getCars(createdBy){
    return this.afs.collection<Cars>('cars', ref => {
      let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.where('createdBy', '==', createdBy);
      return query;
    }).snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return {id, ...data};
        });
      })
    );
  }

  getAllCars(): Cars[]{
    return this.allCars;
  }

  createCar(car: Cars){
    const id = this.afs.createId();
    this.afs.collection('cars').doc(id).set(car);
    return id;
  }

  deleteCar(carId){
    return this.carsCollection.doc(carId).delete();
  }

  getCar(carId){
    return this.carsCollection.doc(carId).valueChanges();
  }

  getCarByEcv(carEcv){
    return this.afs.collection('cars', ref => {
      let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.where('ecv', '==', carEcv);
      return query;
    }).valueChanges();
  }

  getCarByNumber(carNumber){
    return this.afs.collection('cars', ref => {
      let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.where('phoneNumber', '==', carNumber);
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
