import {Component, OnInit, ViewChild} from '@angular/core';
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

@Component({
  selector: 'app-cars-wrapper',
  templateUrl: './cars-wrapper.component.html',
  styleUrls: ['./cars-wrapper.component.scss']
})
export class CarsWrapperComponent implements OnInit {
  dataSource;
  displayedColumns: string[] = ['ecv', 'phoneNumber', 'status', 'detail', 'delete'];
  constructor(private carService: CarService, private dataSerice: DataService, private dialog: MatDialog,
              public routeStatusService: RouteStatusService) { }
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

  sendCar(car){
    this.dataSerice.changRoute(car);
  }

  deleteCar(car){
      const dialogRef = this.dialog.open(DeleteCarDialogComponent, {
        data: {car: car, route: false }
      });
      dialogRef.afterClosed().subscribe(value => {
        if (value === undefined){
          return;
        }else {

        }
      });
  }
  // sortData(sort: Sort) {
  //   const data = this.cars.slice();
  //   if (!sort.active || sort.direction === '') {
  //     this.sortedData = data;
  //     return;
  //   }
  //
  //   console.log(sort)
  //   this.sortedData = data.sort((a, b) => {
  //     const isAsc = sort.direction === 'asc';
  //     switch (sort.active) {
  //       case 'ecv': return compare(a.ecv, b.ecv, isAsc);
  //       case 'phoneNumber': return compare(a.phoneNumber, b.phoneNumber, isAsc);
  //       case 'status': return compare(a.status, b.status, isAsc);
  //       default: return 0;
  //     }
  //   });
  // }

}
// function compare(a: number | string, b: number | string, isAsc: boolean) {
//   return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
// }
