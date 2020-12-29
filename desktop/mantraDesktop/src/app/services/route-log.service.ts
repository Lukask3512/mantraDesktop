import { Injectable } from '@angular/core';
import {AngularFirestore} from "@angular/fire/firestore";

@Injectable({
  providedIn: 'root'
})
export class RouteLogService {

  constructor(private afs: AngularFirestore) { }

  getLogFromRoute(routeId) {
    return this.afs.collection('routeLog', ref => ref.where("routeId", '==', routeId)).valueChanges();

  }
}
