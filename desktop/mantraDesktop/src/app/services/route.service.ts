import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from "@angular/fire/firestore";
import Dispecer from "../models/Dispecer";
import {map, take} from "rxjs/operators";
import Cars from "../models/Cars";
import {BehaviorSubject, Observable} from "rxjs";
import Route from "../models/Route";
import {DataService} from "../data/data.service";

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  private routesCollection: AngularFirestoreCollection<Dispecer>;
  private routes: Observable<Dispecer[]>;

  private allRoutesSource = new BehaviorSubject<any>(null);
  allRoutes = this.allRoutesSource.asObservable();


  constructor(private afs: AngularFirestore, private dataService: DataService) {
    this.routesCollection = this.afs.collection<any>('route');

    this.getAllRoutes().subscribe(res => {
      // res.
      this._routes.next(res);
    });

  }

  private _routes = new BehaviorSubject<any>([]);
  readonly routes$ = this._routes.asObservable();

  getRoutes(carId){
    return this.afs.collection<Dispecer>('route', ref => {
      let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.where('carId', '==', carId).where('finished', '==', false)
      ref.orderBy('createdAt');
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

  // getRoutesOrder(carId){
  //   return this.afs.collection('route').
  //
  // }

  //toto i treba dorobit
  createRoute(route: Route){
    console.log(route)
    return this.afs.collection('route').add(route);
  }

  updateRoute(newRoute) {
    console.log(newRoute)
    if (newRoute.id === undefined){
      this.createRoute(newRoute);
      return;
    }else {
      return this.routesCollection.doc(newRoute.id).update(newRoute);
    }
  }

  getAllRoutes(){
    //id of logged dispecer
    var id;
    var loggedDispecer = this.dataService.getDispecer();
    if (loggedDispecer.createdBy == 'master'){
      id = loggedDispecer.id
    }else{
      id = loggedDispecer.createdBy;
    }
      return this.afs.collection<Dispecer>('route', ref => {
        let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
        query = query.where('createdBy', '==', id)
          .where('finished', '==', false)
        ref.orderBy('createdAt');
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

  getAllFinishedRoutes(){
    //id of logged dispecer
    var id;
    var loggedDispecer = this.dataService.getDispecer();
    if (loggedDispecer.createdBy == 'master'){
      id = loggedDispecer.id
    }else{
      id = loggedDispecer.createdBy;
    }
    return this.afs.collection<Dispecer>('route', ref => {
      let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.where('createdBy', '==', id)
        .where('finished', '==', true)
        .orderBy('finishedAt', 'desc').limit(10);
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



  deleteRoute(routeId){
    return this.routesCollection.doc(routeId).delete();
  }



}
