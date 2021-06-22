import { Injectable } from '@angular/core';
import {CountFreeSpaceService} from "../../data/count-free-space.service";

@Injectable({
  providedIn: 'root'
})
export class DrawOfferService {

  constructor(private countFreeSpaceService: CountFreeSpaceService) {
  }

  vypocitajFreeCiSaVopcha(cars, ponuka, maxPrekrocenieRozmerov) {
    cars.forEach(car => { //prechadzam autami
      car.itiAdresy.forEach(jednaAdresa => { // prechadzam itinerarom auta
        var vopchaSa = this.countFreeSpaceService.countFreeSpace(car, ponuka, maxPrekrocenieRozmerov);

      })
    })
  }
}
