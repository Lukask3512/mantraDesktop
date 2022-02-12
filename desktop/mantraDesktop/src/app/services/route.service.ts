import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import Dispecer from '../models/Dispecer';
import {map, take} from 'rxjs/operators';
import Cars from '../models/Cars';
import {BehaviorSubject, Observable} from 'rxjs';
import Route from '../models/Route';
import {DataService} from '../data/data.service';
import Address from '../models/Address';

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  private myRoutes: Route[];
  private finishedMyRoutes: Route[];
  private routesCollection: AngularFirestoreCollection<Dispecer>;
  private routes: Observable<Dispecer[]>;

  private allRoutesSource = new BehaviorSubject<any>(null);
  allRoutes = this.allRoutesSource.asObservable();


  constructor(private afs: AngularFirestore, private dataService: DataService) {
    this.routesCollection = this.afs.collection<any>('route');

    this.getAllRoutes().subscribe(res => {
      const dispecer: Dispecer = this.dataService.getDispecer();
      // tu kontrolujem ci mam povolenie k adrese podla aut ktore mam pridelene
      let vyfiltrovanerRouty = res;
      if (dispecer.createdBy !== 'master' && !dispecer.allCars){
        vyfiltrovanerRouty = res.filter(oneAddress =>
          dispecer.myCars.includes(oneAddress.carId) || oneAddress.carId === null);
      }
      this._routes.next(vyfiltrovanerRouty);
      this.myRoutes = vyfiltrovanerRouty;
    });

    this.getAllFinishedRoutes().subscribe(res => {
      const dispecer: Dispecer = this.dataService.getDispecer();
      // tu kontrolujem ci mam povolenie k adrese podla aut ktore mam pridelene
      let vyfiltrovanerRouty = res;
      if (dispecer.createdBy !== 'master' && !dispecer.allCars){
        vyfiltrovanerRouty = res.filter(oneAddress =>
          dispecer.myCars.includes(oneAddress.carId) || oneAddress.carId === null);
      }
      this._finishedRoutes.next(vyfiltrovanerRouty);
      this.finishedMyRoutes = vyfiltrovanerRouty;
    });

  }

  private _routes = new BehaviorSubject<Route[]>([]);
  readonly routes$ = this._routes.asObservable();

  private _finishedRoutes = new BehaviorSubject<any>([]);
  readonly finishedRoutes$ = this._finishedRoutes.asObservable();

  getRoutes(carId){
    return this.afs.collection<Dispecer>('route', ref => {
      let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.where('carId', '==', carId).where('finished', '==', false);
      ref.orderBy('createdAt');
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

  // getRoutesOrder(carId){
  //   return this.afs.collection('route').
  //
  // }

  // toto i treba dorobit
  async createRoute(route: Route){
    return new Promise(resolve => {
      const id = this.afs.createId();
      this.afs.collection('route').doc(id).set(route);
      resolve (id);
    });
    // return this.afs.collection('route').add(route);
  }

  getRoutesNoSub(){
    return this.myRoutes;
  }

  updateRoute(newRoute) {
    console.log(newRoute);
    if (newRoute.id === undefined){
      this.createRoute(newRoute);
      return;
    }else {
      return this.routesCollection.doc(newRoute.id).update(newRoute);
    }
  }

  createRouteWithId(address: Address) {
    const id = this.afs.createId();
    this.afs.collection('route').doc(id).set(address);
    return id;

  }

  getAllRoutes(){
    // id of logged dispecer
    let id;
    let loggedDispecer = this.dataService.getDispecer();
    if (loggedDispecer.createdBy == 'master'){
      id = loggedDispecer.id;
    }else{
      id = loggedDispecer.createdBy;
    }
    return this.afs.collection<Route>('route', ref => {
        let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
        query = query.where('createdBy', '==', id)
          .where('finished', '==', false)
          .where('forEveryone', '==', false).where('takenBy', '==', '');
        ref.orderBy('createdAt');
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

  getAllFinishedRoutes(){
    // id of logged dispecer
    let id;
    let loggedDispecer = this.dataService.getDispecer();
    if (loggedDispecer.createdBy == 'master'){
      id = loggedDispecer.id;
    }else{
      id = loggedDispecer.createdBy;
    }
    return this.afs.collection<Route>('route', ref => {
      let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.where('createdBy', '==', id)
        .where('finished', '==', true)
        .orderBy('finishedAt', 'desc').limit(20);
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



  deleteRoute(routeId){
    return this.routesCollection.doc(routeId).delete();
  }



}
