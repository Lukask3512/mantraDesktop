import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {OpenlayerComponent} from "../../google/map/openlayer/openlayer.component";
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {AddCarDialogComponent} from "../../dialogs/add-car-dialog/add-car-dialog.component";
import {RouteToCarComponent} from "../../dialogs/route-to-car/route-to-car.component";
import Route from "../../../models/Route";
import {DataService} from "../../../data/data.service";
import {take} from "rxjs/operators";
import {RouteService} from "../../../services/route.service";

@Component({
  selector: 'app-new-transport',
  templateUrl: './new-transport.component.html',
  styleUrls: ['./new-transport.component.scss']
})
export class NewTransportComponent implements OnInit {

  routesTowns: string[] = [];
  routesLat: string[] = [];
  routesLon: string[] = [];
  type: string[] = [];
  status: number[]= [];
  carId: string;

  route: Route;

  change:boolean;
  @ViewChild('child')
  private child: OpenlayerComponent;
  constructor(private dialog: MatDialog, private dataService: DataService, private routeService: RouteService) { }

  ngOnInit(): void {
    this.change = false;
    this.routesTowns = [];
    this.routesLon = [];
    this.routesLat = [];
    this.type = [];
    this.status = [];
    this.carId = null;
    this.dataService.currentRoute.pipe(take(1)).subscribe(route => {
      console.log(route)
      if (route != null){
        this.route = route;

        this.routesTowns = this.route.nameOfTowns;
        this.routesLon = this.route.coordinatesOfTownsLon;
        this.routesLat = this.route.coordinatesOfTownsLat;
        this.type = this.route.type;
        this.carId = this.route.carId;
        this.status = this.route.status;
      }
    })
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.routesTowns, event.previousIndex, event.currentIndex);
    moveItemInArray(this.routesLat, event.previousIndex, event.currentIndex);
    moveItemInArray(this.routesLon, event.previousIndex, event.currentIndex);
    moveItemInArray(this.type, event.previousIndex, event.currentIndex);
    moveItemInArray(this.status, event.previousIndex, event.currentIndex);
    this.change = true;
  }

  getAdress(adress){
    this.status.push(-1);
    this.routesTowns.push(adress);
    this.change = true;
  }
  getLat(lat){
    this.routesLat.push(lat);
    // this.child.notifyMe(this.routesLat, this.routesLon, null);
  }
  getLon(lon){
    this.routesLon.push(lon);
    // this.child.notifyMe(this.routesLat, this.routesLon, null);
  }
  getType(type){
    this.type.push(type);
    // this.child.notifyMe(this.routesLat, this.routesLon, null);
  }

  openAddDialog() {
    const dialogConfig = new MatDialogConfig();

    if (this.route.id == null) {
      dialogConfig.data = {
        carId: this.carId,
        routesTowns: this.routesTowns,
        routesLat: this.routesLat,
        routesLon: this.routesLon,
        routesType: this.type,
        routeStatus: this.status,
        newRoute: true
      };
    }else{
      dialogConfig.data = {
        routesTowns: this.routesTowns,
        routesLat: this.routesLat,
        routesLon: this.routesLon,
        routesType: this.type,
        routeId: this.route.id,
        routeStatus: this.status,
        newRoute: false
      };
    }

    console.log(this.status)

    const dialogRef = this.dialog.open(RouteToCarComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else if (value.event == true) {
          this.routesTowns = [];
          this.routesLon = [];
          this.routesLat = [];
          this.type = [];
          this.status = []
        this.change = false;
      }
    });
  }

  openAddDialogChangeCar() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      routesTowns: this.routesTowns,
      routesLat: this.routesLat,
      routesLon: this.routesLon,
      routesType: this.type,
      routeId: this.route.id,
      routeStatus: this.status,
      newRoute: false
    };
    const dialogRef = this.dialog.open(RouteToCarComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      console.log(value)
      if (value === undefined){
        return;
      }else if (value.event == true) {
        console.log(value.carId);
        this.carId = value.carId;
        this.change = false;
      }
    });
  }

  //just update route
  sendToDriver(){
      const route = {
        // carId: this.carId,
        // createdBy: this.createdById,
        nameOfTowns: this.routesTowns,
        coordinatesOfTownsLat: this.routesLat,
        coordinatesOfTownsLon: this.routesLon,
        id: this.route.id,
        status: this.status,
        type: this.type,
        // finished: false,
        createdAt: (Date.now()/1000)
      };
      this.routeService.updateRoute(route);

    this.change = false;
  }

  deleteTown(routeTown){
    for (let i = 0; i < this.routesTowns.length; i++){
      if (this.routesTowns[i] == routeTown){
        this.routesTowns.splice(i,1);
        this.routesLon.splice(i,1);
        this.routesLat.splice(i,1);
        this.type.splice(i,1);
        this.status.splice(i, 1);

      }
    }
    this.change = true;
  }



}
