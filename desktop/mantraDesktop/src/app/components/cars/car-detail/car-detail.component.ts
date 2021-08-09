import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {RouteService} from "../../../services/route.service";
import Route from "../../../models/Route";
import {DataService} from "../../../data/data.service";
import {Subject} from "rxjs";
import {OpenlayerComponent} from "../../google/map/openlayer/openlayer.component";
import {DeleteCarDialogComponent} from "../../dialogs/delete-car-dialog/delete-car-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {RouteStatusService} from "../../../data/route-status.service";
import {EditInfoComponent} from "../../dialogs/edit-info/edit-info.component";
import { AngularFireStorage } from '@angular/fire/storage';
import {HttpClient} from '@angular/common/http';
import {CarService} from "../../../services/car.service";
import Cars from "../../../models/Cars";
import {AddressService} from "../../../services/address.service";
import Address from "../../../models/Address";
import {DragAndDropListComponent} from "../../transportation/drag-and-drop-list/drag-and-drop-list.component";
import {DeleteFromItiComponent} from '../../dialogs/delete-from-iti/delete-from-iti.component';
import {ItinerarDaDComponent} from './itinerar-da-d/itinerar-da-d.component';
import {GetNameOfDriverComponent} from '../../vodici/get-name-of-driver/get-name-of-driver.component';

@Component({
  selector: 'app-car-detail',
  templateUrl: './car-detail.component.html',
  styleUrls: ['./car-detail.component.scss']
})
export class CarDetailComponent implements AfterViewInit {
  //aby log sledoval zmeny ak zmenim trasu
  parentSubject:Subject<any> = new Subject();

  routes;
  allActiveRoutes: Route[];
   routesTowns: string[] = [];
   routesLat: string[] = [];
   routesLon: string[] = [];
   status;
   aboutRoute: string[] = [];
  type: string[] = [];
    car: Cars;
  change:boolean;

  createdById;

  myAddresses: Address[] = [];
  @ViewChild('child')
  private child: OpenlayerComponent;

  @ViewChild(GetNameOfDriverComponent)
  private nameOfDriver: GetNameOfDriverComponent;

  @ViewChild('dragDrop')
  private dragComponent: ItinerarDaDComponent;

  constructor(private http: HttpClient, private storage: AngularFireStorage, private routeService: RouteService,
              private dataService: DataService, private dialog: MatDialog, public routeStatus: RouteStatusService,
              private carService: CarService, private addressService: AddressService) {

  }

  @ViewChild('mySendButton') mySendButton: ElementRef;
  ngAfterViewInit(): void {
    this.change = false;
    this.routesTowns = [];
    this.routesLon = [];
    this.routesLat = [];
    this.type = [];
    this.status = [];
    this.aboutRoute = [];
    // this.carService.cars$.subscribe()
    this.dataService.currentCar.subscribe(car => {
      // this.car = car;
      this.carService.cars$.subscribe(cars => {
        // @ts-ignore
        this.car = cars.find(oneCarFromDt => oneCarFromDt.id === car.id);

      });

      var allAddresses: Address[];
       new Promise((resolve, reject) => {
        this.addressService.address$.subscribe(vsetkyAdress => {
          this.addressService.offerAddresses$.subscribe(vsetkyPonuky => {
            allAddresses = vsetkyAdress.concat(vsetkyPonuky);
            this.findMyAdresses(allAddresses);
            if (this.dragComponent){
              this.dragComponent.setAddress(this.myAddresses, this.car);
            }
            resolve();
          });
        });
      }).then(() => {
     new Promise((resolve, reject) => {
       this.findMyAdresses(allAddresses);
       resolve();
     }).then(resolve => {
       this.dragComponent.setAddress(this.myAddresses, this.car);
       setTimeout(() =>
         {
           if (this.nameOfDriver){
             this.nameOfDriver.setCar(this.car);
           }
           this.child.notifyMe(this.myAddresses, this.car, this.car);
         },
         800);
      })
      })

    });

    var loggedDispecer = this.dataService.getDispecer();
    if (loggedDispecer.createdBy == 'master'){
      this.createdById = loggedDispecer.id
    }else {
      this.createdById = loggedDispecer.createdBy;
    }

  }
  notifyChildren(routeId) {
    this.parentSubject.next(routeId);
  }

  findMyAdresses(allAddresses){
    this.myAddresses = [];
    this.car.itinerar.forEach(oneAddresId => {
      this.myAddresses.push(allAddresses.find(oneAddress => oneAddress.id === oneAddresId));
    });
  }

