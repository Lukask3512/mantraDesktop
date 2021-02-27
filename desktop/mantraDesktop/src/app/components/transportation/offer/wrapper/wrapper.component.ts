import { Component, OnInit } from '@angular/core';
import {OfferRouteService} from "../../../../services/offer-route.service";
import Route from "../../../../models/Route";
import {RouteStatusService} from "../../../../data/route-status.service";
import {DataService} from "../../../../data/data.service";

@Component({
  selector: 'app-wrapper',
  templateUrl: './wrapper.component.html',
  styleUrls: ['./wrapper.component.scss']
})
export class WrapperComponent implements OnInit {

  constructor(private offerService: OfferRouteService, public routeStatusService: RouteStatusService,
              private dataService: DataService) { }

  routes: Route[];
  ngOnInit(): void {
    this.offerService.routes$.subscribe(routes => {
      this.routes = routes;
      console.log(this.routes);
    })
  }

  routeDetail(route){
    console.log(route)
    this.dataService.changeRealRoute(route);
  }

}
