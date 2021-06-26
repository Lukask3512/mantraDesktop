import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from "@angular/fire/firestore";
import Dispecer from "../models/Dispecer";
import {BehaviorSubject, Observable} from "rxjs";
import {DataService} from "../data/data.service";
import {map, take} from "rxjs/operators";
import Route from "../models/Route";
import Address from "../models/Address";
import {OfferRouteService} from "./offer-route.service";

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  addressesGet: any[];
  addressesOfferGet: any[] = [];
  private addressCollection: AngularFirestoreCollection<Address[]>;
  private addresses: Observable<Dispecer[]>;

  private allAddressSource = new BehaviorSubject<any>(null);
  allRoutes = this.allAddressSource.asObservable();


  constructor(private afs: AngularFirestore, private dataService: DataService, private offerService: OfferRouteService) {
    this.addressCollection = this.afs.collection<any>('address');

    this.getRoutes().subscribe(res => {
      this.addressesGet = res
      this._address.next(res);
    });
    this.getOfferAddresses();

  }

  private _offerAddresses = new BehaviorSubject<any>([]);
  readonly offerAddresses$ = this._offerAddresses.asObservable();

  private _address = new BehaviorSubject<any>([]);
  readonly address$ = this._address.asObservable();

  async getOfferAddresses(){
    this.offerService.routes$.subscribe(async routes => {
      var adresy = []

      for (const route of routes) {
        for (const idAddress of route.addresses) {
          var adresa = await this.promiseForDownAdd(idAddress);

        }}


    })
  }

  promiseForDownAdd(idAddress){
    return new Promise(resolve => {
      this.getOneAddresFromDatabase(idAddress).subscribe(oneAdress => {

        //tu budem vkladat adresy do globalnej premennej a ak pride taka ista, len ju vymenim, bodka a na konci vzdy to pole
        //dam .next - behavior subject. bodka 2

        var adresa = oneAdress;
        // @ts-ignore
        adresa.id = idAddress;
        if (this.addressesOfferGet){
        // @ts-ignore
        var jetam = this.addressesOfferGet.find(jednaAdresa => jednaAdresa.id == adresa.id);
        if (jetam){
          // @ts-ignore
          this.addressesOfferGet = this.addressesOfferGet.filter(jednaAdresa => jednaAdresa.id != adresa.id);
        }
        }

        this.addressesOfferGet.push(adresa);
        this._offerAddresses.next(this.addressesOfferGet);
        console.log(this.addressesOfferGet)
        resolve(adresa)
      })
    })
  }

  getAddressesFromOffer(){
    return this.addressesOfferGet;
  }

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

  getOneAddresFromDatabase(detailId) {
    return this.addressCollection.doc(detailId).valueChanges();
  }

  getAddresses(): Address[]{
    return this.addressesGet;
  }

  getOneAddresById(id): Observable<Address>{
    return this.address$.pipe(
      map(txs => txs.find(txn => txn.id === id))
    );
  }

  getOneAddresFromOfferById(id): Observable<Address>{
    return this.offerAddresses$.pipe(
      map(txs => txs.find(txn => txn.id === id))
    );
  }

  updateAddress(address){
    return this.addressCollection.doc(address.id).update(address);
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
