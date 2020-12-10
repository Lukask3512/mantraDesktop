import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {RouteService} from "../../../services/route.service";
import Route from "../../../models/Route";
import {DataService} from "../../../data/data.service";
import {Subject} from "rxjs";
import {OpenlayerComponent} from "../../google/map/openlayer/openlayer.component";
import {DeleteCarDialogComponent} from "../../dialogs/delete-car-dialog/delete-car-dialog.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-car-detail',
  templateUrl: './car-detail.component.html',
  styleUrls: ['./car-detail.component.scss']
})
export class CarDetailComponent implements OnInit {
  routes;
  allActiveRoutes: Route[];
   routesTowns: string[] = [];
   routesLat: string[] = [];
   routesLon: string[] = [];
  type: string[] = [];
    car;
  change:boolean;

  createdById;

  @ViewChild('child')
  private child: OpenlayerComponent;

  constructor(private routeService: RouteService, private dataService: DataService, private dialog: MatDialog) {

  }

  ngOnInit(): void {
    this.change = false;
    this.routesTowns = [];
    this.routesLon = [];
    this.routesLat = [];
    this.type = [];
    this.dataService.currentCar.subscribe(car => {
      this.car = car;
      setTimeout(() =>
        {
          this.child.notifyMe(this.routesLat, this.routesLon,this.car);
        },
        800);
      this.routeService.getRoutes(this.car.id).subscribe(routes => {
        this.routes = routes[0];
        // @ts-ignore
        this.allActiveRoutes = routes;
      console.log(routes);
        if (this.routes !== undefined) {
          // @ts-ignore
          this.actuallyCarRoutes = routes[0];
          this.routesTowns = this.routes.nameOfTowns;
          this.routesLat = this.routes.coordinatesOfTownsLat;
          this.routesLon = this.routes.coordinatesOfTownsLon;
          this.type = this.routes.type;
          //doplnit ykladku nakladku

          setTimeout(() =>
            {
              this.child.notifyMe(this.routesLat, this.routesLon,this.car);
            },
            800);

        }
        if (this.routesTowns === undefined){
          this.routesTowns = [];
          this.routesLon = [];
          this.routesLat = [];
          this.type = [];
        }
      });
    });

    var loggedDispecer = this.dataService.getDispecer();
    if (loggedDispecer.createdBy == 'master'){
      this.createdById = loggedDispecer.id
    }else {
      this.createdById = loggedDispecer.createdBy;
    }

  }

  changeRoute(route: Route){
    this.routes = route;
    this.routesTowns = route.nameOfTowns;
    this.routesLat = route.coordinatesOfTownsLat;
    this.routesLon = route.coordinatesOfTownsLon;
    this.type = route.type;
    this.child.notifyMe(this.routesLat, this.routesLon, this.car);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.routesTowns, event.previousIndex, event.currentIndex);
    moveItemInArray(this.routesLat, event.previousIndex, event.currentIndex);
    moveItemInArray(this.routesLon, event.previousIndex, event.currentIndex);
    moveItemInArray(this.type, event.previousIndex, event.currentIndex);
    this.change = true;
  }


  sendToDriver(){
    var emptyStatus:string[] = [];
    this.routesTowns.forEach(function (value) {
      emptyStatus.push("");
    });

    if (this.routes === undefined){


      const route: Route = {
        carId: this.car.id,
        createdBy: this.createdById,
        nameOfTowns: this.routesTowns,
        coordinatesOfTownsLat: this.routesLat,
        coordinatesOfTownsLon: this.routesLon,
        status: emptyStatus,
        type: this.type,
        finished: false,
        createdAt: (Date.now()/1000)
      };
      this.routeService.createRoute(route);
    }else{



      const route: Route = {
        carId: this.car.id,
        createdBy: this.createdById,
        nameOfTowns: this.routesTowns,
        coordinatesOfTownsLat: this.routesLat,
        coordinatesOfTownsLon: this.routesLon,
        id: this.routes.id,
        status: emptyStatus,
        type: this.type,
        finished: false,
        createdAt: (Date.now()/1000)
      };
      this.routeService.updateRoute(route);
    }
    this.change = false;
  }

  getAdress(adress){
    this.routesTowns.push(adress);
    this.change = true;
  }
  getLat(lat){
    this.routesLat.push(lat);
    this.child.notifyMe(this.routesLat, this.routesLon, this.car);
  }
  getLon(lon){
    this.routesLon.push(lon);
    console.log(lon);
    this.child.notifyMe(this.routesLat, this.routesLon, this.car);
  }
  getType(type){
    this.type.push(type);
    console.log(type);
    // this.child.notifyMe(this.routesLat, this.routesLon, null);
  }

  deleteRoute(routeToDelete){
    // console.log(this.routesTowns);
    // console.log(this.routesLat);
    // console.log(this.routesLon);

    // for (let i = 0; i < this.routesTowns.length; i++){
    //   if (this.routesTowns[i] == routeToDelete){
    //    this.routesTowns.splice(i,1);
    //     this.routesLon.splice(i,1);
    //     this.routesLat.splice(i,1);
    //
    //
    //
    //   }
    // }


      const dialogRef = this.dialog.open(DeleteCarDialogComponent, {
        data: {car: routeToDelete, route: true }
      });
      dialogRef.afterClosed().subscribe(value => {

        if (value.event == true){
          for (let i = 0; i < this.routesTowns.length; i++){
            if (this.routesTowns[i] == routeToDelete){
              this.routesTowns.splice(i,1);
              this.routesLon.splice(i,1);
              this.routesLat.splice(i,1);
              this.type.splice(i,1);
              const route: Route = {
                carId: this.car.id,
                createdBy: this.createdById,
                nameOfTowns: this.routesTowns,
                coordinatesOfTownsLat: this.routesLat,
                coordinatesOfTownsLon: this.routesLon,
                id: this.routes.id,
                status: [],
                type: [],
                finished: false,
                createdAt: (Date.now()/1000)
              };
              this.routeService.updateRoute(route);
            }
          }
        }else {
          return;
        }
      });

  }

}
