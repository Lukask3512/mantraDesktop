import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {OpenlayerComponent} from "../../google/map/openlayer/openlayer.component";
import {AdressesComponent} from "../../google/adresses/adresses.component";
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
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import DeatilAboutAdresses from "../../../models/DeatilAboutAdresses";

import {DetailAboutRouteService} from "../../../services/detail-about-route.service";
import OneDetailRoute from "../../../models/OneDetailRoute";
import {DragAndDropListComponent} from "../drag-and-drop-list/drag-and-drop-list.component";
import {CountFreeSpaceService} from "../../../data/count-free-space.service";
import {OfferPriceComponent} from "../../dialogs/offer-price/offer-price.component";
import Address from "../../../models/Address";
import {AddressService} from "../../../services/address.service";
import {NewFormComponent} from "./new-form/new-form.component";
import {ShowDetailComponent} from "./show-detail/show-detail.component";



@Component({
  selector: 'app-new-transport',
  templateUrl: './new-transport.component.html',
  styleUrls: ['./new-transport.component.scss']
})
export class NewTransportComponent implements AfterViewInit {
  addresses: Address[] = [];
  detail = []


  //aby log sledoval zmeny ak zmenim trasu
  parentSubject:Subject<any> = new Subject();
  carId: string;
  car: Cars;
  route: Route;
  actualAdress: Address;

  infoAboutRoute: string = "";

  numberOfItems:number = 1;
  actualItemInForm: number = 0;

  detailAboutRoute: any; //detail ohladom 1 nakladky/vykladky... kde moze byt viacej ks
  oneDetailAboutRoute: DeatilAboutAdresses;
  arrayOfDetailsAbRoute: any[] =  [];
  fakeArrayOfDetailsAbRoute: any[] =  [];



  arrayOfStringOfDetails;

  //pole
  arrayOfDetailsPositions = [];


  minDate;
  labelPosition: 'nakladka' | 'vykladka';


  change:boolean;

  clickedOnIndexDetail: number;

  @ViewChild('dropList')
  private childDropList: DragAndDropListComponent;

  @ViewChild('child')
  private child: OpenlayerComponent;

  @ViewChild('childGoogle')
  private childGoogle: AdressesComponent;

  @ViewChild(NewFormComponent)
  private newFormChild: NewFormComponent;

  @ViewChild(ShowDetailComponent)
  private detailChild: ShowDetailComponent;

  @ViewChild('pdfLog', {static: true}) pdfTable: ElementRef;
  constructor(private fb: FormBuilder, public routeStatus: RouteStatusService, private dialog: MatDialog,
              private dataService: DataService, private routeService: RouteService,
              private detailAboutService: DetailAboutRouteService, private countFreeSpace: CountFreeSpaceService,
              private addressService: AddressService) { }

