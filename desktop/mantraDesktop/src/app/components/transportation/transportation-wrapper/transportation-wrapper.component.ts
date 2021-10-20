import { Component, OnInit } from '@angular/core';
import {RouteService} from "../../../services/route.service";
import {CarService} from "../../../services/car.service";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {RouteToCarComponent} from "../../dialogs/route-to-car/route-to-car.component";
import Route from "../../../models/Route";
import uniqWith from 'lodash/uniqWith';
import get from 'lodash/get';
import {RouteStatusService} from "../../../data/route-status.service";
import {DataService} from "../../../data/data.service";
import {Router} from "@angular/router";
import {DeleteCarDialogComponent} from "../../dialogs/delete-car-dialog/delete-car-dialog.component";
import {DeleteRouteComponent} from "../../dialogs/delete-route/delete-route.component";
import {AddressService} from '../../../services/address.service';
import {RepeatRouteDialogComponent} from '../../dialogs/repeat-route-dialog/repeat-route-dialog.component';

@Component({
  selector: 'app-transportation-wrapper',
  templateUrl: './transportation-wrapper.component.html',
  styleUrls: ['./transportation-wrapper.component.scss']
})
export class TransportationWrapperComponent implements OnInit {
  allActiveRoutes: Route[];
  allFinishedRoutes;
  routesToShow: Route[];
  active = true;

  displayedColumns: string[] = ['naklady', 'vykladky'];

  spans = [];

  constructor(public routeStatusService: RouteStatusService,private routeService: RouteService,
              private carServise: CarService, private dialog: MatDialog, private dataService: DataService, private router: Router,
              private addressService: AddressService) {

  }

  cacheSpan(key, accessor) {
    for (let i = 0; i < this.allFinishedRoutes.length;) {
      let currentValue = accessor(this.allFinishedRoutes[i]);
      let count = 1;

      // Iterate through the remaining rows to see how many match
      // the current value as retrieved through the accessor.
      for (let j = i + 1; j < this.allFinishedRoutes.length; j++) {
        if (currentValue != accessor(this.allFinishedRoutes[j])) {
          break;
        }

        count++;
      }

      if (!this.spans[i]) {
        this.spans[i] = {};
      }

      // Store the number of similar values that were found (the span)
      // and skip i to the next unique row.
      this.spans[i][key] = count;
      i += count;
    }
  }

  getClass(){

  }
  getRowSpan(col, index) {
    return this.spans[index] && this.spans[index][col];
  }

  ngOnInit(): void {
    let DATA = {};

    this.routeService.routes$.subscribe(newRoutes => {
      this.allActiveRoutes = newRoutes;
    });


    this.routeService.finishedRoutes$.subscribe(routes => {
      this.allFinishedRoutes = routes;
    });
  }

  activeRoutes(){
    this.active = true;
    this.routesToShow = this.allActiveRoutes;
  }

  nonActiveRoutes(){
    this.active = false;
    this.routesToShow = this.allFinishedRoutes;
  }


  timestamptToDate(timestamp){
    var date = new Date(timestamp * 1000)
    return date.toDateString();
  }

  carIdToName(carId){
   this.carServise.getCar(carId).subscribe(car => {
   });
  }

  getStatus(route: Route){
    // for(let i = 0 ; i<route.status.length; i++){
    //   if (route.status[i+1] == ""){
    //     console.log(route.status[i])
    //     console.log(route.status.length)
    //     return route.status[i];
    //   }else if(i+1 >= route.status.length){
    //     console.log("som v else")
    //     return route.status[route.status.length];
    //   }
    // }

    // for(let i = route.status.length ; i >= 0; i--){
    //   if (route.status[i] != -1){
    //       return this.routeStatusService.getStatus(route.status[i]);
    //     }
    //   }

  }

  openAddDialog(route: Route) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      route
    };
    const dialogRef = this.dialog.open(RepeatRouteDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      console.log(value)
      if (value === undefined){
        return;
      }else{
        return;
      }
    });
  }

  routeDetail(route: Route){
    this.dataService.changeRealRoute(route);
  }

  deleteRoute(route: Route){
    const dialogRef = this.dialog.open(DeleteRouteComponent);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else {
        route.addresses.forEach(oneAddressId => {
          this.addressService.deleteAddress(oneAddressId);
        });
        this.routeService.deleteRoute(route.id);
      }
    });
  }


}
