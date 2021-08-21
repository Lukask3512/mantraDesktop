import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RouteStatusService {

  constructor() { }

  getStatus(id){
    switch (id){
      case -2: {
        return 'Offline';
      }
      case 0: {
        return 'Čakám';
      }
      case 1: {
        return 'Na ceste';
      }
      case 2: {
        return 'Nakladám / Vykladám';
      }
      case 3: {
        return 'Naložené / Vyložené';
      }
      case 4: {
        return 'Problém';
      }
      case 5: {
        return 'Preskocene';
      }
      // case 5: {
      //   return 'Vyložené'
      // }
      // case 6: {
      //   return 'Problém'
      // }
    }
  }
}
