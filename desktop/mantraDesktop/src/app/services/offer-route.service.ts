import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import Dispecer from '../models/Dispecer';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {DataService} from '../data/data.service';
import {map, take} from 'rxjs/operators';
import Route from '../models/Route';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {OneCompanyComponent} from '../components/companies/one-company/one-company.component';
import {GetOneCompanyService} from './companies/get-one-company.service';

@Injectable({
  providedIn: 'root'
})
export class OfferRouteService {
  private routesCollection: AngularFirestoreCollection<Dispecer>;
  private routes: Observable<Dispecer[]>;

  private allRoutesSource = new BehaviorSubject<any>(null);
  allRoutes = this.allRoutesSource.asObservable();

  skontrolovanePonuky = [];

  routesForGet: Route[];

  oldRoutesForCheckNewOffers: Route[];

  // neukazovat pri kazdej zmene ten isty dialog
  dialogForRouteShown = [];

  // neukazovat pri kazdej zmene ten isty dialog
  dialogForRouteShownCancel = [];


  constructor(private afs: AngularFirestore, private dataService: DataService, private _snackBar: MatSnackBar,
              private router: Router,  private translate: TranslateService, private oneCompanyService: GetOneCompanyService) {
    this.routesCollection = this.afs.collection<any>('route');

    this.readAllQueries().subscribe(res => {
      let allKindTogether = res[0].concat(res[1], res[2]);
      this.routesForGet = allKindTogether;
      this.routesForGet.forEach(oneRoute => {
        if (!oneRoute.cancelByDriver && !oneRoute.cancelByCreator){
          if (oneRoute.takenBy === this.dataService.getMyIdOrMaster() && !oneRoute.carId && !this.aldreadyThere(oneRoute.id)){
            this.deleteRouteFromAnimation(oneRoute.id);
            setTimeout(() => {
              this.openSnackBar(this.translate.instant('POPUPS.ziskaliStePonuku'), this.translate.instant('OFTEN.priradit'), oneRoute);
            }, 8000);
            this.dialogForRouteShown.push(oneRoute.id);
          }
          if (oneRoute.offerFrom.length > 0 && oneRoute.createdBy === this.dataService.getMyIdOrMaster() && oneRoute.takenBy === ''){
            if (!this.aldreadyThere(oneRoute.id)){ // toto je na popup okno aby stale neskakalo
              this.deleteRouteFromAnimation(oneRoute.id);
              setTimeout(() => {
                this.openSnackBar(this.translate.instant('POPUPS.niektoMaZaujem'), this.translate.instant('OFTEN.skontrolovat'), oneRoute);
              }, 7000);
              this.dialogForRouteShown.push(oneRoute.id);
            }
            const uzJeSkontrolovana = this.skontrolovanePonuky.find(oneId => oneId === oneRoute.id);
            if (uzJeSkontrolovana){
              const ponukaPredosla = this.oldRoutesForCheckNewOffers.find(oneRouteF => oneRouteF.id === oneRoute.id);
              if (ponukaPredosla && ponukaPredosla.offerFrom.length < oneRoute.offerFrom.length){
                this.deleteRouteFromAnimation(oneRoute.id);
                // console.log('vymazal som ponuku zo skontrolovanych');
                // console.log(this.getSkontrolovanePonuky());
              }
            }
          }




        }
        // ked chce tvorca zrusit ponuku
        if (!this.aldreadyThereForDecline(oneRoute.id)){
          if (!oneRoute.dontWannaCancel && oneRoute.cancelByCreator && oneRoute.createdBy !== this.dataService.getMyIdOrMaster() && !oneRoute.cancelByDriver){
            this.oneCompanyService.getCompanyName(oneRoute.createdBy).then((company) => {
              this.dialogForRouteShownCancel.push(oneRoute.id);
              setTimeout(() => {
                this.openSnackBar(company.name + ' ' + this.translate.instant('OFFER.spolocnostChceZrusit'),
                  this.translate.instant('OFTEN.skontrolovat'), oneRoute);
              }, 9000);
            });
          }
        }

        // ked chce prepravca zrusit ponuku
        if (!this.aldreadyThereForDecline(oneRoute.id)) {
          if (!oneRoute.dontWannaCancel && oneRoute.cancelByDriver && oneRoute.createdBy === this.dataService.getMyIdOrMaster() && !oneRoute.cancelByCreator) {
            this.oneCompanyService.getCompanyName(oneRoute.takenBy).then((company) => {
              this.dialogForRouteShownCancel.push(oneRoute.id);

              setTimeout(() => {
                this.openSnackBar(company.name + ' ' + this.translate.instant('OFFER.spolocnostChceZrusit')
                  , this.translate.instant('OFTEN.skontrolovat'), oneRoute);
              }, 9000);
            });
          }
        }

      });
      this.oldRoutesForCheckNewOffers = JSON.parse(JSON.stringify(allKindTogether));
      this._routes.next(allKindTogether);
    });

  }
  // toto je zbytocne, urobim to tak ,ze stiahnem vsetky adresy po 1 ktore mi pridu z ponuk, ,,,
  private _routes = new BehaviorSubject<any>([]);
  readonly routes$ = this._routes.asObservable();

