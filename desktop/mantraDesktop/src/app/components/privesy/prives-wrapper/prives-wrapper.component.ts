import {Component, OnInit, ViewChild} from '@angular/core';
import {CarService} from "../../../services/car.service";
import {DataService} from "../../../data/data.service";
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {RouteStatusService} from "../../../data/route-status.service";
import Cars from "../../../models/Cars";
import {MatPaginator} from "@angular/material/paginator";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {DeleteCarDialogComponent} from "../../dialogs/delete-car-dialog/delete-car-dialog.component";
import {PrivesService} from "../../../services/prives.service";
import {DeletePrivesComponent} from '../../dialogs/delete-prives/delete-prives.component';
import Prives from '../../../models/Prives';
import {AddCarDialogComponent} from '../../dialogs/add-car-dialog/add-car-dialog.component';
import {AddPrivesDialogComponent} from '../../dialogs/add-prives-dialog/add-prives-dialog.component';

@Component({
  selector: 'app-prives-wrapper',
  templateUrl: './prives-wrapper.component.html',
  styleUrls: ['./prives-wrapper.component.scss']
})
export class PrivesWrapperComponent implements OnInit {

  dataSource;
  displayedColumns: string[] = ['ecv', 'update', 'delete'];
  constructor(private privesService: PrivesService, private dataSerice: DataService, private dialog: MatDialog,
              public routeStatusService: RouteStatusService, private dataService: DataService) { }
  cars;
  sortedData: Cars[];
  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngOnInit(): void {
    // this.carService.getCars().subscribe(cars => {
    //   this.cars = cars;
    //   this.dataSerice.setCars(cars);
    //   this.dataSource = new MatTableDataSource(this.cars);
    //   this.dataSource.paginator = this.paginator;
    // });

    this.privesService.prives$.subscribe(cars => {
      this.cars = cars;
      this.dataSerice.setCars(this.cars);
      this.dataSource = new MatTableDataSource(this.cars);
      // this.sortedData = this.cars.slice();
      console.log("som dostal upravne auto")
      // this.dataSource.paginator = this.paginator;
    });

  }

  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  getDispecer(){
    const dispecer = this.dataService.getDispecer();
    if (dispecer.createdBy === 'master' || dispecer.allCars){
      return false;
    }else{
      return true;
    }
  }

  deleteCar(car){
    if (!this.getDispecer()) {
      const dialogRef = this.dialog.open(DeletePrivesComponent, {
        data: {car: car, route: false}
      });
      dialogRef.afterClosed().subscribe(value => {
        if (value === undefined) {
          return;
        } else {

        }
      });
    }
  }

  updateCar(prives: Prives){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = prives;
    const dialogRef = this.dialog.open(AddPrivesDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else {

      }
    });
  }
}
