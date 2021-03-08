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
import {DragAndDropListComponent} from "../drag-and-drop-list/drag-and-drop-list.component";
import {CountFreeSpaceService} from "../../../data/count-free-space.service";



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

  detailAboutRoute: any; //detail ohladom 1 nakladky/vykladky... kde moze byt viacej ks
  oneDetailAboutRoute: DeatilAboutAdresses;
  arrayOfDetailsAbRoute: any[] =  [];

  casPrichodu = 'nerozhoduje';
  datumPrichodu = 'nerozhoduje'

  transportForm = this.fb.group({
   sizeD: ['', Validators.required],
    sizeV: [ '',Validators.required],
    sizeS: ['', Validators.required],
    weight: ['', Validators.required],
    poziciaNakladania: ["nerozhoduje"], //0 nerozhoduje, 1 rozhoduje
    vyskaHrany: ["nerozhoduje", Validators.required],
    vyskaHranySize: [''],
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
  labelPosition: 'nakladka' | 'vykladka';


  change:boolean;

  clickedOnIndexDetail: number;

  @ViewChild('dropList')
  private childDropList: DragAndDropListComponent;

  @ViewChild('child')
  private child: OpenlayerComponent;

  @ViewChild('childGoogle')
  private childGoogle: AdressesComponent;

  @ViewChild('pdfLog', {static: true}) pdfTable: ElementRef;
  constructor(private fb: FormBuilder, public routeStatus: RouteStatusService, private dialog: MatDialog,
              private dataService: DataService, private routeService: RouteService,
              private detailAboutService: DetailAboutRouteService, private countFreeSpace: CountFreeSpaceService) { }

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
      nameOfTowns: [],
      offerFrom: [],
      price: 0,
      priceFrom: [],
      status: [],
      takenBy: "",
      type: [],
      ponuknuteTo: "",
      offerInRoute: ""
    }
    this.minDate = new Date();
    this.detailAboutRoute = {};
    this.change = false;
    this.dataService.currentRoute.pipe(take(1)).subscribe(route => {
      console.log(route);
      if (route != null){
        this.route = route;
        this.getDetails();
        this.carId = this.route.carId
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
  //ci mozem ist na dalsi detail
  checkIfCanSKipToNext(){
    if (this.labelPosition == 'nakladka') {
    if (this.transportForm.valid && this.actualItemInForm+1  < this.numberOfItems){
      return false;
    }else{
      return true;
    }
  }else if (this.labelPosition == 'vykladka' && this.transportForm.get('sizeS').value > 0 && this.numberOfItems > 1 &&
          this.actualItemInForm +1 < this.numberOfItems){
  return false;
    }
    else{
      return true;
    }
      }

  //ci mozem backnut na detail
  checkIfCanSKipToPrevious(){
    if (this.labelPosition == 'nakladka') {
      if (this.actualItemInForm + 1 > 1 && this.transportForm.valid) {
        return false;
      } else {
        return true;
      }
    }else if (this.labelPosition == 'vykladka' && this.transportForm.get('sizeS').value > 0 && this.numberOfItems > 1 &&
      this.actualItemInForm +1 > 1){
      return false;
    }
    else{
      return true;
    }
  }

  //ci mozem pridat dalsiu adresu
  checkIfCanAddNextAdress(){
    // console.log(this.numberOfItems);
    // console.log(this.detailAboutRoute.sizeS.length);
    if (this.labelPosition == 'nakladka') {

      if (this.detailAboutRoute.sizeS != undefined) {
        if (this.transportForm.valid && this.detailAboutRoute.sizeS.length == this.numberOfItems && this.labelPosition) {
          return false;
        } else if (this.transportForm.valid && this.actualItemInForm + 1 == this.numberOfItems && this.labelPosition) { // ak som na poslednom
          return false;
        } else {
          return true;
        }
      } else if (this.transportForm.valid && this.numberOfItems == 1 && this.labelPosition) {
        return false;
      }

    }else if (this.labelPosition == 'vykladka'){
      if (this.detailAboutRoute.sizeS != undefined  && this.transportForm.get('sizeS').value > 0 &&
        (this.detailAboutRoute.sizeS.length == this.numberOfItems || this.actualItemInForm +1 == this.numberOfItems)){
        return false;
      }
      else if (this.detailAboutRoute.sizeS == undefined && this.transportForm.get('sizeS').value > 0 && this.numberOfItems == 1){
        return false;
      }else{
        return true;
      }
    }

    else{
      return true;
    }

  }

  updateMatLabelForm(){
    if (this.transportForm.get('poziciaNakladania').value == 'rozhoduje') {
      if (!this.transportForm.get('fromBackSide').value || !this.transportForm.get('fromSide').value || !this.transportForm.get('fromUpSide').value)
        this.transportForm.get('fromBackSide').setValidators([Validators.requiredTrue]);
    }else{
      this.transportForm.get('fromBackSide').clearValidators();
    }
    this.transportForm.get('fromBackSide').updateValueAndValidity();
  }

  updateFormPosition(){
    if (this.transportForm.get('poziciaNakladania').value == 'rozhoduje') {
      this.transportForm.get('fromBackSide').clearValidators();
    }else{
      if (!this.transportForm.get('fromBackSide').value || !this.transportForm.get('fromSide').value || !this.transportForm.get('fromUpSide').value)
      this.transportForm.get('fromBackSide').setValidators([Validators.requiredTrue]);
    }
    this.transportForm.get('fromBackSide').updateValueAndValidity();
  }

  updateValidFormHrana(){
    if (this.transportForm.get('vyskaHrany').value == 'rozhoduje'){
      this.transportForm.get('vyskaHranySize').clearValidators();
    }else{
      this.transportForm.get('vyskaHranySize').setValidators([Validators.required]);
    }
    this.transportForm.get('vyskaHranySize').updateValueAndValidity();
  }

  updateFormStoho(){
    if (this.transportForm.get('stohovatelnost').value == 'ano'){
      this.transportForm.get('stohoSize').clearValidators();
    }else{
      this.transportForm.get('stohoSize').setValidators(Validators.required);
    }
    this.transportForm.get('stohoSize').updateValueAndValidity();
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
  setForm(mestoIndex, bednaIndex){
    // this.detailAboutRoute = this.arrayOfDetailsAbRoute[mestoIndex];
    this.assignToDetail(mestoIndex,bednaIndex);
  }

  labelChange(){
    console.log(this.labelPosition)
    if (this.labelPosition == 'nakladka'){
      this.transportForm.enable();
    }else{
      this.transportForm.disable();
    }
  }

  getAdress(adress){
    // this.status.push(-1);
    // this.routesTowns.push(adress);
    this.routeFromGoogle = adress;
    this.resetFormToDefault(true);
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
          console.log(oneDetail)
        // @ts-ignore
        var detailAboutAdd: DeatilAboutAdresses = oneDetail;
          detailAboutAdd.id = route;
          console.log(detailAboutAdd)
          this.arrayOfDetailsAbRoute.push(detailAboutAdd);
          if (this.arrayOfDetailsAbRoute.length == this.route.detailsAboutAdresses.length){
            this.childDropList.setDetails(this.arrayOfDetailsAbRoute);
            console.log(this.arrayOfDetailsAbRoute)
          }

      });
    }
  }

  updateArrayOfDetail(){
    this.pushItemsToArray(0, this.actualItemInForm);
    this.arrayOfDetailsAbRoute[this.clickedOnIndexDetail] = this.detailAboutRoute;
    this.resetFormToDefault(true);
    this.clickedOnIndexDetail = undefined;
    this.numberOfItems = 1;
    this.actualItemInForm = 0;
    this.change = true;
  }

  updateDetailOnTown(index){
    this.detailAboutRoute = {};
    this.detailAboutRoute = this.arrayOfDetailsAbRoute[index];
    this.numberOfItems = this.arrayOfDetailsAbRoute[index].sizeV.length;
    console.log(this.arrayOfDetailsAbRoute);
    this.assignToDetail(0,0);
    this.clickedOnIndexDetail = index;
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
    // var vopchaSa = this.countFreeSpace.countFreeSpace(this.arrayOfDetailsAbRoute, null, null, this.route);
    // console.log(vopchaSa);
    console.log(this.arrayOfDetailsAbRoute)
    console.log(this.detailAboutRoute);
    this.childDropList.setDetails(this.arrayOfDetailsAbRoute);
    this.detailAboutRoute = {};


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
    if (this.detailAboutRoute.sizeV == undefined){
      this.detailAboutRoute = this.getDetail();
    }else{
      if (this.detailAboutRoute.stohovatelnost[indexOfPackage] == undefined){

          this.detailAboutRoute.stohovatelnost.push(this.getDetail().stohovatelnost[0]);
          this.detailAboutRoute.weight.push(this.getDetail().weight[0]);
          this.detailAboutRoute.polohaNakladania.push(this.getDetail().polohaNakladania[0]);
          this.detailAboutRoute.sizeD.push(this.getDetail().sizeD[0]);
          this.detailAboutRoute.sizeS.push(this.getDetail().sizeS[0]);
          this.detailAboutRoute.sizeV.push(this.getDetail().sizeV[0]);
          this.detailAboutRoute.vyskaNaklHrany.push(this.getDetail().vyskaNaklHrany[0]);
      }else{
        this.detailAboutRoute.stohovatelnost[indexOfPackage] = this.getDetail().stohovatelnost[0];
        this.detailAboutRoute.weight[indexOfPackage] = this.getDetail().weight[0];
        this.detailAboutRoute.polohaNakladania[indexOfPackage] = this.getDetail().polohaNakladania[0];
        this.detailAboutRoute.sizeD[indexOfPackage] = this.getDetail().sizeD[0];
        this.detailAboutRoute.sizeS[indexOfPackage] = this.getDetail().sizeS[0];
        this.detailAboutRoute.sizeV[indexOfPackage] = this.getDetail().sizeV[0];
        this.detailAboutRoute.vyskaNaklHrany[indexOfPackage] = this.getDetail().vyskaNaklHrany[0];
      }

    }

  }

  nextItem(){
    console.log(this.actualItemInForm )
    if (this.detailAboutRoute != undefined)

    if (this.detailAboutRoute == undefined){
      this.pushItemsToArray(0, this.actualItemInForm)
      this.resetFormToDefault(false);

    }
    else if (this.detailAboutRoute.sizeV == undefined){
      this.pushItemsToArray(0, this.actualItemInForm);

      // this.oneDetailAboutRoute.stohovatelnost.push()
      this.resetFormToDefault(false);
    }
    else if (this.actualItemInForm == this.detailAboutRoute.sizeV.length){
      this.pushItemsToArray(0, this.actualItemInForm);

      // this.oneDetailAboutRoute.stohovatelnost.push()
      this.resetFormToDefault(false);

    }

    else{
      this.pushItemsToArray(0, this.actualItemInForm);
      this.resetFormToDefault(false);
      this.assignToDetail(0,this.actualItemInForm+1);
    }
    this.actualItemInForm ++;

    console.log(this.detailAboutRoute);
    console.log(this.actualItemInForm)
  }

  previousItem(){
    if (this.actualItemInForm == this.detailAboutRoute.sizeV.length){
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
    var detail: DeatilAboutAdresses;
    if (this.detailAboutRoute == undefined && this.arrayOfDetailsAbRoute[indexOfAddresses] == undefined){
      return;
    }
   if (this.arrayOfDetailsAbRoute[indexOfAddresses] == undefined) {
      detail = this.detailAboutRoute;
   }else{
     detail = this.arrayOfDetailsAbRoute[indexOfAddresses];
   }
      this.transportForm.controls['sizeD'].setValue(detail.sizeD[indexOfPackage]);
    this.transportForm.controls['sizeV'].setValue(detail.sizeV[indexOfPackage]);
    this.transportForm.controls['sizeS'].setValue(detail.sizeS[indexOfPackage]);
    this.transportForm.controls['weight'].setValue(detail.weight[indexOfPackage]);
    if (this.detailAboutRoute.vyskaNaklHrany[indexOfPackage] != undefined && this.detailAboutRoute.vyskaNaklHrany[indexOfPackage] >= 0){
      this.transportForm.controls['vyskaHranySize'].setValue(this.detailAboutRoute.vyskaNaklHrany[indexOfPackage]);
      this.transportForm.controls['vyskaHrany'].setValue("rozhoduje");
    }else{
      this.transportForm.controls['vyskaHrany'].setValue("nerozhoduje");
    }


    if (this.detailAboutRoute.stohovatelnost[indexOfPackage] != undefined &&this.detailAboutRoute.stohovatelnost[indexOfPackage] > 0){
      this.transportForm.controls['stohoSize'].setValue(this.detailAboutRoute.stohovatelnost[indexOfPackage]);
      this.transportForm.controls['stohovatelnost'].setValue("ano");
    }else{
      this.transportForm.controls['stohovatelnost'].setValue("nie");
    }

    if (this.detailAboutRoute.polohaNakladania[indexOfPackage] != undefined){

    if (this.detailAboutRoute.polohaNakladania[indexOfPackage].charAt(0) == '1'){
      this.transportForm.controls['fromBackSide'].setValue(true);
    }
    if (this.detailAboutRoute.polohaNakladania[indexOfPackage].charAt(1) == '1'){
      this.transportForm.controls['fromSide'].setValue(true);
    }
    if (this.detailAboutRoute.polohaNakladania[indexOfPackage].charAt(2) == '1'){
      this.transportForm.controls['fromUpSide'].setValue(true);
    }

    if (this.detailAboutRoute.polohaNakladania[indexOfPackage].charAt(0) == "1" ||
      this.detailAboutRoute.polohaNakladania[indexOfPackage].charAt(1) == "1" ||
      this.detailAboutRoute.polohaNakladania[indexOfPackage].charAt(2) == "1") {
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
            nameOfTowns: [],
            offerFrom: [],
            price: 0,
            priceFrom: [],
            status: [],
            takenBy: "",
            type: [],
            ponuknuteTo: "",
            offerInRoute: ""

          };
        this.change = false;
      }
    });
  }

  sendToAllDispecers(){
    this.route.forEveryone = true;
    this.saveDetailsFirst().then(() =>{
      console.log(this.route);
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
        offerInRoute: ""
      }
    })

  }

  async saveDetailsFirst(){
    console.log(this.route.detailsAboutAdresses)
    for (const [index, route] of this.arrayOfDetailsAbRoute.entries()){
      console.log(route)
      const idcko = await this.detailAboutService.createDetail(route)
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
        // createdAt: (Date.now()/1000)
      };
      console.log(route);
      this.routeService.updateRoute(route);
    this.change = false;
  }

   updateDetails(){
    var poleDetailov = [...this.arrayOfDetailsAbRoute];
    console.log(this.arrayOfDetailsAbRoute)
    var bar = new Promise((resolve, reject) => {
      poleDetailov.forEach((route, index) => {
        console.log(index);
        console.log(route)
        if (this.arrayOfDetailsAbRoute[index].id != undefined) {
          console.log("updatujem");
          this.detailAboutService.updateDetail(route, route.id)
        } else {
          console.log("mal by som vytvorit a pushnut do details");
          this.route.detailsAboutAdresses.splice(index, 0, "ric");
          this.detailAboutService.createDetail(route);
        }
      })
    });
    console.log(this.route.detailsAboutAdresses);
    bar.then(() => {
      this.sendToDriver();
    });
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

    if (this.numberOfItems <= this.detailAboutRoute.sizeV.length +1){
      this.actualItemInForm = this.numberOfItems -1;
      this.detailAboutRoute.sizeV = this.detailAboutRoute.sizeV.slice(0, this.numberOfItems -1);
      this.detailAboutRoute.sizeS = this.detailAboutRoute.sizeS.slice(0, this.numberOfItems -1)
      this.detailAboutRoute.sizeD = this.detailAboutRoute.sizeD.slice(0, this.numberOfItems -1)
      this.detailAboutRoute.weight = this.detailAboutRoute.weight.slice(0, this.numberOfItems -1)
      this.detailAboutRoute.vyskaNaklHrany = this.detailAboutRoute.vyskaNaklHrany.slice(0, this.numberOfItems -1)
      this.detailAboutRoute.polohaNakladania = this.detailAboutRoute.polohaNakladania.slice(0, this.numberOfItems -1)
      this.detailAboutRoute.stohovatelnost = this.detailAboutRoute.stohovatelnost.slice(0, this.numberOfItems -1)
      // this.detailAboutRoute[0].specRezim.slice(0, this.numberOfItems)
    }
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
}
