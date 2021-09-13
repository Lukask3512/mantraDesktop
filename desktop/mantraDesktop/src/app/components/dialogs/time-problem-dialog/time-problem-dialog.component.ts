import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {NewCarComponent} from '../../cars/new-car/new-car.component';
import Address from '../../../models/Address';
import {DataService} from '../../../data/data.service';

@Component({
  selector: 'app-time-problem-dialog',
  templateUrl: './time-problem-dialog.component.html',
  styleUrls: ['./time-problem-dialog.component.scss']
})
export class TimeProblemDialogComponent implements OnInit {

  dniKtoreSaPrelinaju;
  addresses: Address[];
  offer: Address[];
  constructor(public dialogRef: MatDialogRef<TimeProblemDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private dataService: DataService) { }

  ngOnInit(): void {
    if (this.data){
      this.addresses = this.data.addresses;
    }
  }

  estimatedTimeToLocal(dateUtc){
    var date = (new Date(dateUtc));
    if (dateUtc == null){
      return 'Neznámy';
    }
    return date.toLocaleString();
  }

  timeToLocal(dateUtc, oClock){
    const date = (new Date(dateUtc));
    if (oClock !== '0'){
      date.setHours(oClock.substring(0, 2), oClock.substring(3, 5));
    }
    if (dateUtc == null || dateUtc === '0'){
      return 'Neznámy';
    }
    return date.toLocaleString();
  }

  sortHours(array){
    const arraySort = array.sort((a, b) => {
      return a.pocetHodin - b.pocetHodin;
    });
    return arraySort;
  }

  getColorForTime(townIndex){
    if (this.dniKtoreSaPrelinaju){
      this.dniKtoreSaPrelinaju = this.dataService.checkAddressesTime(this.addresses);
      const denPrelinajuciSa = this.dniKtoreSaPrelinaju.filter(oneDen => oneDen.adresa1 === townIndex);
      const denPrelinajuciSa2 = this.dniKtoreSaPrelinaju.filter(oneDen => oneDen.adresa2 === townIndex);
      const usporiadanePole = this.sortHours(denPrelinajuciSa);
      const usporiadanePole2 = this.sortHours(denPrelinajuciSa2);


      if ((usporiadanePole[0] && usporiadanePole[0].pocetHodin < 7 && usporiadanePole[0].pocetHodin > 4)
        || (usporiadanePole2[0] && usporiadanePole2[0].pocetHodin < 7 && usporiadanePole2[0].pocetHodin > 4)){
        return 'yellowColor';
      }else if ((usporiadanePole[0] && usporiadanePole[0].pocetHodin <= 4)
        || usporiadanePole2[0] && usporiadanePole2[0].pocetHodin <= 4){
        return 'redColor';
      }
    }else{
      this.dniKtoreSaPrelinaju = this.dataService.checkAddressesTime(this.addresses);
      const denPrelinajuciSa = this.dniKtoreSaPrelinaju.filter(oneDen => oneDen.adresa1 === townIndex);
      const denPrelinajuciSa2 = this.dniKtoreSaPrelinaju.filter(oneDen => oneDen.adresa2 === townIndex);

      const usporiadanePole = this.sortHours(denPrelinajuciSa);
      const usporiadanePole2 = this.sortHours(denPrelinajuciSa2);
      if ((usporiadanePole[0] && usporiadanePole[0].pocetHodin < 7 && usporiadanePole[0].pocetHodin > 4)
        || (usporiadanePole2[0] && usporiadanePole2[0].pocetHodin < 7 && usporiadanePole2[0].pocetHodin > 4)){
        return 'yellowColor';
      }else if ((usporiadanePole[0] && usporiadanePole[0].pocetHodin <= 4)
        || usporiadanePole2[0] && usporiadanePole2[0].pocetHodin <= 4){
        return 'redColor';
      }
    }

  }

}
