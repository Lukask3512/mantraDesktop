import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from "@angular/fire/firestore";
import Dispecer from "../models/Dispecer";
import {BehaviorSubject, Observable} from "rxjs";
import {DataService} from "../data/data.service";
import {map} from "rxjs/operators";
import Route from "../models/Route";
import Address from "../models/Address";

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  addressesGet: Address[];
  private addressCollection: AngularFirestoreCollection<Address[]>;
  private addresses: Observable<Dispecer[]>;

  private allAddressSource = new BehaviorSubject<any>(null);
  allRoutes = this.allAddressSource.asObservable();


  constructor(private afs: AngularFirestore, private dataService: DataService) {
    this.addressCollection = this.afs.collection<any>('address');

    this.getRoutes().subscribe(res => {
      this.addressesGet = res
      this._address.next(res);
    });

  }

  private _address = new BehaviorSubject<any>([]);
  readonly address$ = this._address.asObservable();

  getRoutes(){
    var createdId = this.dataService.getMyIdOrMaster();
    return this.afs.collection<Address>('address', ref => {
      let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.where('createdBy', '==', createdId);
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

  getAddresses(): Address[]{
    return this.addressesGet;
  }

  // getRoutesOrder(carId){
  //   return this.afs.collection('route').
  //
  // }

  //toto i treba dorobit
  // createRoute(route: Route){
  //   const id = this.afs.createId();
  //   this.afs.collection('route').doc(id).set(route);
  //   return id;
  //   // return this.afs.collection('route').add(route);
  // }
  //
  // updateRoute(newRoute) {
  //   console.log(newRoute)
  //   if (newRoute.id === undefined){
  //     this.createRoute(newRoute);
  //     return;
  //   }else {
  //     return this.routesCollection.doc(newRoute.id).update(newRoute);
  //   }
  // }

  createAddressWithId(address: Address) {
    const id = this.afs.createId();
    this.afs.collection('address').doc(id).set(address);
    return id;

  }



  //
  // deleteRoute(routeId){
  //   return this.routesCollection.doc(routeId).delete();
  // }



}