  ngAfterViewInit(): void {
    var loggedDispecer = this.dataService.getDispecer();
    var dispecerId;
    if (loggedDispecer.createdBy == 'master'){
      dispecerId = loggedDispecer.id
    }else {
      dispecerId = loggedDispecer.createdBy;
    }
    this.route = new Route();
    this.route.carId = "";
    this.route.createdBy = dispecerId;
    this.route.finished = false;
    this.route.forEveryone = false;
    this.route.price = 0;
    this.route.takenBy = "";
    this.route.ponuknuteTo =  "";
    this.route.offerInRoute = "";


    this.detailAboutRoute = {};
    this.change = false;
    this.dataService.currentRoute.pipe(take(1)).subscribe(route => {
      console.log(route);
      if (route != null){
        this.route = route;
        this.addressService.address$.subscribe(alAdd => {

          var adresy = alAdd.filter(jednaAdresa => this.route.addresses.includes(jednaAdresa.id));
          adresy = this.route.addresses.map((i) => adresy.find((j) => j.id === i)); //ukladam ich do poradia
          this.addresses = adresy;
          this.childDropList.setAddresses(this.addresses);
        })
        this.carId = this.route.carId
        if (this.carId != undefined || this.carId != null){
          this.car = this.dataService.getOneCarById(this.carId);
          setTimeout(() =>
            {

              this.notifyChildren(this.route.id);
              this.child.notifyMe(this.addresses,  this.dataService.getOneCarById(this.carId), this.route);
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

  receiveAddressUpdate(adreesIndex){
    console.log(adreesIndex);
    this.addresses[adreesIndex.index] = adreesIndex.adresa;
  }

  updateDetailOnTown(index: number){
    this.newFormChild.setAddress(this.addresses[index], index);
  }

  setDetailForm(detail){
    this.newFormChild.setDetail(detail);
  }


  onDropListChange(changedRoute: Address[]){
    this.addresses = changedRoute;
    // console.log(this.route)
    setTimeout(() =>
      {
        if (this.carId != undefined || this.carId !=  null){
          this.child.notifyMe(this.addresses,  this.dataService.getOneCarById(this.carId), this.route);

        }
        else{
          this.child.notifyMe(this.addresses,undefined, this.route);

        }
      },
      800);

    this.change = true;
  }
  setForm(mestoIndex, bednaIndex){

  }


  receiveAddress(address: Address){
    this.addresses.push(address);
    this.child.notifyMe(this.addresses,undefined, undefined);
  }

  receiveDetail(detail){
    this.detail.push(detail);
    this.detailChild.setDetails(this.detail);
    this.dataService.setDetailSource(this.detail)
  }

  receiveDetailPosition(detailPositions){
    this.arrayOfDetailsPositions.push(detailPositions);
  }


  notifyChildren(routeId) {
    this.parentSubject.next(routeId);
  }



  // updateArrayOfDetail(){
  //   this.pushItemsToArray(0, this.actualItemInForm);
  //   this.arrayOfDetailsAbRoute[this.clickedOnIndexDetail] = this.detailAboutRoute;
  //   this.resetFormToDefault(true);
  //   this.clickedOnIndexDetail = undefined;
  //   this.numberOfItems = 1;
  //   this.actualItemInForm = 0;
  //   this.change = true;
  // }












  openAddDialog() {
    const dialogConfig = new MatDialogConfig();

    if (this.route.id == undefined){
      dialogConfig.data = {
        carId: this.carId,
        addresses: this.addresses,
        newRoute: true,
        packages: this.detail
      };
    }

    else if (this.route.id == null) {
      dialogConfig.data = {
        carId: this.carId,
        addresses: this.addresses,
        newRoute: true,
        packages: this.detail
      };
    }else{
      dialogConfig.data = {
        addresses: this.addresses,
        newRoute: false,
        packages: this.detail
      };
    }


    const dialogRef = this.dialog.open(RouteToCarComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else if (value.event == true) {
        var loggedDispecer = this.dataService.getDispecer();
        var dispecerId;
        if (loggedDispecer.createdBy == 'master'){
          dispecerId = loggedDispecer.id
        }else {
          dispecerId = loggedDispecer.createdBy;
        }

        this.change = false;
      }
    });
  }

 async saveAddresses(){
    var addressesId: string[] = [];
    for (const oneAddres of this.addresses){
      if (oneAddres.id){
        addressesId.push(oneAddres.id);
      }else{
        var createdBy = this.dataService.getMyIdOrMaster();
        const idcko = await this.addressService.createAddressWithId({...oneAddres});
        addressesId.push(idcko);
      }
    }
    this.route.addresses = addressesId;
  }

  sendToAllDispecers(price){
    this.route.forEveryone = true;
    this.route.offerFrom = [];
    this.route.priceFrom = [];
    this.route.price = price;

      console.log(this.route);
      this.routeService.createRoute({...this.route});

  }


  openAddDialogChangeCar() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      route: this.route,
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
        route: this.route,
        // createdAt: (Date.now()/1000)
      };
      console.log(route);
      this.routeService.updateRoute(route);
    this.change = false;
  }

  //  updateDetails(){
  //   var poleDetailov = [...this.arrayOfDetailsAbRoute];
  //   console.log(this.arrayOfDetailsAbRoute)
  //   var bar = new Promise((resolve, reject) => {
  //     poleDetailov.forEach((route, index) => {
  //       console.log(index);
  //       console.log(route)
  //       if (this.arrayOfDetailsAbRoute[index].id != undefined) {
  //         console.log("updatujem");
  //         this.detailAboutService.updateDetail(route, route.id)
  //       } else {
  //         console.log("mal by som vytvorit a pushnut do details");
  //         this.route.detailsAboutAdresses.splice(index, 0, "ric");
  //         this.detailAboutService.createDetail(route);
  //       }
  //     })
  //   });
  //   console.log(this.route.detailsAboutAdresses);
  //   bar.then(() => {
  //     this.sendToDriver();
  //   });
  // }


  checkFinished(){
    if (this.route !== undefined && this.route.finished){
      return false;
    }else if(this.route == undefined){
      return true
    }else {
      return true;
    }
  }

  estimatedTimeToLocal(dateUtc){
    var date = (new Date(dateUtc));
    return date.toLocaleString();
  }



  checkAllDetailsInserted(){
    this.detailAboutRoute.sizeV.forEach((oneSize, index) => {
      if (this.detailAboutRoute.sizeV[index] >= 0){
        if (this.detailAboutRoute.sizeS[index] >= 0){
          if (this.detailAboutRoute.sizeD[index] >= 0){
            if (this.detailAboutRoute.weight[index] >= 0){
              if (this.detailAboutRoute.sizeV[index] >= 0){

              }
            }
          }
        }
      }
    })
  }
  openOfferDialog() {
    const dialogConfig = new MatDialogConfig();
    // dialogConfig.width = '23em';
    const dialogRef = this.dialog.open(OfferPriceComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(value => {
      if (value === undefined){
        return;
      }else {
        this.saveAddresses().then(() => {
          this.sendToAllDispecers(value)
        })
      }
    });
  }

  ciMozemVylozitBednu(detail,indexMesta, indexBedne){
    var moznyPocetVylozenia = 0;
    var pocetnalozeni = 0;
    var nakladky = [];
    // if (this.labelPosition == 'nakladka'){
    //   // this.fakeArrayOfDetailsAbRoute
    //   for (let i = 0; i < this.fakeArrayOfDetailsAbRoute.length; i++) {
    //     for (let j = 0; j < this.fakeArrayOfDetailsAbRoute[i].sizeS; j++) {
    //       if (indexMesta != i && indexBedne != j){ // aby som nenasiel sam seba
    //         if (this.arrayOfDetailsAbRoute[indexMesta].sizeS[indexBedne] ==  this.arrayOfDetailsAbRoute[i].sizeS[j]  &&
    //           this.arrayOfDetailsAbRoute[indexMesta].sizeD[indexBedne] ==  this.arrayOfDetailsAbRoute[i].sizeD[j] &&
    //           this.arrayOfDetailsAbRoute[indexMesta].sizeV[indexBedne] ==  this.arrayOfDetailsAbRoute[i].sizeV[j] &&
    //           this.arrayOfDetailsAbRoute[indexMesta].weight[indexBedne] ==  this.arrayOfDetailsAbRoute[i].weight[j] &&
    //           this.arrayOfDetailsAbRoute[indexMesta].polohaNakladania[indexBedne] ==  this.arrayOfDetailsAbRoute[i].polohaNakladania[j] &&
    //           this.arrayOfDetailsAbRoute[indexMesta].stohovatelnost[indexBedne] ==  this.arrayOfDetailsAbRoute[i].stohovatelnost[j]){
    //           if (this.route.type[i] == 'nakladka'){
    //             pocetnalozeni++;
    //             nakladky.push({mesto: i, bedna: j});
    //           }
    //           if (this.route.type[i] == 'vykladka'){
    //             moznyPocetVylozenia++;
    //           }
    //         }
    //       }
    //     }
    //   }
    //   if (moznyPocetVylozenia != 0){
    //     for (let j = 0; j < moznyPocetVylozenia; j++) {
    //       this.fakeArrayOfDetailsAbRoute[nakladky[0].mesto].vylozene
    //
    //     }
    //   }
    //
    // }

    return true;
  }
}
