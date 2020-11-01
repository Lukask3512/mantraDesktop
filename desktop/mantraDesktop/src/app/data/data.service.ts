import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private carSource = new BehaviorSubject<string>('empty');
  currentCar = this.carSource.asObservable();

  constructor() { }
  changRoute(car: any) {
    // console.log(message)
    this.carSource.next(car);
  }

}
