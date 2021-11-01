import { Component, OnInit } from '@angular/core';
import {RouteService} from '../../../services/route.service';
import {CarService} from '../../../services/car.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import Route from '../../../models/Route';
import {RouteStatusService} from '../../../data/route-status.service';
import {DataService} from '../../../data/data.service';
import {Router} from '@angular/router';
import {DeleteRouteComponent} from '../../dialogs/delete-route/delete-route.component';
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

  constructor(public routeStatusService: RouteStatusService, private routeService: RouteService,
              private carServise: CarService, private dialog: MatDialog, private dataService: DataService, private router: Router,
              private addressService: AddressService) {

  }

  getClass(tab: string){
    if (tab === 'active' && this.active){
      return 'green';
    }else if (tab === 'nonActive' && !this.active){
      return 'green';
    }
  }

  getRowSpan(col, index) {
    return this.spans[index] && this.spans[index][col];
  }

  ngOnInit(): void {
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
    let date = new Date(timestamp * 1000);
    return date.toDateString();
  }

  carIdToName(carId){
   this.carServise.getCar(carId).subscribe(car => {
   });
  }


  openAddDialog(route: Route) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      route
    };
    const dialogRef = this.dialog.open(RepeatRouteDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
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
