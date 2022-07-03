import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {CarService} from "../../../services/car.service";
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import Cars from "../../../models/Cars";
import {DataService} from "../../../data/data.service";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {AddCarDialogComponent} from "../../dialogs/add-car-dialog/add-car-dialog.component";
import {DeleteCarDialogComponent} from "../../dialogs/delete-car-dialog/delete-car-dialog.component";
import {RouteStatusService} from "../../../data/route-status.service";
import {MatSort, Sort} from "@angular/material/sort";
import {take} from "rxjs/operators";
import {AddPrivesToCarComponent} from "../../dialogs/add-prives-to-car/add-prives-to-car.component";
import {PrivesService} from "../../../services/prives.service";
import {OffNavesDialogComponent} from "../../dialogs/off-naves-dialog/off-naves-dialog.component";
import {DetailAboutRouteService} from "../../../services/detail-about-route.service";
import {AddressService} from "../../../services/address.service";
import {PackageService} from "../../../services/package.service";
import { CookieService } from 'ngx-cookie-service';


@Component({
  selector: 'app-cars-wrapper',
  templateUrl: './cars-wrapper.component.html',
  styleUrls: ['./cars-wrapper.component.scss']
})
export class CarsWrapperComponent implements OnInit, AfterViewInit {
  dataSource;
  displayedColumns: string[] = ['ecv', 'phoneNumber', 'status', 'naves', 'detail', 'update', 'delete'];
  constructor(private carService: CarService, private dataSerice: DataService, private dialog: MatDialog,
              public routeStatusService: RouteStatusService, public privesService: PrivesService,
              private detailService: DetailAboutRouteService, private addressService: AddressService,
              private packageService: PackageService, private cookieService: CookieService,
              private dataService: DataService) { }
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

    this.deleteAllCookies()

    this.carService.cars$.subscribe(cars => {
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

   deleteAllCookies() {
    this.cookieService.deleteAll();
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i];
      var eqPos = cookie.indexOf("=");
      var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
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
      data: {car: car}
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
      data: {car: car}
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
}

