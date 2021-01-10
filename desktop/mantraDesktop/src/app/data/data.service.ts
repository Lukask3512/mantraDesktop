import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import Dispecer from "../models/Dispecer";
import {RouteService} from "../services/route.service";
import Route from "../models/Route";

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private carSource = new BehaviorSubject<string>('empty');
  currentCar = this.carSource.asObservable();

  private routeSource = new BehaviorSubject<any>(null);
  currentRoute = this.routeSource.asObservable();




  cars;
  routes;

  private dispecerSource = new BehaviorSubject<string>('empty');
  private loggedDispecer: Dispecer;


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



}
