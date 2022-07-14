import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import Address from "../models/Address";

@Injectable({
  providedIn: 'root'
})
export class DataForSendingService {
  private adresySource = new BehaviorSubject<Address[]>(null);
  $adress = this.adresySource.asObservable();

  constructor() { }

  changeAddress(address: Address[]) {
    this.adresySource.next(address);
  }


}
