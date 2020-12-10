import {Component, Inject, OnInit} from '@angular/core';
import {DataService} from "../../../data/data.service";
import Cars from "../../../models/Cars";
import {RouteService} from "../../../services/route.service";
import Route from "../../../models/Route";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
  selector: 'app-route-to-car',
  templateUrl: './route-to-car.component.html',
  styleUrls: ['./route-to-car.component.scss']
})
export class RouteToCarComponent implements OnInit {

  constructor(private dataService: DataService, private routeService: RouteService, @Inject(MAT_DIALOG_DATA) public data: any) { }
  cars:Cars[];

  routesTowns;
  routesLat;
  routesLon;
  type;
  ngOnInit(): void {
    this.cars = this.dataService.getAllCars();
    console.log(this.data)
    this.routesTowns = this.data.routesTowns;
    this.routesLat = this.data.routesLat;
    this.routesLon = this.data.routesLon;
    this.type = this.data.routesType;
  }

  doAsyncTask() {
    var promise = new Promise((resolve, reject) => {

    });
    return promise;
  }

  addRouteToCar(carId){
    var loggedDispecer = this.dataService.getDispecer();
    var dispecerId;
    if (loggedDispecer.createdBy == 'master'){
      dispecerId = loggedDispecer.id
    }else {
      dispecerId = loggedDispecer.createdBy;
    }
    var route: Route = {
      carId: carId,
      createdBy: dispecerId,
      coordinatesOfTownsLat: this.routesLat,
      coordinatesOfTownsLon: this.routesLon,
      finished: false,
      nameOfTowns: this.routesTowns,
      status: [],
      type: this.type,
      createdAt: (Date.now())

    }
    this.routeService.createRoute(route);

  }




}
