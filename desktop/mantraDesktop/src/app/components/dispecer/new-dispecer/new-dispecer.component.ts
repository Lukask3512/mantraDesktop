import { Component, OnInit } from '@angular/core';
import {DispecerService} from '../../../services/dispecer.service';
import {FormBuilder, Validators} from '@angular/forms';
import {DataService} from '../../../data/data.service';
import {AccountService} from '../../../../login/_services/account.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {DipecerPravaComponent} from '../../dialogs/dipecer-prava/dipecer-prava.component';
import Company from '../../../models/Company';

@Component({
  selector: 'app-new-dispecer',
  templateUrl: './new-dispecer.component.html',
  styleUrls: ['./new-dispecer.component.scss']
})
export class NewDispecerComponent implements OnInit {


  constructor(private dialog: MatDialog, private accountService: AccountService,
              private dispecerService: DispecerService, private fb: FormBuilder,
              private dataService: DataService) { }

  company: Company;
  ngOnInit(): void {
    this.company = this.dataService.getLoggedInCompany();

  }
  openDialog(){
    if (!this.canAddNewDispecer()){
      return false;
    }
    const dialogConfig = new MatDialogConfig();
    // dialogConfig.width = '23em';
    // dialogConfig.data = {
    //   dispecer: this.dispecer
    // }
    const dialogRef = this.dialog.open(DipecerPravaComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else {

      }
    });
  }

  canAddNewDispecer(){
    const numberOfCars = this.dispecerService.getNoSub().length;
    if (numberOfCars < this.company.numberOfDispetchers){
      return true;
    }else{
      return false;
    }
  }

}
