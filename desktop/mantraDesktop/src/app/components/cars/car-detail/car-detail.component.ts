import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {RouteService} from "../../../services/route.service";
import Route from "../../../models/Route";
import {DataService} from "../../../data/data.service";
import {Subject} from "rxjs";
import {OpenlayerComponent} from "../../google/map/openlayer/openlayer.component";

@Component({
  selector: 'app-car-detail',
  templateUrl: './car-detail.component.html',
  styleUrls: ['./car-detail.component.scss']
})
export class CarDetailComponent implements OnInit {
  routes;
   routesTowns: string[] = [];
   routesLat: string[] = [];
   routesLon: string[] = [];
    car;


  @ViewChild('child')
  private child: OpenlayerComponent;

  constructor(private routeService: RouteService, private dataService: DataService) {

  }

  ngOnInit(): void {
    this.routesTowns = [];
    this.routesLon = [];
    this.routesLat = [];
    this.dataService.currentCar.subscribe(car => {
      this.car = car;
      this.routeService.getRoutes(this.car.id).subscribe(routes => {
        this.routes = routes[0];
        if (this.routes !== undefined) {
          this.routesTowns = this.routes.nameOfTowns;
          this.routesLat = this.routes.coordinatesOfTownsLat;
          this.routesLon = this.routes.coordinatesOfTownsLon;
          this.child.notifyMe(this.routesLat, this.routesLon,this.car);
        }
        if (this.routesTowns === undefined){
          this.routesTowns = [];
          this.routesLon = [];
          this.routesLat = [];
        }
      });
    });


  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.routesTowns, event.previousIndex, event.currentIndex);
    moveItemInArray(this.routesLat, event.previousIndex, event.currentIndex);
    moveItemInArray(this.routesLon, event.previousIndex, event.currentIndex);
  }


  sendToDriver(){

    if (this.routes === undefined){
      const route: Route = {
        carId: this.car.id,
        nameOfTowns: this.routesTowns,
        coordinatesOfTownsLat: this.routesLat,
        coordinatesOfTownsLon: this.routesLon,
      };
      this.routeService.createRoute(route);
    }else{
      const route: Route = {
        carId: this.car.id,
        nameOfTowns: this.routesTowns,
        coordinatesOfTownsLat: this.routesLat,
        coordinatesOfTownsLon: this.routesLon,
        id: this.routes.id,
      };
      this.routeService.updateRoute(route);
    }
  }

  getAdress(adress){
    this.routesTowns.push(adress);
  }
  getLat(lat){
    this.routesLat.push(lat);
    this.child.notifyMe(this.routesLat, this.routesLon, this.car);
  }
  getLon(lon){
    this.routesLon.push(lon);
    this.child.notifyMe(this.routesLat, this.routesLon, this.car);
  }
}
