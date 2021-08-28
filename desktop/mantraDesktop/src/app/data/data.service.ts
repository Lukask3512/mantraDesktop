import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import Dispecer from "../models/Dispecer";
import {RouteService} from "../services/route.service";
import Route from "../models/Route";
import {PrivesService} from "../services/prives.service";
import {CarService} from "../services/car.service";
import Cars from "../models/Cars";
import DeatilAboutAdresses from "../models/DeatilAboutAdresses";

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

  //detaily v route
  private detailSource = new BehaviorSubject<any>(null);
  allCurrentDetail = this.detailSource.asObservable();
  private currentDetails;

  //detail v aktualnej adrese ktoru vytvaram
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
    return this.cars.find(car => car.id == id);
  }

  setRoutes(routes){
    this.routes = routes;
  }
  getRoutes(){
    return this.routes;
  }

  getMyIdOrMaster(){
    var idCreated;
    if (this.getDispecer().createdBy == 'master'){
      idCreated = this.getDispecer().id
    }else{
      idCreated = this.getDispecer().createdBy
    }
    return idCreated;
  }





}
