import { Component, OnInit } from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {AccountService} from '../../../../login/_services/account.service';
import {DataService} from '../../../data/data.service';
import {VodicService} from '../../../services/vodic.service';
import Vodic from '../../../models/Vodic';
import {NewVodicDialogComponent} from '../../dialogs/new-vodic-dialog/new-vodic-dialog.component';
import {CompanyService} from '../../../services/company.service';
import Company from '../../../models/Company';

@Component({
  selector: 'app-new-vodic',
  templateUrl: './new-vodic.component.html',
  styleUrls: ['./new-vodic.component.scss']
})
export class NewVodicComponent implements OnInit {

  constructor(private dialog: MatDialog, private accountService: AccountService, private vodicService: VodicService,
              private fb: FormBuilder, private dataService: DataService) {
  }
  company: Company;
  ngOnInit(): void {
    this.company = this.dataService.getLoggedInCompany();
  }

  openDialog(){
    if (!this.canAddNewDriver()){
      return false;
    }
    const dialogConfig = new MatDialogConfig();
    // dialogConfig.width = '23em';
    // dialogConfig.data = {
    //   dispecer: this.dispecer
    // }
    const dialogRef = this.dialog.open(NewVodicDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else {

      }
    });
  }

  canAddNewDriver(){
    const numberOfCars = this.vodicService.getNoSub().length;
    if (numberOfCars < this.company.numberOfDrivers){
      return true;
    }else{
      return false;
    }
  }
}
