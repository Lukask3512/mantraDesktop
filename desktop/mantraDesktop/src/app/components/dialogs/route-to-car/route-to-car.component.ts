import {Component, Inject, OnInit} from '@angular/core';
import {DataService} from "../../../data/data.service";
import Cars from "../../../models/Cars";
import {RouteService} from "../../../services/route.service";
import Route from "../../../models/Route";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-route-to-car',
  templateUrl: './route-to-car.component.html',
  styleUrls: ['./route-to-car.component.scss']
})
export class RouteToCarComponent implements OnInit {

  constructor(private dataService: DataService, private routeService: RouteService
              , @Inject(MAT_DIALOG_DATA) public data: any,
  public dialogRef: MatDialogRef<RouteToCarComponent>) { }
  cars:Cars[];

  routesTowns;
  routesLat;
  routesLon;
  type;
  newRoute;
  routeId;
  ngOnInit(): void {
    this.cars = this.dataService.getAllCars();
    console.log(this.data)
    this.routesTowns = this.data.routesTowns;
    this.routesLat = this.data.routesLat;
    this.routesLon = this.data.routesLon;
    this.type = this.data.routesType;
    this.newRoute = this.data.newRoute;
    this.routeId = this.data.routeId;
  }


  addRouteToCar(carId){
    var loggedDispecer = this.dataService.getDispecer();
    var dispecerId;
    if (loggedDispecer.createdBy == 'master'){
      dispecerId = loggedDispecer.id
    }else {
      dispecerId = loggedDispecer.createdBy;
    }
    var emptyStatus:number[] = [];
    this.routesTowns.forEach(function (value) {
      emptyStatus.push(-1);
    });
    var route: Route;
    console.log(this.newRoute)
    //ked nemam vytvorenu cestu
    if (this.newRoute){
        route = {
          carId: carId,
          createdBy: dispecerId,
          coordinatesOfTownsLat: this.routesLat,
          coordinatesOfTownsLon: this.routesLon,
          finished: false,
          nameOfTowns: this.routesTowns,
          status: emptyStatus,
          type: this.type,
          createdAt: (Date.now())
      }
      this.routeService.createRoute(route);
    }
    //ked mam vytvorenu cestu a len ju chem priradit auto
    else {
      route = {
        id: this.routeId,
        carId: carId,
        createdBy: dispecerId,
        coordinatesOfTownsLat: this.routesLat,
        coordinatesOfTownsLon: this.routesLon,
        finished: false,
        nameOfTowns: this.routesTowns,
        status: emptyStatus,
        type: this.type,
        createdAt: (Date.now())
      }
      this.routeService.updateRoute(route);

    }

    this.dialogRef.close({event: true})
  }




}