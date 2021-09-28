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

  routesToShow: Route[];
  finishedRoutesToShow: Route[];
  whatIsActive = 0;
  ngOnInit(): void {
    this.offerService.routes$.subscribe(routes => {
      this.routes = routes.filter(oneRoute => oneRoute.finished === false);

      this.finishedRoutes = routes.filter(oneRoute => oneRoute.finished === true);
      this.reClickOnTab();
    });
  }

  routeDetail(route){
    this.dataService.changeRealRoute(route);
  }

  getClass(tab: string){
    if (tab === 'all' && this.whatIsActive === 0){
      return 'green';
    }else if (tab === 'mine' && this.whatIsActive === 1){
      return 'green';
    }else if (tab === 'assigned' && this.whatIsActive === 2){
      return 'green';
    }
  }

  vymazatPonuku(route){
    this.offerService.deleteRoute(route.id);
  }

  // getDispecerId(){
  //   var idCreated;
  //   if (this.dataService.getDispecer().createdBy == 'master'){
  //     return this.dataService.getDispecer().id
  //   }else{
  //     return this.dataService.getDispecer().createdBy
  //   }
  // }



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

  getDispecerId(){
    return this.dataService.getMyIdOrMaster();
  }

  // ked sa mi updatnu routy aby ma neprekliklo na iny tab
  reClickOnTab(){
    if (this.whatIsActive === 0){
      this.allActive();
    }else if(this.whatIsActive === 1){
      this.mine();
    }else if (this.whatIsActive === 2){
      this.assigned();
    }
  }

  allActive(){
    this.routesToShow = this.routes.filter(oneRoute => oneRoute.takenBy === '' && !oneRoute.offerFrom.includes(this.getDispecerId())
      && oneRoute.createdBy !== this.getDispecerId());
    this.whatIsActive = 0;
  }
  mine(){
    this.routesToShow = this.routes.filter(oneRoute => oneRoute.createdBy === this.getDispecerId() && !oneRoute.finished);
    this.finishedRoutesToShow = this.finishedRoutes.filter(oneRoute => oneRoute.createdBy === this.getDispecerId() && oneRoute.finished);
    this.whatIsActive = 1;
  }

  assigned(){
    this.routesToShow = this.routes.filter(oneRoute => (oneRoute.takenBy === '' && oneRoute.offerFrom.includes(this.getDispecerId()) && !oneRoute.finished)
        || oneRoute.takenBy === this.getDispecerId() && !oneRoute.finished);
    this.finishedRoutesToShow = this.finishedRoutes.filter(oneRoute => oneRoute.takenBy === this.getDispecerId() && oneRoute.finished);
    this.whatIsActive = 2;
  }
}
