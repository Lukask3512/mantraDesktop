import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
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



@Component({
  selector: 'app-new-transport',
  templateUrl: './new-transport.component.html',
  styleUrls: ['./new-transport.component.scss']
})
export class NewTransportComponent implements OnInit {
  //aby log sledoval zmeny ak zmenim trasu
  parentSubject:Subject<any> = new Subject();
  carId: string;
  car: Cars;
  route: Route;

  latFromGoogle;
  lonFromGoogle;
  routeFromGoogle;
  infoAboutRoute: string = "";

  numberOfItems:number = 1;
  actualItemInForm: number = 0;

  detailAboutRoute: any[]; //detail ohladom 1 nakladky/vykladky... kde moze byt viacej ks
  oneDetailAboutRoute: DeatilAboutAdresses;
  arrayOfDetailsAbRoute: any[] = [];

  casPrichodu = 'nerozhoduje';
  datumPrichodu = 'nerozhoduje'

  transportForm = this.fb.group({
   sizeD: ["", Validators.required],
    sizeV: ["", Validators.required],
    sizeS: ["", Validators.required],
    weight: ["0", Validators.required],
    nosnost: ["0"],
    vyskaNakHrany: ["0", Validators.required],
    poziciaNakladania: ["nerozhoduje", Validators.required], //0 nerozhoduje, 1 rozhoduje
    vyskaHrany: ["nerozhoduje", Validators.required],
    vyskaHranySize: [""],
    stohovatelnost: ["nie", Validators.required],
    stohoSize: [0],


    zoZadu: false,
    zBoku: false,
    zVrchu: false,

    fromBackSide: [false],
    fromSide:[false],
    fromUpSide:[false],

  });

  oneDetailFromForm = {
    polohaNakladania: 0,
    sizeD: 0,
    sizeS: 0,
    stohovatelnost: 0,
    vyskaNaklHrany: 0,
    weight: 0,
  }

  arrayOfStringOfDetails;

  dateRange = new FormGroup({
    start: new FormControl(Validators.required),
    end: new FormControl(Validators.required)
  });
  minDate;
  labelPosition: 'Nakladka' | 'Vykladka';


  change:boolean;
  @ViewChild('child')
  private child: OpenlayerComponent;

  @ViewChild('childGoogle')
  private childGoogle: AdressesComponent;

  @ViewChild('pdfLog', {static: true}) pdfTable: ElementRef;
  constructor(private fb: FormBuilder, public routeStatus: RouteStatusService, private dialog: MatDialog,
              private dataService: DataService, private routeService: RouteService,
              private detailAboutService: DetailAboutRouteService) { }