  getRoutesNoSub(){
    return this.routesForGet;
  }

  // sluzi na vymazanie id z pola, ktore je na blikanie
  deleteRouteFromAnimation(routeId){
    this.skontrolovanePonuky = this.skontrolovanePonuky.filter(allRoute => allRoute !== routeId);
  }

  setSkontrolovanePonuky(routeId){
    this.skontrolovanePonuky.push(routeId);
  }

  getSkontrolovanePonuky(){
    return this.skontrolovanePonuky;
  }

  // uz sa nachadza v poli, aby dialog stale nevcyskakoval
  aldreadyThere(routeId){
    if (this.dialogForRouteShown.find(oneId => oneId === routeId)){
      return true;
    }else{
      return false;
    }
  }

  // uz sa nachadza v poli, aby dialog stale nevcyskakoval
  aldreadyThereForDecline(routeId){
    if (this.dialogForRouteShownCancel.find(oneId => oneId === routeId)){
      return true;
    }else{
      return false;
    }
  }

  // uz sa nachadza v poli, aby dialog stale nevcyskakoval
  aldreadyThere2(routeId){
    if (!this.oldRoutesForCheckNewOffers){
      return true;
    }
    const oldRoute = this.oldRoutesForCheckNewOffers.find(oneRoute => oneRoute.id === routeId);
    const newRoute = this.routesForGet.find(oneRoute => oneRoute.id === routeId);
    if (!oldRoute){
      return false;
    }
    else if(oldRoute.ponuknuteTo !== newRoute.ponuknuteTo){
      return true;
    }else if(oldRoute.takenBy !== newRoute.takenBy){
      return true;
    }
    else{
      return false;
    }
  }

  // uz sa nachadza v poli, aby dialog stale nevcyskakoval
  aldreadyThereMoja(routeId){
    if (!this.oldRoutesForCheckNewOffers){
      return true;
    }
    const oldRoute = this.oldRoutesForCheckNewOffers.find(oneRoute => oneRoute.id === routeId);
    const newRoute = this.routesForGet.find(oneRoute => oneRoute.id === routeId);
    if (!oldRoute || (newRoute.ponuknuteTo !== '' && oldRoute.ponuknuteTo === '') || (newRoute.ponuknuteTo === '' && oldRoute.ponuknuteTo === '')){
      return true;
    }
    else if (oldRoute.offerFrom.length !== newRoute.offerFrom.length){
      return true;
    }
    else{
      return false;
    }
  }

  openSnackBar(message: string, action: string, route: Route) {
    const snackBarRef = this._snackBar.open(message, action, {

    });
    snackBarRef.afterDismissed().subscribe((info) => {
      if (info.dismissedByAction === true){
        this.dataService.changeRealRoute(route);
        this.router.navigate(['/view/offerDetail']);
      }
    });
  }

  // vsetky nepriradene
  getRoutes(){
    return this.afs.collection<Dispecer>('route', ref => {
      let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.where('forEveryone', '==', true)
        .where('takenBy', '==', '');
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

  // vsetky mnou vytvorene
  getRoutesMine(){
    return this.afs.collection<Dispecer>('route', ref => {
      let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.where('forEveryone', '==', false)
        .where('createdBy', '==', this.getDispecerId())
        .where('takenBy', '!=', '');
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

  // vsetky routy ktore som mal v autach
  getRoutesPriradeneMne(){
    return this.afs.collection<Dispecer>('route', ref => {
      let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.where('forEveryone', '==', false)
        .where('takenBy', '==', this.getDispecerId());
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

  readAllQueries(): Observable<any>{
    return combineLatest(this.getRoutes(), this.getRoutesMine(), this.getRoutesPriradeneMne());
  }

  getDispecerId(){
    let idCreated;
    if (this.dataService.getDispecer().createdBy == 'master'){
      return this.dataService.getDispecer().id;
    }else{
      return this.dataService.getDispecer().createdBy;
    }
  }

  // getRoutesOrder(carId){
  //   return this.afs.collection('route').
  //
  // }

  // toto i treba dorobit
  createRoute(route: Route){
    return this.afs.collection('route').add(route);
  }

  updateRoute(newRoute) {
    if (newRoute.id === undefined){
      this.createRoute(newRoute);
      return;
    }else {
      return this.routesCollection.doc(newRoute.id).update(newRoute);
    }
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
    return this.afs.collection<Dispecer>('route', ref => {
      let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.where('createdBy', '==', id)
        .where('finished', '==', false);
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
    return this.afs.collection<Dispecer>('route', ref => {
      let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.where('createdBy', '==', id)
        .where('finished', '==', true)
        .orderBy('finishedAt', 'desc').limit(10);
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
