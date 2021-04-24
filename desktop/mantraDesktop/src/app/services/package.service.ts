import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from "@angular/fire/firestore";
import Address from "../models/Address";
import {BehaviorSubject, Observable} from "rxjs";
import Dispecer from "../models/Dispecer";
import {DataService} from "../data/data.service";
import {OfferRouteService} from "./offer-route.service";
import {map} from "rxjs/operators";
import DeatilAboutAdresses from "../models/DeatilAboutAdresses";

@Injectable({
  providedIn: 'root'
})
export class PackageService {

  private packagesCollection: AngularFirestoreCollection<any>;


  private allPackagesSource = new BehaviorSubject<any>(null);
  allPackages = this.allPackagesSource.asObservable();


  constructor(private afs: AngularFirestore, private dataService: DataService, private offerService: OfferRouteService) {
    this.packagesCollection = this.afs.collection<any>('address');

    // this.getRoutes().subscribe(res => {
    //   this.addressesGet = res
    //   this._address.next(res);
    // });
    // this.getOfferAddresses();

  }



  getOneAddresFromDatabase(detailId) {
    return this.packagesCollection.doc(detailId).valueChanges();
  }



  getOneAddresById(id): Observable<Address> {
    return this.allPackages.pipe(
      map(txs => txs.find(txn => txn.id === id))
    );
  }




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

  createPackageWithId(myPackage: DeatilAboutAdresses) {
    const id = this.afs.createId();
    this.afs.collection('packages').doc(id).set(myPackage);
    return id;

  }


//
// deleteRoute(routeId){
//   return this.routesCollection.doc(routeId).delete();
// }
}

