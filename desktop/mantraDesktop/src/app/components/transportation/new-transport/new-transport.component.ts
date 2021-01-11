import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {OpenlayerComponent} from "../../google/map/openlayer/openlayer.component";
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {AddCarDialogComponent} from "../../dialogs/add-car-dialog/add-car-dialog.component";
import {RouteToCarComponent} from "../../dialogs/route-to-car/route-to-car.component";
import Route from "../../../models/Route";
import {DataService} from "../../../data/data.service";
import {take} from "rxjs/operators";
import {RouteService} from "../../../services/route.service";
import {EditInfoComponent} from "../../dialogs/edit-info/edit-info.component";
import {RouteStatusService} from "../../../data/route-status.service";
import {Subject} from "rxjs";
import Cars from "../../../models/Cars";
import { jsPDF } from 'jspdf';


@Component({
  selector: 'app-new-transport',
  templateUrl: './new-transport.component.html',
  styleUrls: ['./new-transport.component.scss']
})
export class NewTransportComponent implements OnInit {
  //aby log sledoval zmeny ak zmenim trasu
  parentSubject:Subject<any> = new Subject();

  routesTowns: string[] = [];
  routesLat: string[] = [];
  routesLon: string[] = [];
  type: string[] = [];
  status: number[]= [];
  aboutRoute: string[] = [];
  carId: string;
  car: Cars;
  route: Route;

  change:boolean;
  @ViewChild('child')
  private child: OpenlayerComponent;

  @ViewChild('pdfLog', {static: true}) pdfTable: ElementRef;
  constructor(public routeStatus: RouteStatusService, private dialog: MatDialog, private dataService: DataService, private routeService: RouteService) { }

  ngOnInit(): void {
    this.change = false;
    this.routesTowns = [];
    this.routesLon = [];
    this.routesLat = [];
    this.type = [];
    this.status = [];
    this.carId = null;
    this.dataService.currentRoute.pipe(take(1)).subscribe(route => {
      console.log(route);
      if (route != null){
        this.route = route;

        this.routesTowns = this.route.nameOfTowns;
        this.routesLon = this.route.coordinatesOfTownsLon;
        this.routesLat = this.route.coordinatesOfTownsLat;
        this.type = this.route.type;
        this.carId = this.route.carId;
        this.status = this.route.status;
        this.aboutRoute = this.route.aboutRoute;


        if (this.carId != undefined || this.carId != null){
          this.car = this.dataService.getOneCarById(this.carId);
          console.log(this.car)
          setTimeout(() =>
            {

              this.notifyChildren(this.route.id);
              this.child.notifyMe(this.routesLat, this.routesLon,  this.dataService.getOneCarById(this.carId), this.route);
            },
            800);
        }else{
          // setTimeout(() =>
          //   {
          //     this.notifyChildren(this.route.id);
          //     this.child.notifyMe(this.routesLat, this.routesLon,null);
          //   },
          //   800);
        }


      }
    })
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.routesTowns, event.previousIndex, event.currentIndex);
    moveItemInArray(this.routesLat, event.previousIndex, event.currentIndex);
    moveItemInArray(this.routesLon, event.previousIndex, event.currentIndex);
    moveItemInArray(this.type, event.previousIndex, event.currentIndex);
    moveItemInArray(this.status, event.previousIndex, event.currentIndex);
    moveItemInArray(this.aboutRoute, event.previousIndex, event.currentIndex);

    setTimeout(() =>
      {
        if (this.carId != undefined || this.carId !=  null){
          this.child.notifyMe(this.routesLat, this.routesLon,  this.dataService.getOneCarById(this.carId), this.route);

        }
        else{
          this.child.notifyMe(this.routesLat, this.routesLon,undefined, this.route);

        }
      },
      800);

    this.change = true;
  }

  notifyChildren(routeId) {
    console.log("somodoslal")
    this.parentSubject.next(routeId);
  }

  getAdress(adress){
    this.status.push(-1);
    this.routesTowns.push(adress);
    this.change = true;
    setTimeout(() =>
      {
        this.child.notifyMe(this.routesLat, this.routesLon,undefined, this.route);
      },
      800);
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

  getAboutRoute(aboutRoute){
    this.aboutRoute.push(aboutRoute);
    console.log(aboutRoute);
    // this.child.notifyMe(this.routesLat, this.routesLon, null);
  }

  openAddDialog() {
    const dialogConfig = new MatDialogConfig();

    if (this.route == undefined){
      dialogConfig.data = {
        carId: this.carId,
        routesTowns: this.routesTowns,
        routesLat: this.routesLat,
        routesLon: this.routesLon,
        routesType: this.type,
        routeStatus: this.status,
        aboutRoute: this.aboutRoute,
        newRoute: true
      };
    }

    else if (this.route.id == null) {
      dialogConfig.data = {
        carId: this.carId,
        routesTowns: this.routesTowns,
        routesLat: this.routesLat,
        routesLon: this.routesLon,
        routesType: this.type,
        routeStatus: this.status,
        aboutRoute: this.aboutRoute,
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
        aboutRoute: this.aboutRoute,
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
          this.aboutRoute = [];
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
      aboutRoute: this.aboutRoute,
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
        aboutRoute: this.aboutRoute,
        // finished: false,
        createdAt: (Date.now()/1000)
      };
      console.log(route);
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
        this.aboutRoute.splice(i,1);
        setTimeout(() =>
          {
            this.child.notifyMe(this.routesLat, this.routesLon,undefined, this.route);
          },
          800);
      }
    }
    this.change = true;
  }

  editInfo(routeInfo, id){
    const dialogRef = this.dialog.open(EditInfoComponent, {
      data: {routeInfo: routeInfo }
    });
    console.log(routeInfo)
    dialogRef.afterClosed().subscribe(value => {

      if (value.routeInfo !== undefined){
        this.aboutRoute[id] = value.routeInfo;
        this.change = true;
      }else {
        return;
      }
    });
  }

  estimatedTimeToLocal(dateUtc){
    var date = (new Date(dateUtc));
    return date.toLocaleString();
  }

  checkFinished(){
    if (this.route !== undefined && this.route.finished){
      return false;
    }else if(this.route == undefined){
      return true
    }else {
      return true;
    }
  }

  downloadAsPDF(){
    const DATA = this.pdfTable.nativeElement;

    const doc: jsPDF = new jsPDF("p", "mm", "a4");

    doc.html(DATA, {
      callback: (doc) => {
        doc.output("dataurlnewwindow");
      }
    });
  }
}
