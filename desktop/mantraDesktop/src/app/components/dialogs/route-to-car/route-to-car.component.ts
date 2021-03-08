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
  route: Route;
  newRoute;
  routeId;
  detailAboutRoute;
  ngOnInit(): void {
    // this.cars = this.dataService.getAllCars();
    this.carService.cars$.subscribe(cars => {
      this.cars = cars;
    });
    this.newRoute = this.data.newRoute;
    this.route = this.data.route;
    this.detailAboutRoute = this.data.detailAboutRoute;
  }

  async saveDetailsFirst(car){
    console.log(this.route.detailsAboutAdresses)
      for (const [index, route] of this.detailAboutRoute.entries()){
        console.log(route)
        const idcko = await this.detailAboutService.createDetail(route)
        await this.route.detailsAboutAdresses.push(idcko);
      }
  }

   saveDetailToDatabase(car){
    this.saveDetailsFirst(car).then(()=>{
      this.addRouteToCar(car)
    })
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
      this.route.status.forEach(route => {
        newRouteStatus.push(-1);
      });
      this.route.createdAt = (Date.now());
      this.route.carId = carId;
      this.route.finished = false;
      this.route.createdBy = dispecerId;
      this.route.status = newRouteStatus;
      //   route = {
      //     detailsAboutAdresses: this.route.detailsAboutAdresses,
      //     carId: carId,
      //     createdBy: dispecerId,
      //     coordinatesOfTownsLat: this.route.coordinatesOfTownsLat,
      //     coordinatesOfTownsLon: this.route.coordinatesOfTownsLon,
      //     finished: false,
      //     nameOfTowns: this.route.nameOfTowns,
      //     status: newRouteStatus,
      //     type: this.route.type,
      //     aboutRoute: this.route.aboutRoute,
      //     createdAt: (Date.now())
      // }
      this.routeService.createRoute(this.route);
    }
    //ked mam vytvorenu cestu a len ju chem priradit auto
    else {
      var carId2;
      if (car == null){
        carId2 = null;
      }else{
        carId2 = car.id
      }
      this.route.createdAt = (Date.now());
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
