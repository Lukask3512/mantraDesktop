import {Component, Input, OnInit} from '@angular/core';
import {OfferRouteService} from "../../../../services/offer-route.service";
import Route from "../../../../models/Route";
import {RouteService} from "../../../../services/route.service";
import {RouteStatusService} from "../../../../data/route-status.service";
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";

@Component({
  selector: 'app-offer-to-route',
  templateUrl: './offer-to-route.component.html',
  styleUrls: ['./offer-to-route.component.scss']
})
export class OfferToRouteComponent implements OnInit {

  constructor(private offerService: OfferRouteService, private routeService: RouteService, public routeStatus: RouteStatusService) { }
  routes: Route[];
  @Input() offer: Route;
  routeToDragList: Route;
  ngOnInit(): void {
    console.log(this.offer)
    this.routeService.routes$.subscribe(allRoutes => {
      this.routes = allRoutes;
    })
  }

  setRoute(route){
    this.routeToDragList = route;
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.offer.nameOfTowns, event.previousIndex, event.currentIndex);
      moveItemInArray(this.offer.coordinatesOfTownsLat, event.previousIndex, event.currentIndex);
      moveItemInArray(this.offer.coordinatesOfTownsLon, event.previousIndex, event.currentIndex);
      moveItemInArray(this.offer.type, event.previousIndex, event.currentIndex);
      moveItemInArray(this.offer.status, event.previousIndex, event.currentIndex);
      moveItemInArray(this.offer.aboutRoute, event.previousIndex, event.currentIndex);
      moveItemInArray(this.offer.detailsAboutAdresses, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(this.offer.nameOfTowns, this.routeToDragList.nameOfTowns, event.previousIndex, event.currentIndex);
      transferArrayItem(this.offer.coordinatesOfTownsLat, this.routeToDragList.coordinatesOfTownsLat, event.previousIndex, event.currentIndex);
      transferArrayItem(this.offer.coordinatesOfTownsLon, this.routeToDragList.coordinatesOfTownsLon, event.previousIndex, event.currentIndex);
      transferArrayItem(this.offer.type, this.routeToDragList.type, event.previousIndex, event.currentIndex);
      transferArrayItem(this.offer.status, this.routeToDragList.status, event.previousIndex, event.currentIndex);
      transferArrayItem(this.offer.aboutRoute, this.routeToDragList.aboutRoute, event.previousIndex, event.currentIndex);
      transferArrayItem(this.offer.detailsAboutAdresses, this.routeToDragList.detailsAboutAdresses, event.previousIndex, event.currentIndex);
      console.log(this.routeToDragList)
      console.log(this.offer)

    }

  }

}
