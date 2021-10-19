import { Component, OnInit } from '@angular/core';
import {DataService} from '../../data/data.service';
import Dispecer from '../../models/Dispecer';
import {CarService} from '../../services/car.service';
import Cars from '../../models/Cars';
import Prives from '../../models/Prives';
import {PrivesService} from '../../services/prives.service';
import {AccountService} from '../../../login/_services/account.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import Company from '../../models/Company';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  constructor(private dataService: DataService, private carService: CarService,
              private privesService: PrivesService,
              private accountService: AccountService,
              private _snackBar: MatSnackBar) { }

  dispecer: Dispecer;
  company: Company;
  ngOnInit(): void {
    this.dispecer = this.dataService.getDispecer();
    this.company = this.dataService.getLoggedInCompany();
  }

  passwordChange(){
    this.accountService.passwordReset(this.dispecer.email);
    this.openSnackBar('Na emailovu adresu bol zaslany email', 'Ok');
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }

  getEcv(carId): Cars{
    return this.carService.getAllCars().find(oneCar => oneCar.id === carId);
  }

  getEcvPrives(privesId): Prives{
    return this.privesService.getAllPriveses().find(onePrives => onePrives.id === privesId);
  }

}
