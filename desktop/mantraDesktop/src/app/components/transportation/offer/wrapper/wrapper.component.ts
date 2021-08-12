import { Component, OnInit } from '@angular/core';
import {OfferRouteService} from "../../../../services/offer-route.service";
import Route from "../../../../models/Route";
import {RouteStatusService} from "../../../../data/route-status.service";
import {DataService} from "../../../../data/data.service";
import {DeleteRouteComponent} from "../../../dialogs/delete-route/delete-route.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-wrapper',
  templateUrl: './wrapper.component.html',
  styleUrls: ['./wrapper.component.scss']
})
export class WrapperComponent implements OnInit {

  constructor(private offerService: OfferRouteService, public routeStatusService: RouteStatusService,
              private dataService: DataService,  private dialog: MatDialog) { }

  routes: Route[];
  finishedRoutes: Route[];
  ngOnInit(): void {
    this.offerService.routes$.subscribe(routes => {
      this.routes = routes.filter(oneRoute => oneRoute.finished === false);
      this.finishedRoutes = routes.filter(oneRoute => oneRoute.finished === true);
    });
  }

  routeDetail(route){
    this.dataService.changeRealRoute(route);
  }

  myOffer(){

  }

  vymazatPonuku(route){
    this.offerService.deleteRoute(route.id);
  }

  getDispecerId(){
    var idCreated;
    if (this.dataService.getDispecer().createdBy == 'master'){
      return this.dataService.getDispecer().id
    }else{
      return this.dataService.getDispecer().createdBy
    }
  }



  deleteRoute(route: Route){
    const dialogRef = this.dialog.open(DeleteRouteComponent);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else {
        this.offerService.deleteRoute(route.id);
      }
    });
  }
}
