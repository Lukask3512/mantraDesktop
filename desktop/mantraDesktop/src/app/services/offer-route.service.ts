import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from "@angular/fire/firestore";
import Dispecer from "../models/Dispecer";
import {BehaviorSubject, combineLatest, Observable} from "rxjs";
import {DataService} from "../data/data.service";
import {map, take} from "rxjs/operators";
import Route from "../models/Route";

@Injectable({
  providedIn: 'root'
})
export class OfferRouteService {
  private routesCollection: AngularFirestoreCollection<Dispecer>;
  private routes: Observable<Dispecer[]>;

  private allRoutesSource = new BehaviorSubject<any>(null);
  allRoutes = this.allRoutesSource.asObservable();

  routesForGet;

  constructor(private afs: AngularFirestore, private dataService: DataService) {
    this.routesCollection = this.afs.collection<any>('route');

    this.readAllQueries().subscribe(res => {
      var allKindTogether = res[0].concat(res[1], res[2]);
      this.routesForGet = allKindTogether;
      this._routes.next(allKindTogether);
    });

  }
  // toto je zbytocne, urobim to tak ,ze stiahnem vsetky adresy po 1 ktore mi pridu z ponuk, ,,,
  private _routes = new BehaviorSubject<any>([]);
  readonly routes$ = this._routes.asObservable();

  getRoutesNoSub(){
    return this.routesForGet;
  }

  // vsetky nepriradene
  getRoutes(){
    return this.afs.collection<Dispecer>('route', ref => {
      let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.where('forEveryone', '==', true)
        .where('takenBy', '==', "")
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

  // vsetky mnou vytvorene
  getRoutesMine(){
    return this.afs.collection<Dispecer>('route', ref => {
      let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.where('forEveryone', '==', false)
        .where('createdBy', '==', this.getDispecerId())
        .where('takenBy', '!=', '')
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

  // vsetky routy ktore som mal v autach
  getRoutesPriradeneMne(){
    return this.afs.collection<Dispecer>('route', ref => {
      let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.where('forEveryone', '==', false)
        .where('takenBy', '==', this.getDispecerId())
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

  readAllQueries(): Observable<any>{
    return combineLatest(this.getRoutes(), this.getRoutesMine(), this.getRoutesPriradeneMne());
  }

  getDispecerId(){
    var idCreated;
    if (this.dataService.getDispecer().createdBy == 'master'){
      return this.dataService.getDispecer().id
    }else{
      return this.dataService.getDispecer().createdBy
    }
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
