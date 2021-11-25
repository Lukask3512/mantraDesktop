import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import Address from '../models/Address';
import {BehaviorSubject, Observable} from 'rxjs';
import {DataService} from '../data/data.service';
import {OfferRouteService} from './offer-route.service';
import {map} from 'rxjs/operators';
import DeatilAboutAdresses from '../models/DeatilAboutAdresses';
import {AddressService} from './address.service';

@Injectable({
  providedIn: 'root'
})
export class PackageService {

  private packagesCollection: AngularFirestoreCollection<any>;


  private allPackagesSource = new BehaviorSubject<any>(null);
  allPackages = this.allPackagesSource.asObservable();

  private _packages = new BehaviorSubject<any>([]);
  readonly packages$ = this._packages.asObservable();

  private isDone = new BehaviorSubject<boolean>(false);
  readonly isDone$ = this.isDone.asObservable();

  myPackages: DeatilAboutAdresses[] = [];
  myPackagesOffer: DeatilAboutAdresses[] = [];

  constructor(private afs: AngularFirestore, private dataService: DataService, private offerService: OfferRouteService,
              private addressService: AddressService) {
    this.packagesCollection = this.afs.collection<any>('packages');

    this.addressService.address$.subscribe(allAddresses => {
      // this.myPackages = []
      allAddresses.forEach((jednaAdresa, indexAdresy) => {
        if (jednaAdresa.type == 'nakladka'){
          for (const onePackageId of jednaAdresa.packagesId) {
            this.getOnePackageFromDatabase(onePackageId).subscribe(balik => {
              let detail: DeatilAboutAdresses = balik;
              detail.id = onePackageId;
              if (this.myPackages.find(onePack => onePack.id === detail.id)){
                const idPackagu = this.myPackages.findIndex(onePack => onePack.id === detail.id);
                this.myPackages[idPackagu] = detail;
              }else{
                this.myPackages.push(detail);
              }
              this._packages.next(this.myPackages.concat(this.myPackagesOffer));
            });
          }
        }
      });
    });

    this.addressService.offerAddresses$.subscribe(allAddresses => {
      allAddresses.forEach((jednaAdresa, indexAdresy) => {
        if (jednaAdresa.type === 'nakladka'){
          // for (const onePackageId of jednaAdresa.packagesId) {
            jednaAdresa.packagesId.forEach((onePackageId, indexBalika) => {
            this.getOnePackageFromDatabase(onePackageId).subscribe(balik => {
              let detail: DeatilAboutAdresses = balik;
              detail.id = onePackageId;
              if (this.myPackagesOffer.find(onePack => onePack.id === detail.id)){
                const idPackagu = this.myPackagesOffer.findIndex(onePack => onePack.id === detail.id);
                this.myPackagesOffer[idPackagu] = detail;
              }else{
                this.myPackagesOffer.push(detail);
              }
              this._packages.next(this.myPackages.concat(this.myPackagesOffer));
            });
          });
        }
        if (indexAdresy === allAddresses.length - 1 && allAddresses.length > 0){
          // this.isDone.next(true);
        }
      });
    });
    // this.getRoutes().subscribe(res => {
    //   this.addressesGet = res
    //   this._address.next(res);
    // });
    // this.getOfferAddresses();

  }

  getAllPackages(){
    return this.myPackages;
  }

  getAllOfferPackages(){
    return this.myPackagesOffer;
  }

  getOnePackage(id){
    let myPackage = this.myPackages.find(onePackage => onePackage.id === id);
    if (!myPackage){
      myPackage = this.myPackagesOffer.find(onePackage => onePackage.id === id);
    }
    return myPackage;
  }

  getOnePackageFromDatabase(packageID) {
    return this.packagesCollection.doc(packageID).valueChanges();
  }



  getOneAddresById(id): Observable<Address> {
    return this.allPackages.pipe(
      map(txs => txs.find(txn => txn.id === id))
    );
  }




  // toto i treba dorobit
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

