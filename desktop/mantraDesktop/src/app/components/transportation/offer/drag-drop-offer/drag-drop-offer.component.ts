import {Component, Input, OnInit} from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import Route from "../../../../models/Route";
import {RouteStatusService} from "../../../../data/route-status.service";

@Component({
  selector: 'app-drag-drop-offer',
  templateUrl: './drag-drop-offer.component.html',
  styleUrls: ['./drag-drop-offer.component.scss']
})
export class DragDropOfferComponent implements OnInit {

  @Input() route: Route;
  constructor(public routeStatus: RouteStatusService,) { }

  ngOnInit(): void {
  }

  drop(event: CdkDragDrop<string[]>) {
    // if (event.previousContainer === event.container) {
    // moveItemInArray(this.route.nameOfTowns, event.previousIndex, event.currentIndex);
    // moveItemInArray(this.route.coordinatesOfTownsLat, event.previousIndex, event.currentIndex);
    // moveItemInArray(this.route.coordinatesOfTownsLon, event.previousIndex, event.currentIndex);
    // moveItemInArray(this.route.type, event.previousIndex, event.currentIndex);
    // moveItemInArray(this.route.status, event.previousIndex, event.currentIndex);
    // moveItemInArray(this.route.aboutRoute, event.previousIndex, event.currentIndex);
    // moveItemInArray(this.route.detailsAboutAdresses, event.previousIndex, event.currentIndex);
    // } else {
    //   console.log(event)
    //   transferArrayItem(this.route.nameOfTowns,
    //     event.container.data,
    //     event.previousIndex,
    //     event.currentIndex);
    // }

  }

}
