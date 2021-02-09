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

  latFromGoogle;
  lonFromGoogle;
  routeFromGoogle;

  numberOfItems:number = 1;
  actualItemInForm: number = 0;

  detailAboutRoute: DeatilAboutAdresses[]; //detail ohladom 1 nakladky/vykladky... kde moze byt viacej ks
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

  defaultForm = this.fb.group(  {
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
})

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
  constructor(private fb: FormBuilder, public routeStatus: RouteStatusService, private dialog: MatDialog, private dataService: DataService, private routeService: RouteService) { }

  ngOnInit(): void {
    this.minDate = new Date();
    this.detailAboutRoute = []
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
  getType(type){
    // this.type.push(type);
    // this.child.notifyMe(this.routesLat, this.routesLon, null);
  }

  getAboutRoute(aboutRoute){
    // this.aboutRoute.push(aboutRoute);
    console.log(aboutRoute);

    // this.child.notifyMe(this.routesLat, this.routesLon, null);
  }

  add(){
    this.routesTowns.push(this.routeFromGoogle);
    this.routesLon.push(this.lonFromGoogle);
    this.routesLat.push(this.latFromGoogle);
    this.status.push(-1);

    this.childGoogle.resetGoogle();
    this.labelPosition = undefined;

    this.arrayOfDetailsAbRoute.push(this.detailAboutRoute);
    this.detailAboutRoute = [];

    console.log(this.arrayOfDetailsAbRoute);

    this.change = true;
    // this.transportForm.reset();
    this.numberOfItems = 1;
    this.actualItemInForm = 0;
    this.resetFormToDefault(true);
    this.dateRange.reset();

    setTimeout(() =>
      {
        if (this.car == undefined){
          this.child.notifyMe(this.routesLat, this.routesLon,undefined, this.route);
        }else{
          this.child.notifyMe(this.routesLat, this.routesLon,this.dataService.getOneCarById(this.carId), this.route);

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
    if (allForms){
      this.casPrichodu = 'nerozhoduje';
      this.datumPrichodu = 'nerozhoduje';
    }


  }

  nextItem(){

    if (this.actualItemInForm ==this.detailAboutRoute.length){
      this.detailAboutRoute.push(this.getDetail());
      this.resetFormToDefault(false);
      this.transportForm = this.defaultForm;
      this.actualItemInForm ++;

    }else{
      this.detailAboutRoute[this.actualItemInForm] = this.getDetail();
      this.resetFormToDefault(false);
      this.actualItemInForm ++;
      this.assignToDetail();
    }
    console.log(this.detailAboutRoute);
    console.log(this.actualItemInForm)
  }

  previousItem(){
    if (this.actualItemInForm ==this.detailAboutRoute.length){
      this.detailAboutRoute.push(this.getDetail())
    }else{
      this.detailAboutRoute[this.actualItemInForm] = this.getDetail();
    }
    this.actualItemInForm --;
    this.assignToDetail();
  }

  saveDetailFormToArray(){

  }

  getDetail(): DeatilAboutAdresses{
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

    var polohaNakladania = [this.transportForm.get('fromBackSide').value,
      this.transportForm.get('fromSide').value,
      this.transportForm.get('fromUpSide').value]

    return{
      polohaNakladania: polohaNakladania,
      sizeD: this.transportForm.get('sizeD').value,
      sizeS: this.transportForm.get('sizeS').value,
      sizeV: this.transportForm.get('sizeV').value,
      // specRezim: this.transportForm.get(''),
      stohovatelnost: stohovatelnost,
      vyskaNaklHrany: vyskaNakHrany,
      weight: this.transportForm.get('weight').value,

    }

  }

  assignToDetail(){
    // console.log(this.detailAboutRoute)
    // console.log(this.detailAboutRoute[this.actualItemInForm].sizeD)

      this.transportForm.controls['sizeD'].setValue(this.detailAboutRoute[this.actualItemInForm].sizeD);
    this.transportForm.controls['sizeV'].setValue(this.detailAboutRoute[this.actualItemInForm].sizeV);
    this.transportForm.controls['sizeS'].setValue(this.detailAboutRoute[this.actualItemInForm].sizeS);
    this.transportForm.controls['weight'].setValue(this.detailAboutRoute[this.actualItemInForm].weight);
    if (this.detailAboutRoute[this.actualItemInForm].vyskaNaklHrany >= 0){
      this.transportForm.controls['vyskaHranySize'].setValue(this.detailAboutRoute[this.actualItemInForm].vyskaNaklHrany);
      this.transportForm.controls['vyskaHrany'].setValue("rozhoduje");
    }else{
      this.transportForm.controls['vyskaHrany'].setValue("nerozhoduje");
    }


    if (this.detailAboutRoute[this.actualItemInForm].stohovatelnost > 0){
      this.transportForm.controls['stohoSize'].setValue(this.detailAboutRoute[this.actualItemInForm].stohovatelnost);
      this.transportForm.controls['stohovatelnost'].setValue("ano");
    }else{
      this.transportForm.controls['stohovatelnost'].setValue("nie");
    }

    if (this.detailAboutRoute[this.actualItemInForm].polohaNakladania[0] == true){
      this.transportForm.controls['fromBackSide'].setValue(true);
    }
    if (this.detailAboutRoute[this.actualItemInForm].polohaNakladania[1] == true){
      this.transportForm.controls['fromSide'].setValue(true);
    }
    if (this.detailAboutRoute[this.actualItemInForm].polohaNakladania[2] == true){
      this.transportForm.controls['fromUpSide'].setValue(true);
    }

    if (this.detailAboutRoute[this.actualItemInForm].polohaNakladania[0] == true ||
      this.detailAboutRoute[this.actualItemInForm].polohaNakladania[1] == true ||
      this.detailAboutRoute[this.actualItemInForm].polohaNakladania[2] == true) {
      this.transportForm.controls['poziciaNakladania'].setValue("rozhoduje");
    }else{
      this.transportForm.controls['poziciaNakladania'].setValue("nerozhoduje");
    }


    // this.transportForm.controls[''].setValue(this.detailAboutRoute[this.actualItemInForm].polohaNakladania);
    // this.transportForm.controls[''].setValue(this.detailAboutRoute[this.actualItemInForm].polohaNakladania);
    // this.transportForm.controls[''].setValue(this.detailAboutRoute[this.actualItemInForm].polohaNakladania);

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

//ked sa nahodov zmensi pole, ale by som ho pohol opopovat
  sizeUpdate(){
    // if (this.detailAboutRoute. > this.numberOfItems){
    //   this.detailAboutRoute[]
    // }
  }
}
