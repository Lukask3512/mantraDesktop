import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import Dispecer from "../models/Dispecer";

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private carSource = new BehaviorSubject<string>('empty');
  currentCar = this.carSource.asObservable();
  cars;

  private loggedDispecer: Dispecer;
  constructor() { }
  changRoute(car: any) {
    // console.log(message)
    this.carSource.next(car);
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

}
