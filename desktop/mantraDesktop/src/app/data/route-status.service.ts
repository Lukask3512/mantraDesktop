import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RouteStatusService {

  constructor() { }

  getStatus(id){
    switch (id){
      case 0: {
        return 'Čakám'
      }
      case 1: {
        return 'Na ceste'
      }
      case 2: {
        return 'Nakladám'
      }
      case 3: {
        return 'Naložené'
      }
      case 4: {
        return 'Vykladám'
      }
      case 5: {
        return 'Vyložené'
      }
      case 6: {
        return 'Problém'
      }
    }
  }
}
