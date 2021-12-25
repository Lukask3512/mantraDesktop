import { Component, OnInit } from '@angular/core';
import {MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {AddCarDialogComponent} from '../../dialogs/add-car-dialog/add-car-dialog.component';
import {DataService} from '../../../data/data.service';
import Company from '../../../models/Company';
import {CarService} from '../../../services/car.service';


@Component({
  selector: 'app-new-car',
  templateUrl: './new-car.component.html',
  styleUrls: ['./new-car.component.scss'],

})
export class NewCarComponent implements OnInit {

  constructor(private dialog: MatDialog, private dataService: DataService, private carService: CarService) { }
  company: Company;
  ngOnInit(): void {
    this.company = this.dataService.getLoggedInCompany();
  }
  openAddDialog() {
    if (!this.canAddNewCar()){
      return false;
    }
    const dialogConfig = new MatDialogConfig();
    // dialogConfig.width = '23em';
    const dialogRef = this.dialog.open(AddCarDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else {

      }
    });
  }

  canAddNewCar(){
    const numberOfCars = this.carService.getAllCars().length;
    if (numberOfCars < this.company.numberOfCars){
      return true;
    }else{
      return false;
    }
  }


}
