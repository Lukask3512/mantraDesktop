import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {DataService} from "../../../data/data.service";
import Cars from "../../../models/Cars";
import {RouteService} from "../../../services/route.service";
import Route from "../../../models/Route";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {RouteStatusService} from "../../../data/route-status.service";
import {DetailAboutRouteService} from "../../../services/detail-about-route.service";
import {CarService} from "../../../services/car.service";
import DeatilAboutAdresses from "../../../models/DeatilAboutAdresses";
import {take} from "rxjs/operators";
import Address from "../../../models/Address";
import {AddressService} from "../../../services/address.service";
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-route-to-car',
  templateUrl: './route-to-car.component.html',
  styleUrls: ['./route-to-car.component.scss']
})
export class RouteToCarComponent implements OnInit {

  constructor(private dataService: DataService, private routeService: RouteService
              , @Inject(MAT_DIALOG_DATA) public data: any,
  public dialogRef: MatDialogRef<RouteToCarComponent>, public routeStatusService: RouteStatusService,
              private detailAboutService: DetailAboutRouteService, private carService: CarService,
              private addressService: AddressService) { }
  cars:Cars[];

  routeStatus;
  addresses: Address[];
  addressesToDragDrop: Address[];
  route: Route = new Route();
  newRoute;
  routeId;

  isOffer: boolean = false;
  chosenCar: Cars;

  @ViewChild('stepper') private myStepper: MatStepper;
  ngOnInit(): void {
    // this.cars = this.dataService.getAllCars();
    this.carService.cars$.subscribe(cars => {
      this.cars = cars;
    });
    this.newRoute = this.data.newRoute;
    this.addresses = this.data.addresses;
    this.addressesToDragDrop = JSON.parse(JSON.stringify(this.addresses));
    this.isOffer = this.data.offer;

  }

  selectionChange(event){
      if(event.selectedIndex == 0){
        this.chosenCar = undefined;
      }
  }

  choosenCar(car){
    this.chosenCar = car;
    this.myStepper.next();
  }

  async saveRoutesFirsts(car){
    console.log(this.addresses)
      for (const [index, route] of this.addresses.entries()){
        console.log(route)
        if (car == null){
          route.carId = null;
        }else{
          route.carId = car.id;
        }
        var createdBy = this.dataService.getMyIdOrMaster();
        route.createdBy = createdBy;
        const idcko = await this.addressService.createAddressWithId({...route})
        await this.route.addresses.push(idcko);
      }
  }

  updateOffer(){

  }

  saveRoute(addressesId){
    this.route.addresses = addressesId;
    this.addRouteToCar(this.chosenCar);
    this.dialogRef.close();
  }

   saveDetailToDatabase(car){
    if (this.isOffer){
      this.addRouteToCar(car)
    }else{
      this.saveRoutesFirsts(car).then(()=>{
        this.addRouteToCar(car)
      })
    }
  }


  addRouteToCar(car){

    console.log(this.route)
    var loggedDispecer = this.dataService.getDispecer();
    var dispecerId;
    if (loggedDispecer.createdBy == 'master'){
      dispecerId = loggedDispecer.id
    }else {
      dispecerId = loggedDispecer.createdBy;
    }
    var route: Route;
    route = JSON.parse(JSON.stringify(this.route));
    delete route.id;
    route.takenBy = '';
    route.forEveryone = false;
    console.log(this.newRoute)
    //ked nemam vytvorenu cestu
    if (this.newRoute){
      var carId;
      if (car == null){
        carId = null;
      }else{
        carId = car.id
      }
      var newRouteStatus = []
      // this.route.status.forEach(route => {
      //   newRouteStatus.push(-1);
      // });
      route.createdAt = (new Date()).toString();
      route.carId = carId;
      route.finished = false;
      route.createdBy = dispecerId;
      var idNewRouty = this.routeService.createRoute(route);

      //ak je ponuka tak ju updatnem  idckom prepravy kde som ju ulozil
      if (this.isOffer){
        this.route.offerInRoute = idNewRouty;
        console.log(this.route)
        this.routeService.updateRoute(this.route);
      }


    }
    //ked mam vytvorenu cestu a len ju chem priradit auto
    else {
      var carId2;
      if (car == null){
        carId2 = null;
      }else{
        carId2 = car.id
      }
      this.route.createdAt = (new Date()).toString();
      this.route.carId = carId2;
      this.route.finished = false;
      this.route.createdBy = dispecerId;
      // route = {
      //   detailsAboutAdresses: this.route.detailsAboutAdresses,
      //   id: this.routeId,
      //   carId: carId2,
      //   createdBy: dispecerId,
      //   coordinatesOfTownsLat: this.route.coordinatesOfTownsLat,
      //   coordinatesOfTownsLon: this.route.coordinatesOfTownsLon,
      //   finished: false,
      //   nameOfTowns: this.route.nameOfTowns,
      //   status: this.route.status,
      //   type: this.route.type,
      //   aboutRoute: this.route.aboutRoute,
      //   createdAt: (Date.now())
      // }
      this.routeService.updateRoute(this.route);

    }

    this.dialogRef.close({event: true, car: car})
  }




}
