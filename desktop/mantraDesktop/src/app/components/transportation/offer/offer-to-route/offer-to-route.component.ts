import {Component, Input, OnInit, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import {OfferRouteService} from "../../../../services/offer-route.service";
import Route from "../../../../models/Route";
import {RouteService} from "../../../../services/route.service";
import {RouteStatusService} from "../../../../data/route-status.service";
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {DataService} from "../../../../data/data.service";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {RouteToCarComponent} from "../../../dialogs/route-to-car/route-to-car.component";


@Component({
  selector: 'app-offer-to-route',
  templateUrl: './offer-to-route.component.html',
  styleUrls: ['./offer-to-route.component.scss']
})



export class OfferToRouteComponent implements OnInit {

  constructor(private offerService: OfferRouteService, private routeService: RouteService, public routeStatus: RouteStatusService,
              private dataService: DataService,  private dialog: MatDialog) { }
  routes: Route[];
  fakeRoutes: Route[];
  @Input() offer: Route;
  disabled: boolean = false;
  @Output() routeToMap = new EventEmitter<Route>();

  @ViewChild('buttonChange') buttonChange: ElementRef;
  @ViewChild('buttonSave') buttonSave: ElementRef;

  fakeOffer: Route;
  routeToDragList: Route;
  ngOnInit(): void {
    console.log(this.offer)
    this.fakeOffer = JSON.parse(JSON.stringify(this.offer));
    if (this.offer.offerInRoute != ''){
      this.disabled = true;
    }

    this.routeService.routes$.subscribe(allRoutes => {
      this.routes = allRoutes;
      this.fakeRoutes = JSON.parse(JSON.stringify(this.routes));
      if (this.fakeOffer.offerInRoute !== ""){
        this.routeToDragList = this.routes.find(route => route.id == this.fakeOffer.offerInRoute)
      }
    })
  }

  setRoute(route){
    this.routeToDragList = JSON.parse(JSON.stringify(route));
    this.routeToMap.emit(this.routeToDragList);
  }

  createNew(){
    // var idCreated;
    // if (this.dataService.getDispecer().createdBy == 'master'){
    //   idCreated = this.dataService.getDispecer().id
    // }else{
    //   idCreated = this.dataService.getDispecer().createdBy
    // }
    this.fakeOffer.forEveryone = false;
    this.fakeOffer.createdAt = (new Date()).toString();
    const dialogConfig = new MatDialogConfig();


      dialogConfig.data = {
        route: this.fakeOffer,
        newRoute: true,
        // detailAboutRoute: this.fakeOffer.detailsAboutAdresses,
        offer: true,
      };




    const dialogRef = this.dialog.open(RouteToCarComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else if (value.event == true) {

      }
    });
  }

  chooseAnotherRoute(){
    this.fakeOffer = JSON.parse(JSON.stringify(this.offer));
    this.routeToDragList = undefined;
  }

  updateRoute(){
    this.offer.offerInRoute = this.routeToDragList.id;
    this.routeService.updateRoute(this.routeToDragList);
    this.offerService.updateRoute(this.offer);
    this.buttonChange.nativeElement.style.display = 'none'
    this.buttonSave.nativeElement.style.display = 'none'
  }

  drop(event: CdkDragDrop<string[]>) {
    // if (event.previousContainer === event.container) {
    //   moveItemInArray(this.routeToDragList.nameOfTowns, event.previousIndex, event.currentIndex);
    //   moveItemInArray(this.routeToDragList.coordinatesOfTownsLat, event.previousIndex, event.currentIndex);
    //   moveItemInArray(this.routeToDragList.coordinatesOfTownsLon, event.previousIndex, event.currentIndex);
    //   moveItemInArray(this.routeToDragList.type, event.previousIndex, event.currentIndex);
    //   moveItemInArray(this.routeToDragList.status, event.previousIndex, event.currentIndex);
    //   moveItemInArray(this.routeToDragList.aboutRoute, event.previousIndex, event.currentIndex);
    //   moveItemInArray(this.routeToDragList.detailsAboutAdresses, event.previousIndex, event.currentIndex);
    //
    //   moveItemInArray(this.routeToDragList.casPrijazdu, event.previousIndex, event.currentIndex);
    //   moveItemInArray(this.routeToDragList.casLastPrijazdu, event.previousIndex, event.currentIndex);
    //   moveItemInArray(this.routeToDragList.datumPrijazdu, event.previousIndex, event.currentIndex);
    //   moveItemInArray(this.routeToDragList.datumLastPrijazdy, event.previousIndex, event.currentIndex);
    // } else {
    //   transferArrayItem(this.fakeOffer.nameOfTowns, this.routeToDragList.nameOfTowns, event.previousIndex, event.currentIndex);
    //   transferArrayItem(this.fakeOffer.coordinatesOfTownsLat, this.routeToDragList.coordinatesOfTownsLat, event.previousIndex, event.currentIndex);
    //   transferArrayItem(this.fakeOffer.coordinatesOfTownsLon, this.routeToDragList.coordinatesOfTownsLon, event.previousIndex, event.currentIndex);
    //   transferArrayItem(this.fakeOffer.type, this.routeToDragList.type, event.previousIndex, event.currentIndex);
    //   transferArrayItem(this.fakeOffer.status, this.routeToDragList.status, event.previousIndex, event.currentIndex);
    //   transferArrayItem(this.fakeOffer.aboutRoute, this.routeToDragList.aboutRoute, event.previousIndex, event.currentIndex);
    //   transferArrayItem(this.fakeOffer.detailsAboutAdresses, this.routeToDragList.detailsAboutAdresses, event.previousIndex, event.currentIndex);
    //
    //   transferArrayItem(this.fakeOffer.casPrijazdu, this.routeToDragList.casPrijazdu, event.previousIndex, event.currentIndex);
    //   transferArrayItem(this.fakeOffer.casLastPrijazdu, this.routeToDragList.casLastPrijazdu, event.previousIndex, event.currentIndex);
    //   transferArrayItem(this.fakeOffer.datumPrijazdu, this.routeToDragList.datumPrijazdu, event.previousIndex, event.currentIndex);
    //   transferArrayItem(this.fakeOffer.datumLastPrijazdy, this.routeToDragList.datumLastPrijazdy, event.previousIndex, event.currentIndex);
    //
    // }
    this.routeToMap.emit(this.routeToDragList);

  }

}