  ngOnInit(): void {
    var loggedDispecer = this.dataService.getDispecer();
    var dispecerId;
    if (loggedDispecer.createdBy == 'master'){
      dispecerId = loggedDispecer.id
    }else {
      dispecerId = loggedDispecer.createdBy;
    }
    this.route = {
      aboutRoute: [],
      carId: "",
      coordinatesOfTownsLat: [],
      coordinatesOfTownsLon: [],
      createdAt: 0,
      createdBy: dispecerId,
      detailsAboutAdresses: [],
      finished: false,
      forEveryone: false,
      id: null,
      nameOfTowns: [],
      offerFrom: [],
      price: 0,
      priceFrom: [],
      status: [],
      takenBy: "",
      type: [],
      ponuknuteTo: "",
    }
    this.minDate = new Date();
    this.detailAboutRoute = []
    this.change = false;
    this.carId = null;
    this.dataService.currentRoute.pipe(take(1)).subscribe(route => {
      console.log(route);
      if (route != null){
        this.route = route;
        this.getDetails();

        if (this.carId != undefined || this.carId != null){
          this.car = this.dataService.getOneCarById(this.carId);
          console.log(this.car)
          setTimeout(() =>
            {

              this.notifyChildren(this.route.id);
              this.child.notifyMe(this.route.coordinatesOfTownsLat, this.route.coordinatesOfTownsLon,  this.dataService.getOneCarById(this.carId), this.route);
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


  onDropListChange(changedRoute: Route){
    this.route = changedRoute;
    console.log(this.route)
    setTimeout(() =>
      {
        if (this.carId != undefined || this.carId !=  null){
          this.child.notifyMe(this.route.coordinatesOfTownsLat, this.route.coordinatesOfTownsLon,  this.dataService.getOneCarById(this.carId), this.route);

        }
        else{
          this.child.notifyMe(this.route.coordinatesOfTownsLat, this.route.coordinatesOfTownsLon,undefined, this.route);

        }
      },
      800);

    this.change = true;
  }


  getAdress(adress){
    // this.status.push(-1);
    // this.routesTowns.push(adress);
    this.routeFromGoogle = adress;
  }
  getLat(lat){
    // this.routesLat.push(lat);
    this.latFromGoogle = lat;
    console.log("igotit" + lat)
    // this.child.notifyMe(this.routesLat, this.routesLon, null);
  }
  getLon(lon){
    this.lonFromGoogle= lon;
    // this.routesLon.push(lon);
    // this.child.notifyMe(this.routesLat, this.routesLon, null);
  }


  notifyChildren(routeId) {
    console.log("somodoslal")
    this.parentSubject.next(routeId);
  }

  async getDetails(){
    for (const route of this.route.detailsAboutAdresses){
      await this.detailAboutService.getOneDetail(route).pipe(take(1)).subscribe(oneDetail => {

          this.arrayOfDetailsAbRoute.push(oneDetail);
          // this.detailAboutRoute =

      });
    }
  }

  updateDetailOnTown(index){
    this.detailAboutRoute = [];
    this.detailAboutRoute = [this.arrayOfDetailsAbRoute[index]];
    this.numberOfItems = this.arrayOfDetailsAbRoute[index].sizeV.length;
    console.log(this.detailAboutRoute);
    this.assignToDetail(0,0);
  }

  add(){
    this.pushItemsToArray(0, this.actualItemInForm)
    console.log(this.routeFromGoogle)
    console.log(this.route)

    this.route.nameOfTowns.push(this.routeFromGoogle);
    this.route.coordinatesOfTownsLon.push(this.lonFromGoogle);
    this.route.coordinatesOfTownsLat.push(this.latFromGoogle);
    this.route.type.push(this.labelPosition);
    this.route.aboutRoute.push(this.infoAboutRoute);
    this.infoAboutRoute = "";
    this.route.status.push(-1);

    this.childGoogle.resetGoogle();
    this.labelPosition = undefined;

    this.arrayOfDetailsAbRoute.push(this.detailAboutRoute);
    this.detailAboutRoute = [];


    this.change = true;
    // this.transportForm.reset();
    this.numberOfItems = 1;
    this.actualItemInForm = 0;
    this.resetFormToDefault(true);
    this.dateRange.reset();

    setTimeout(() =>
      {
        if (this.car == undefined){
          this.child.notifyMe(this.route.coordinatesOfTownsLat, this.route.coordinatesOfTownsLon,undefined, this.route);
        }else{
          this.child.notifyMe(this.route.coordinatesOfTownsLat, this.route.coordinatesOfTownsLon,this.dataService.getOneCarById(this.carId), this.route);

        }
      },
      800);
    this.routeFromGoogle = null;
    this.latFromGoogle= null;
    this.lonFromGoogle = null;

  }

  resetFormToDefault(allForms){
    this.transportForm.reset();
    this.transportForm.controls['poziciaNakladania'].setValue('nerozhoduje');
    this.transportForm.controls['vyskaHrany'].setValue('nerozhoduje');
    this.transportForm.controls['stohovatelnost'].setValue('nie');
    this.transportForm.controls['poziciaNakladania'].setValue('nerozhoduje');
    this.transportForm.controls['fromBackSide'].setValue(undefined);
    this.transportForm.controls['fromSide'].setValue(undefined);
    this.transportForm.controls['fromUpSide'].setValue(undefined);
    if (allForms){
      this.casPrichodu = 'nerozhoduje';
      this.datumPrichodu = 'nerozhoduje';
    }

  }
  pushItemsToArray(indexOfAddresses, indexOfPackage){
    console.log(this.getDetail());
    console.log(this.detailAboutRoute)
    if (this.detailAboutRoute[indexOfAddresses] == undefined){
      this.detailAboutRoute.push(this.getDetail());
    }else{
      console.log(this.detailAboutRoute[indexOfAddresses].stohovatelnost[indexOfPackage]);
      console.log(indexOfPackage);
      if (this.detailAboutRoute[indexOfAddresses].stohovatelnost[indexOfPackage] == undefined){

          this.detailAboutRoute[indexOfAddresses].stohovatelnost.push(this.getDetail().stohovatelnost[0]);
          this.detailAboutRoute[indexOfAddresses].weight.push(this.getDetail().weight[0]);
          this.detailAboutRoute[indexOfAddresses].polohaNakladania.push(this.getDetail().polohaNakladania[0]);
          this.detailAboutRoute[indexOfAddresses].sizeD.push(this.getDetail().sizeD[0]);
          this.detailAboutRoute[indexOfAddresses].sizeS.push(this.getDetail().sizeS[0]);
          this.detailAboutRoute[indexOfAddresses].sizeV.push(this.getDetail().sizeV[0]);
          this.detailAboutRoute[indexOfAddresses].vyskaNaklHrany.push(this.getDetail().vyskaNaklHrany[0]);
      }else{
        this.detailAboutRoute[indexOfAddresses].stohovatelnost[indexOfPackage] = this.getDetail().stohovatelnost[0];
        this.detailAboutRoute[indexOfAddresses].weight[indexOfPackage] = this.getDetail().weight[0];
        this.detailAboutRoute[indexOfAddresses].polohaNakladania[indexOfPackage] = this.getDetail().polohaNakladania[0];
        this.detailAboutRoute[indexOfAddresses].sizeD[indexOfPackage] = this.getDetail().sizeD[0];
        this.detailAboutRoute[indexOfAddresses].sizeS[indexOfPackage] = this.getDetail().sizeS[0];
        this.detailAboutRoute[indexOfAddresses].sizeV[indexOfPackage] = this.getDetail().sizeV[0];
        this.detailAboutRoute[indexOfAddresses].vyskaNaklHrany[indexOfPackage] = this.getDetail().vyskaNaklHrany[0];
      }

    }

  }

  nextItem(){
    console.log(this.actualItemInForm )
    if (this.detailAboutRoute[0] != undefined)
    console.log(this.detailAboutRoute[0].sizeV.length )

    if (this.detailAboutRoute[0] == undefined){
      this.pushItemsToArray(0, this.actualItemInForm)
      this.resetFormToDefault(false);

    }

    else if (this.actualItemInForm == this.detailAboutRoute[0].sizeV.length){
      this.pushItemsToArray(0, this.actualItemInForm);

      // this.oneDetailAboutRoute.stohovatelnost.push()
      this.resetFormToDefault(false);

    }else{
      this.pushItemsToArray(0, this.actualItemInForm);
      this.resetFormToDefault(false);
      this.assignToDetail(0,this.actualItemInForm+1);
    }
    this.actualItemInForm ++;

    console.log(this.detailAboutRoute);
    console.log(this.actualItemInForm)
  }

  previousItem(){
    if (this.actualItemInForm == this.detailAboutRoute[0].sizeV.length){
      this.pushItemsToArray(0, this.actualItemInForm);
    this.resetFormToDefault(false);
    }else{
      this.pushItemsToArray(0, this.actualItemInForm);
    }
    this.actualItemInForm --;
    this.assignToDetail(0,this.actualItemInForm);
  }

  saveDetailFormToArray(){

  }
  //: OneDetailRoute toto tam bolo
  getDetail(){
    var stohovatelnost = this.transportForm.get('stohovatelnost').value;
    if (stohovatelnost == 'nie'){
      stohovatelnost = 0;
    }else{
      stohovatelnost = this.transportForm.get('stohoSize').value;
    }
    var vyskaNakHrany;
    if (this.transportForm.get('vyskaHrany').value == 'rozhoduje'){
      vyskaNakHrany = this.transportForm.get('vyskaHranySize').value;
    }else{
      vyskaNakHrany = -1;
    }

    console.log( this.transportForm.get('fromBackSide').value)
    var back = "0";
    var side = "0";
    var upside = "0";
    if (this.transportForm.get('fromBackSide').value){
      back = "1";
    }
    if (this.transportForm.get('fromSide').value){
      side = "1";
    }
    if (this.transportForm.get('fromUpSide').value){
      upside = "1";
    }

    var polohaNakladania =  back + side + upside;

    return{
      polohaNakladania: [polohaNakladania],
      sizeD: [this.transportForm.get('sizeD').value],
      sizeS: [this.transportForm.get('sizeS').value],
      sizeV: [this.transportForm.get('sizeV').value],
      // specRezim: this.transportForm.get(''),
      stohovatelnost: [stohovatelnost],
      vyskaNaklHrany: [vyskaNakHrany],
      weight: [this.transportForm.get('weight').value]

    }

  }

  assignToDetail(indexOfAddresses, indexOfPackage){
    // console.log(this.detailAboutRoute)
    // console.log(this.detailAboutRoute[this.actualItemInForm].sizeD)

      this.transportForm.controls['sizeD'].setValue(this.detailAboutRoute[indexOfAddresses].sizeD[indexOfPackage]);
    this.transportForm.controls['sizeV'].setValue(this.detailAboutRoute[indexOfAddresses].sizeV[indexOfPackage]);
    this.transportForm.controls['sizeS'].setValue(this.detailAboutRoute[indexOfAddresses].sizeS[indexOfPackage]);
    this.transportForm.controls['weight'].setValue(this.detailAboutRoute[indexOfAddresses].weight[indexOfPackage]);
    if (this.detailAboutRoute[indexOfAddresses].vyskaNaklHrany[indexOfPackage] >= 0){
      this.transportForm.controls['vyskaHranySize'].setValue(this.detailAboutRoute[indexOfAddresses].vyskaNaklHrany[indexOfPackage]);
      this.transportForm.controls['vyskaHrany'].setValue("rozhoduje");
    }else{
      this.transportForm.controls['vyskaHrany'].setValue("nerozhoduje");
    }


    if (this.detailAboutRoute[indexOfAddresses].stohovatelnost[indexOfPackage] > 0){
      this.transportForm.controls['stohoSize'].setValue(this.detailAboutRoute[indexOfAddresses].stohovatelnost[indexOfPackage]);
      this.transportForm.controls['stohovatelnost'].setValue("ano");
    }else{
      this.transportForm.controls['stohovatelnost'].setValue("nie");
    }

    if (this.detailAboutRoute[indexOfAddresses].polohaNakladania[indexOfPackage] != undefined){

    if (this.detailAboutRoute[indexOfAddresses].polohaNakladania[indexOfPackage].charAt(0) == '1'){
      this.transportForm.controls['fromBackSide'].setValue(true);
    }
    if (this.detailAboutRoute[indexOfAddresses].polohaNakladania[indexOfPackage].charAt(1) == '1'){
      this.transportForm.controls['fromSide'].setValue(true);
    }
    if (this.detailAboutRoute[indexOfAddresses].polohaNakladania[indexOfPackage].charAt(2) == '1'){
      this.transportForm.controls['fromUpSide'].setValue(true);
    }

    if (this.detailAboutRoute[indexOfAddresses].polohaNakladania[indexOfPackage].charAt(0) == "1" ||
      this.detailAboutRoute[indexOfAddresses].polohaNakladania[indexOfPackage].charAt(1) == "1" ||
      this.detailAboutRoute[indexOfAddresses].polohaNakladania[indexOfPackage].charAt(2) == "1") {
      this.transportForm.controls['poziciaNakladania'].setValue("rozhoduje");
    }else{
      this.transportForm.controls['poziciaNakladania'].setValue("nerozhoduje");
    }
    }


    // this.transportForm.controls[''].setValue(this.detailAboutRoute[this.actualItemInForm].polohaNakladania);
    // this.transportForm.controls[''].setValue(this.detailAboutRoute[this.actualItemInForm].polohaNakladania);
    // this.transportForm.controls[''].setValue(this.detailAboutRoute[this.actualItemInForm].polohaNakladania);

  }

  openAddDialog() {
    const dialogConfig = new MatDialogConfig();

    if (this.route.id == undefined){
      dialogConfig.data = {
        carId: this.carId,
        route: this.route,
        newRoute: true,
        detailAboutRoute: this.arrayOfDetailsAbRoute,
      };
    }

    else if (this.route.id == null) {
      dialogConfig.data = {
        carId: this.carId,
        route: this.route,
        newRoute: true,
        detailAboutRoute: this.arrayOfDetailsAbRoute,
      };
    }else{
      dialogConfig.data = {
        route: this.route,
        newRoute: false,
        detailAboutRoute: this.arrayOfDetailsAbRoute,
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
          this.route = {
            aboutRoute: [],
            carId: "",
            coordinatesOfTownsLat: [],
            coordinatesOfTownsLon: [],
            createdAt: 0,
            createdBy: dispecerId,
            detailsAboutAdresses: [],
            estimatedTimeArrival: "",
            finished: false,
            finishedAt: 0,
            forEveryone: false,
            id: null,
            nameOfTowns: [],
            offerFrom: [],
            price: 0,
            priceFrom: [],
            status: [],
            takenBy: "",
            type: [],
            ponuknuteTo: "",

          };
        this.change = false;
      }
    });
  }

  sendToAllDispecers(){
    this.route.forEveryone = true;
    this.saveDetailsFirst().then(() =>{
      this.routeService.createRoute(this.route);
      var loggedDispecer = this.dataService.getDispecer();
      var dispecerId;
      if (loggedDispecer.createdBy == 'master'){
        dispecerId = loggedDispecer.id
      }else {
        dispecerId = loggedDispecer.createdBy;
      }
      this.route = {
        aboutRoute: [],
        carId: "",
        coordinatesOfTownsLat: [],
        coordinatesOfTownsLon: [],
        createdAt: 0,
        createdBy: dispecerId,
        detailsAboutAdresses: [],
        finished: false,
        forEveryone: false,
        nameOfTowns: [],
        offerFrom: [],
        price: 0,
        priceFrom: [],
        status: [],
        takenBy: "",
        type: [],
        ponuknuteTo: "",
      }
    })

  }

  async saveDetailsFirst(){
    console.log(this.route.detailsAboutAdresses)
    for (const [index, route] of this.arrayOfDetailsAbRoute.entries()){
      console.log(route)
      const idcko = await this.detailAboutService.createDetail(route[0])
      await this.route.detailsAboutAdresses.push(idcko);
    }
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
        createdAt: (Date.now()/1000)
      };
      console.log(route);
      this.routeService.updateRoute(route);

    this.change = false;
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

  estimatedTimeToLocal(dateUtc){
    var date = (new Date(dateUtc));
    return date.toLocaleString();
  }

//ked sa nahodov zmensi pole, ale by som ho pohol opopovat
  sizeUpdate(){
    if (this.numberOfItems <= this.detailAboutRoute[0].sizeV.length +1){

    }

    if (this.numberOfItems <= this.detailAboutRoute[0].sizeV.length +1){
      this.actualItemInForm = this.numberOfItems -1;
      this.detailAboutRoute[0].sizeV = this.detailAboutRoute[0].sizeV.slice(0, this.numberOfItems -1);
      this.detailAboutRoute[0].sizeS = this.detailAboutRoute[0].sizeS.slice(0, this.numberOfItems -1)
      this.detailAboutRoute[0].sizeD = this.detailAboutRoute[0].sizeD.slice(0, this.numberOfItems -1)
      this.detailAboutRoute[0].weight = this.detailAboutRoute[0].weight.slice(0, this.numberOfItems -1)
      this.detailAboutRoute[0].vyskaNaklHrany = this.detailAboutRoute[0].vyskaNaklHrany.slice(0, this.numberOfItems -1)
      this.detailAboutRoute[0].polohaNakladania = this.detailAboutRoute[0].polohaNakladania.slice(0, this.numberOfItems -1)
      this.detailAboutRoute[0].stohovatelnost = this.detailAboutRoute[0].stohovatelnost.slice(0, this.numberOfItems -1)
      // this.detailAboutRoute[0].specRezim.slice(0, this.numberOfItems)
    }
    console.log(this.numberOfItems)
    console.log(this.detailAboutRoute)
    console.log(this.actualItemInForm)
    // if (this.detailAboutRoute. > this.numberOfItems){
    //   this.detailAboutRoute[]
    // }
  }
}
