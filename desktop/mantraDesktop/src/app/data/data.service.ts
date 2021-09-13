import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import Dispecer from '../models/Dispecer';
import {RouteService} from '../services/route.service';
import Route from '../models/Route';
import {PrivesService} from '../services/prives.service';
import {CarService} from '../services/car.service';
import Cars from '../models/Cars';
import DeatilAboutAdresses from '../models/DeatilAboutAdresses';
import Address from '../models/Address';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private carSource = new BehaviorSubject<string>('empty');
  currentCar = this.carSource.asObservable();

  private vylozeneSource = new BehaviorSubject<boolean>(false);
  vsetkoVylozene$ = this.vylozeneSource.asObservable();
  vsetkoVylozeneGet;

  private routeSource = new BehaviorSubject<any>(null);
  currentRoute = this.routeSource.asObservable();

  sizesS = [];
  sizesD = [];
  sizesV = [];
  weight = [];
  stohovatelnost = [];

  cars;
  routes;

  private dispecerSource = new BehaviorSubject<string>('empty');
  private loggedDispecer: Dispecer;

  // detaily v route
  private detailSource = new BehaviorSubject<any>(null);
  allCurrentDetail = this.detailSource.asObservable();
  private currentDetails;

  // detail v aktualnej adrese ktoru vytvaram
  private actualDetailSource = new BehaviorSubject<any>(null);
  actualDetail = this.actualDetailSource.asObservable();

  setDetailSource(detail){
    this.detailSource.next(detail);
    this.currentDetails = detail;
  }

  getDetails(){
    return this.currentDetails;
  }

  setActualDetailsInAddress(details){
    this.actualDetailSource.next(details);
  }

  setVylozene(vylozene){
    this.vsetkoVylozeneGet = vylozene;
    this.vylozeneSource.next(vylozene);
  }



  constructor() { }

  changRoute(car: any) {
    // console.log(message)
    this.carSource.next(car);
  }

  changeRealRoute(route: any) {
    // console.log(message)
    this.routeSource.next(route);
  }

  setDispecer(dispecer){
    this.loggedDispecer = dispecer;
  }

  getDispecer(){
    return this.loggedDispecer;
  }

  getAllCars(){
    return this.cars;
  }

  setCars(cars){
    this.cars = cars;
  }

  getOneCarById(id){
    return this.cars.find(car => car.id === id);
  }

  setRoutes(routes){
    this.routes = routes;
  }
  getRoutes(){
    return this.routes;
  }

  getMyIdOrMaster(){
    let idCreated;
    if (this.getDispecer().createdBy === 'master'){
      idCreated = this.getDispecer().id;
    }else{
      idCreated = this.getDispecer().createdBy;
    }
    return idCreated;
  }

  checkAddressesTime(addresses: Address[]){
    const indexAdries = [];
    // Get 1 day in milliseconds
    const oneDay = 1000 * 60 * 60 * 24;


    for (let i = 0; i < addresses.length; i++) {
      for (let j = i + 1; j < addresses.length; j++) {
        if (addresses[i].datumLastPrijazdy !== '0' && addresses[j].datumLastPrijazdy !== '0'){
          const datumPrvejAdresy = new Date(addresses[i].datumLastPrijazdy);
          if (addresses[i].casLastPrijazdu !== '0'){
            datumPrvejAdresy.setHours(Number(addresses[i].casLastPrijazdu.substring(0, 2)), Number(addresses[i].casLastPrijazdu.substring(3, 5)));
          }
          const datumDruhejAdresy = new Date(addresses[j].datumLastPrijazdy);
          if (addresses[j].casLastPrijazdu !== '0'){
            datumDruhejAdresy.setHours(Number(addresses[j].casLastPrijazdu.substring(0, 2)), Number(addresses[j].casLastPrijazdu.substring(3, 5)));
          }
          const date = datumDruhejAdresy.getTime() - datumPrvejAdresy.getTime();
          const pocetDni = Math.round(date / oneDay);
          const pocetHodin =  (date / (1000 * 60 * 60)).toFixed(1);
          if (pocetDni <= 0){
            indexAdries.push({adresa1: i, adresa2: j, pocetDni, pocetHodin});
          }
        }
      }
    }
    return indexAdries;
  }

  estimatedTimeToLocal(dateUtc){
    var date = (new Date(dateUtc));
    if (dateUtc == null){
      return 'Neznámy';
    }
    return date.toLocaleString();
  }

  timeToLocal(dateUtc, oClock){
    var date = (new Date(dateUtc));
    if (oClock !== '0'){
      date.setHours(oClock.substring(0, 2), oClock.substring(3, 5));
    }
    if (dateUtc == null || dateUtc === '0'){
      return 'Neznámy';
    }
    return date.toLocaleString();
  }

  checkEstimatedAndLastTime(addresses: Address[], newAddress: Address){
    let poleSHodinami = [];
    const datumNovej = new Date(newAddress.datumLastPrijazdy);
    if (newAddress.casLastPrijazdu !== '0'){
      datumNovej.setHours(Number(newAddress.casLastPrijazdu.substring(0, 2)), Number(newAddress.casLastPrijazdu.substring(3, 5)));
    }
    for (let i = 0; i < addresses.length; i++) {
      if (addresses[i].estimatedTimeArrival){
        const datumPrvejAdresy = new Date(addresses[i].estimatedTimeArrival);
        const rozdielVMili = datumNovej.getTime() - datumPrvejAdresy.getTime();
        const pocetHodin =  (rozdielVMili / (1000 * 60 * 60)).toFixed(1);
        poleSHodinami.push(Number(pocetHodin));
      }else{
        poleSHodinami.push(null);
      }
    }
    return poleSHodinami;
  }





}
