import {Component, Inject, OnInit} from '@angular/core';
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

@Component({
  selector: 'app-route-to-car',
  templateUrl: './route-to-car.component.html',
  styleUrls: ['./route-to-car.component.scss']
})
export class RouteToCarComponent implements OnInit {

  constructor(private dataService: DataService, private routeService: RouteService
              , @Inject(MAT_DIALOG_DATA) public data: any,
  public dialogRef: MatDialogRef<RouteToCarComponent>, public routeStatusService: RouteStatusService,
              private detailAboutService: DetailAboutRouteService, private carService: CarService) { }
  cars:Cars[];

  routeStatus;

  routesTowns;
  routesLat;
  routesLon;
  type;
  newRoute;
  routeId;
  aboutRoute;
  detailAboutRoute;
  detailAboutAddresses = [];
  ngOnInit(): void {
    // this.cars = this.dataService.getAllCars();
    this.carService.cars$.subscribe(cars => {
      this.cars = cars;
    });

    this.routesTowns = this.data.routesTowns;
    this.routesLat = this.data.routesLat;
    this.routesLon = this.data.routesLon;
    this.type = this.data.routesType;
    this.newRoute = this.data.newRoute;
    this.routeId = this.data.routeId;
    this.routeStatus = this.data.routeStatus;
    this.aboutRoute = this.data.aboutRoute;
    this.detailAboutRoute = this.data.detailAboutRoute;
    console.log(this.data);

  }

  async saveDetailsFirst(car){
      for (const [index, route] of this.detailAboutRoute.entries()){
        const idcko = await this.detailAboutService.createDetail(route[0])
        await this.detailAboutAddresses.push(idcko);
      }
  }

   saveDetailToDatabase(car){
    this.saveDetailsFirst(car).then(()=>{
      this.addRouteToCar(car)
    })
  }




  addRouteToCar(car){

    console.log(car)
    var loggedDispecer = this.dataService.getDispecer();
    var dispecerId;
    if (loggedDispecer.createdBy == 'master'){
      dispecerId = loggedDispecer.id
    }else {
      dispecerId = loggedDispecer.createdBy;
    }
    var route: Route;
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
      this.routeStatus.forEach(route => {
        newRouteStatus.push(-1);
      });
        route = {
          detailsAboutAdresses: this.detailAboutAddresses,
          carId: carId,
          createdBy: dispecerId,
          coordinatesOfTownsLat: this.routesLat,
          coordinatesOfTownsLon: this.routesLon,
          finished: false,
          nameOfTowns: this.routesTowns,
          status: newRouteStatus,
          type: this.type,
          aboutRoute: this.aboutRoute,
          createdAt: (Date.now())
      }
      this.routeService.createRoute(route);
    }
    //ked mam vytvorenu cestu a len ju chem priradit auto
    else {
      var carId2;
      if (car == null){
        carId2 = null;
      }else{
        carId2 = car.id
      }
      route = {
        detailsAboutAdresses: this.detailAboutAddresses,
        id: this.routeId,
        carId: carId2,
        createdBy: dispecerId,
        coordinatesOfTownsLat: this.routesLat,
        coordinatesOfTownsLon: this.routesLon,
        finished: false,
        nameOfTowns: this.routesTowns,
        status: this.routeStatus,
        type: this.type,
        aboutRoute: this.aboutRoute,
        createdAt: (Date.now())
      }
      this.routeService.updateRoute(route);

    }

    this.dialogRef.close({event: true, car: car})
  }




}
