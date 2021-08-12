import {Component, Input, OnInit, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import {OfferRouteService} from "../../../../services/offer-route.service";
import Route from "../../../../models/Route";
import {RouteService} from "../../../../services/route.service";
import {RouteStatusService} from "../../../../data/route-status.service";
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {DataService} from "../../../../data/data.service";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {RouteToCarComponent} from "../../../dialogs/route-to-car/route-to-car.component";
import Cars from "../../../../models/Cars";
import {ShowItinerarComponent} from "./show-itinerar/show-itinerar.component";
import {RouteToItinerarComponent} from "../../new-transport/route-to-itinerar/route-to-itinerar.component";
import Address from "../../../../models/Address";
import {AddressService} from '../../../../services/address.service';


@Component({
  selector: 'app-offer-to-route',
  templateUrl: './offer-to-route.component.html',
  styleUrls: ['./offer-to-route.component.scss']
})



export class OfferToRouteComponent implements OnInit {

  constructor(private offerService: OfferRouteService, private routeService: RouteService, public routeStatus: RouteStatusService,
              private dataService: DataService,  private dialog: MatDialog, private addressesService: AddressService) { }
  routes: Route[];
  fakeRoutes: Route[];

  @Input() offer: Route;
  @Input() offerAddresses: Address[];

  disabled: boolean = false;
  @Output() routeToMap = new EventEmitter<Route>();

  @ViewChild('buttonChange') buttonChange: ElementRef;
  @ViewChild('buttonSave') buttonSave: ElementRef;

  @ViewChild(RouteToItinerarComponent)
    private offerToItinerar: RouteToItinerarComponent;

  fakeOffer: Route;
  routeToDragList: Route;
  ngOnInit(): void {
    console.log(this.offerAddresses)
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

  offerIrRoute(car: Cars){
    this.offer.offerInRoute = car.id;
    console.log(this.offer)
    this.routeService.updateRoute(this.offer);
  }

  getChoosenCar(car: Cars){
    console.log(car)
    this.offerToItinerar.setCar(car);
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

  updateOffer(carId: string){
    var offer: Route = this.offer;
    offer.offerInRoute = carId;
    offer.carId = carId;
    let adresy: Address[] = this.addressesService.getAddressesFromOffer().filter(oneAdresa => offer.addresses.includes(oneAdresa.id));
    this.offerService.updateRoute(offer);
  }

}
