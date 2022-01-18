import { Injectable } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class RouteStatusService {

  constructor(private translate: TranslateService) { }

  getStatus(id){
    switch (id){
      case -2: {
        return this.translate.instant('OFTEN.offline');
      }
      case 0: {
        return this.translate.instant('OFTEN.cakam');
      }
      case 1: {
        return this.translate.instant('OFTEN.naCeste');
      }
      case 2: {
        return this.translate.instant('OFTEN.naklVykl');
      }
      case 3: {
        return this.translate.instant('OFTEN.nalVyl');
      }
      case 4: {
        return this.translate.instant('OFTEN.problem');
      }
      case 5: {
        return this.translate.instant('OFTEN.preskocene');
      }
      case 6: {
        return this.translate.instant('OFTEN.zrusene');
      }

    }
  }
}
