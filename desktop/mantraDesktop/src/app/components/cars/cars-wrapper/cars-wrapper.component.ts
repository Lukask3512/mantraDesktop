import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {CarService} from '../../../services/car.service';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import Cars from '../../../models/Cars';
import {DataService} from '../../../data/data.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {AddCarDialogComponent} from '../../dialogs/add-car-dialog/add-car-dialog.component';
import {DeleteCarDialogComponent} from '../../dialogs/delete-car-dialog/delete-car-dialog.component';
import {RouteStatusService} from '../../../data/route-status.service';
import {MatSort, Sort} from '@angular/material/sort';
import {take} from 'rxjs/operators';
import {AddPrivesToCarComponent} from '../../dialogs/add-prives-to-car/add-prives-to-car.component';
import {PrivesService} from '../../../services/prives.service';
import {OffNavesDialogComponent} from '../../dialogs/off-naves-dialog/off-naves-dialog.component';
import {DetailAboutRouteService} from '../../../services/detail-about-route.service';
import {AddressService} from '../../../services/address.service';
import {PackageService} from '../../../services/package.service';



@Component({
  selector: 'app-cars-wrapper',
  templateUrl: './cars-wrapper.component.html',
  styleUrls: ['./cars-wrapper.component.scss']
})
export class CarsWrapperComponent implements OnInit, AfterViewInit {
  constructor(private carService: CarService, private dataSerice: DataService, private dialog: MatDialog,
              public routeStatusService: RouteStatusService, public privesService: PrivesService,
              private detailService: DetailAboutRouteService, private addressService: AddressService,
              private packageService: PackageService,
              private dataService: DataService) { }
  dataSource;
  displayedColumns: string[] = ['ecv', 'phoneNumber', 'status', 'naves', 'detail', 'update', 'delete'];
  cars;
  sortedData: Cars[];
  @ViewChild(MatPaginator) paginator: MatPaginator;

  @ViewChild(MatSort) sort: MatSort;

  ngOnInit(): void {
    // this.carService.getCars().subscribe(cars => {
    //   this.cars = cars;
    //   this.dataSerice.setCars(cars);
    //   this.dataSource = new MatTableDataSource(this.cars);
    //   this.dataSource.paginator = this.paginator;
    // });


    this.carService.cars$.subscribe(cars => {
      this.cars = cars;
      this.dataSerice.setCars(this.cars);
      this.dataSource = new MatTableDataSource(this.cars);
      // this.sortedData = this.cars.slice();
      console.log('som dostal upravne auto');
      // this.dataSource.paginator = this.paginator;
    });

  }

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

  updateCar(car){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = car;
    const dialogRef = this.dialog.open(AddCarDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else {

      }
    });
  }



  offNaves(car){
    const dialogRef = this.dialog.open(OffNavesDialogComponent, {
      data: {car}
    });
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else {

      }
    });

  }

  addNaves(car: Cars){

    const dialogRef = this.dialog.open(AddPrivesToCarComponent, {
      data: {car}
    });
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else {

      }
    });


  }

  sendCar(car){
    this.dataSerice.changeCar(car);
  }

  deleteCar(car){
    if (!this.getDispecer()) {
      const dialogRef = this.dialog.open(DeleteCarDialogComponent, {
        data: {car, route: false}
      });
      dialogRef.afterClosed().subscribe(value => {
        if (value === undefined) {
          return;
        } else {

        }
      });
    }
  }
}