  changeRoute(route: Route){
    this.routes = route;
    // this.routesTowns = route.nameOfTowns;
    // this.routesLat = route.coordinatesOfTownsLat;
    // this.routesLon = route.coordinatesOfTownsLon;
    // this.type = route.type;
    // this.status = route.status;
    // this.aboutRoute = route.aboutRoute;
    this.child.notifyMe(this.myAddresses,this.car, this.routes);
    this.notifyChildren(this.routes.id);

  }

  timestamptToDate(timestamp){
    var date = new Date(timestamp * 1000)
    return date.toDateString();
  }


  sendToDriver(){
    var emptyStatus:number[] = [];
    this.routesTowns.forEach(function (value) {
      emptyStatus.push(-1);
    });

    if (this.routes === undefined){


      // const route: Route = {
      //   detailsAboutAdresses: [],
      //   carId: this.car.id,
      //   createdBy: this.createdById,
      //   nameOfTowns: this.routesTowns,
      //   coordinatesOfTownsLat: this.routesLat,
      //   coordinatesOfTownsLon: this.routesLon,
      //   status: emptyStatus,
      //   type: this.type,
      //   aboutRoute: this.aboutRoute,
      //   finished: false,
      //   createdAt: (Date.now()/1000)
      // };
      // this.routeService.createRoute(route);
    }else{



      // const route: Route = {
      //   detailsAboutAdresses: [],
      //   carId: this.car.id,
      //   createdBy: this.createdById,
      //   nameOfTowns: this.routesTowns,
      //   coordinatesOfTownsLat: this.routesLat,
      //   coordinatesOfTownsLon: this.routesLon,
      //   id: this.routes.id,
      //   status: emptyStatus,
      //   aboutRoute: this.aboutRoute,
      //   type: this.type,
      //   finished: false,
      //   createdAt: (Date.now()/1000)
      // };
      // this.routeService.updateRoute(route);
    }
    this.change = false;

  }

  getAdress(adress){
    this.routesTowns.push(adress);
    this.status.push(-1);
    this.change = true;
  }
  getLat(lat){
    this.routesLat.push(lat);
    this.child.notifyMe(this.myAddresses,this.car, this.routes);
  }
  getLon(lon){
    this.routesLon.push(lon);
    console.log(lon);
    this.child.notifyMe(this.myAddresses,this.car, this.routes);
  }
  getType(type){
    this.type.push(type);
    console.log(type);
    // this.child.notifyMe(this.routesLat, this.routesLon, null);
  }

  getAboutRoute(aboutRoute){
    this.aboutRoute.push(aboutRoute);
    console.log(aboutRoute);
    // this.child.notifyMe(this.routesLat, this.routesLon, null);
  }

  editInfo(routeInfo, id){
    const dialogRef = this.dialog.open(EditInfoComponent, {
      data: {routeInfo: routeInfo }
    });
    dialogRef.afterClosed().subscribe(value => {

      if (value.routeInfo !== undefined){
        this.aboutRoute[id] = value.routeInfo;
        this.change = true;


      }else {
        return;
      }
    });
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
              this.status.splice(i, 1);
              this.aboutRoute.splice(i,1);
              // const route: Route = {
              //   detailsAboutAdresses: [],
              //   carId: this.car.id,
              //   createdBy: this.createdById,
              //   nameOfTowns: this.routesTowns,
              //   coordinatesOfTownsLat: this.routesLat,
              //   coordinatesOfTownsLon: this.routesLon,
              //   id: this.routes.id,
              //   aboutRoute: this.aboutRoute,
              //   status: this.status,
              //   type: this.type,
              //   finished: false,
              //   createdAt: (Date.now()/1000)
              // };
              // this.routeService.updateRoute(route);
            }
          }
        }else {
          return;
        }
      });

  }

  estimatedTimeToLocal(dateUtc){
    var date = (new Date(dateUtc));
    return date.toLocaleString();
  }

  routeDetail(route: Route){
    this.dataService.changeRealRoute(route);
  }

  deleteFromIti(address: Address){
    const dialogRef = this.dialog.open(DeleteFromItiComponent, {
      data: {adresa: address }
    });
    dialogRef.afterClosed().subscribe(value => {

      if (value && value.event !== undefined){
        console.log(value);
        this.car.itinerar = this.car.itinerar.filter(ids => ids !== address.id);
        this.carService.updateCar(this.car, this.car.id);

      }else {
        return;
      }
    });
  }

}
