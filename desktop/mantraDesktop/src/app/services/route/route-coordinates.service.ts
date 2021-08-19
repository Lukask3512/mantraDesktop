import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import Company from '../../models/Company';

@Injectable({
  providedIn: 'root'
})
export class RouteCoordinatesService {

  private routeCollection: AngularFirestoreCollection<any>;
  constructor(private afs: AngularFirestore) {
    this.routeCollection = this.afs.collection<any>('routeStatus');
  }

  getRoute(carId) {
    return this.routeCollection.doc(carId).valueChanges();
  }
}
