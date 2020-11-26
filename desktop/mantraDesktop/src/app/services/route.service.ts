import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from "@angular/fire/firestore";
import Dispecer from "../models/Dispecer";
import {map} from "rxjs/operators";
import Cars from "../models/Cars";
import {Observable} from "rxjs";
import Route from "../models/Route";

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  private routesCollection: AngularFirestoreCollection<Dispecer>;
  private routes: Observable<Dispecer[]>;


  constructor(private afs: AngularFirestore) {
    this.routesCollection = this.afs.collection<any>('route');
  }
  getRoutes(carId){
    return this.afs.collection<Dispecer>('route', ref => {
      let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.where('carId', '==', carId); // na upravu stahujem len novsie sporty
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

  createRoute(route: Route){
    return this.afs.collection('route').add(route);
  }

  updateRoute(newRoute) {
    console.log(newRoute.id)
    if (newRoute.id === undefined){
      this.createRoute(newRoute);
      return;
    }else {
      return this.routesCollection.doc(newRoute.id).update(newRoute);
    }
  }
}
