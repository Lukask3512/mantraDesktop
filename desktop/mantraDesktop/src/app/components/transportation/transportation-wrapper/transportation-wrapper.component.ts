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
import {OfferRouteService} from '../../../services/offer-route.service';

@Component({
  selector: 'app-transportation-wrapper',
  templateUrl: './transportation-wrapper.component.html',
  styleUrls: ['./transportation-wrapper.component.scss']
})
export class TransportationWrapperComponent implements OnInit {
  allActiveRoutes: Route[];
  allFinishedRoutes;

  allActiveRoutesOffer: Route[];
  allFinishedRoutesOffer: Route[];

  routesToShow: Route[];
  routesToShowOffers: Route[];
  active = true;

  displayedColumns: string[] = ['naklady', 'vykladky'];

  spans = [];

  showMineRoutes = true;

  constructor(public routeStatusService: RouteStatusService, private routeService: RouteService,
              private carServise: CarService, private dialog: MatDialog, private dataService: DataService, private router: Router,
              private addressService: AddressService, private offerService: OfferRouteService) {

  }

  getClass(tab: string){
    if (tab === 'active' && this.active){
      return 'green';
    }else if (tab === 'nonActive' && !this.active){
      return 'orangered';
    }
    if (tab === 'mine' && this.showMineRoutes){
      return 'darkorange';
    }
    if (tab === 'offers' && !this.showMineRoutes){
      return 'darkorange';
    }
  }

  getRowSpan(col, index) {
    return this.spans[index] && this.spans[index][col];
  }

  getDispecerId(){
    return this.dataService.getMyIdOrMaster();
  }

  ngOnInit(): void {
    this.routeService.routes$.subscribe(newRoutes => {
      this.allActiveRoutes = newRoutes;
    });


    this.routeService.finishedRoutes$.subscribe(routes => {
      this.allFinishedRoutes = routes;
    });

    this.offerService.routes$.subscribe(routes => {


      var moje = routes.filter(oneRoute => oneRoute.createdBy === this.getDispecerId());

      var zobrate =  routes.filter(oneRoute => oneRoute.takenBy === this.getDispecerId());

      this.allActiveRoutesOffer = moje.concat(zobrate);


    });

  }

  activeRoutes(){
    this.active = true;
    if (this.showMineRoutes){
      this.routesToShow = this.allActiveRoutes;
    }else{
      this.routesToShowOffers = this.allActiveRoutesOffer.filter(oneRoute => !oneRoute.finished);
    }
  }

  nonActiveRoutes(){
    this.active = false;
    if (this.showMineRoutes){
      this.routesToShow = this.allFinishedRoutes;
    }else{
      this.routesToShowOffers = this.allActiveRoutesOffer.filter(oneRoute => oneRoute.finished);
    }
  }

  offersRoutes(){
    this.showMineRoutes = false;
    if (this.active){
      this.routesToShowOffers = this.allActiveRoutesOffer.filter(oneRoute => !oneRoute.finished);
    }else{
      this.routesToShowOffers = this.allActiveRoutesOffer.filter(oneRoute => oneRoute.finished);
    }
  }
  mineRoutes(){
    this.showMineRoutes = true;
    if (this.active){
      this.routesToShowOffers = this.allActiveRoutes;
    }else{
      this.routesToShowOffers = this.allFinishedRoutes;

    }
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
